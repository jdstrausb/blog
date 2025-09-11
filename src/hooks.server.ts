import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Get session ID from the cookie
    const session_id = event.cookies.get(lucia.sessionCookieName);
    if (!session_id) {
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event);
    }

    // Validate the session
    const { session, user } = await lucia.validateSession(session_id);

    // If session is fresh, create a new cookie with an updated expiration time
    if (session?.fresh) {
        const session_cookie = lucia.createSessionCookie(session.id);
        event.cookies.set(session_cookie.name, session_cookie.value, {
            path: '.',
            ...session_cookie.attributes
        });
    }

    // If session is invalid, create a blank cookie to remove the old one
    if (!session) {
        const session_cookie = lucia.createBlankSessionCookie();
        event.cookies.set(session_cookie.name, session_cookie.value, {
            path: '.',
            ...session_cookie.attributes
        });
    }

    // Make user and session available on `event.locals`
    event.locals.user = user;
    event.locals.session = session;

    return resolve(event);
};
