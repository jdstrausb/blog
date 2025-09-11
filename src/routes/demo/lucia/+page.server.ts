import { lucia } from '$lib/server/auth'; // Import Lucia
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/demo/lucia/login');
    }
    return {
        user: locals.user
    };
};

export const actions: Actions = {
    logout: async (event) => {
        // Ensure there's a session to invalidate
        if (!event.locals.session) {
          return fail(401);
        }
        // Invalidate the session with Lucia
        await lucia.invalidateSession(event.locals.session.id);

        // Create a blank cookie to clear the session from the browser
        const session_cookie = lucia.createBlankSessionCookie();
        event.cookies.set(session_cookie.name, session_cookie.value, {
            path: '.',
            ...session_cookie.attributes
        });

        return redirect(302, '/demo/lucia/login');
    }
};
