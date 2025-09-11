import { hash, verify } from '@node-rs/argon2';
import { generateId } from 'lucia'; // Use Lucia's ID generator
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) {
        return redirect(302, '/demo/lucia');
    }
    return {};
};

export const actions: Actions = {
    login: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        if (!validate_username(username)) {
            return fail(400, { message: 'Invalid username (min 3, max 31 characters, alphanumeric only)' });
        }
        if (!validate_password(password)) {
            return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
        }

        const [existing_user] = await db
            .select()
            .from(table.user)
            .where(eq(table.user.username, username));

        if (!existing_user) {
            return fail(400, { message: 'Incorrect username or password' });
        }

        const valid_password = await verify(existing_user.passwordHash, password);
        if (!valid_password) {
            return fail(400, { message: 'Incorrect username or password' });
        }

        // Create a session with Lucia
        const session = await lucia.createSession(existing_user.id, {});
        const session_cookie = lucia.createSessionCookie(session.id);
        event.cookies.set(session_cookie.name, session_cookie.value, {
            path: '.',
            ...session_cookie.attributes
        });

        return redirect(302, '/demo/lucia');
      },
      register: async (event) => {
          const formData = await event.request.formData();
          const username = formData.get('username');
          const password = formData.get('password');

        if (!validate_username(username)) {
            return fail(400, { message: 'Invalid username' });
        }
        if (!validate_password(password)) {
            return fail(400, { message: 'Invalid password' });
        }

        const userId = generateId(15); // Lucia's built-in ID generator
        const passwordHash = await hash(password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });

        try {
            // Drizzle will throw an error if username is not unique
            await db.insert(table.user).values({ id: userId, username, passwordHash });

            // Create a session with Lucia
            const session = await lucia.createSession(userId, {});
            const session_cookie = lucia.createSessionCookie(session.id);
            event.cookies.set(session_cookie.name, session_cookie.value, {
                path: '.',
                ...session_cookie.attributes
            });
        } catch (e) {
            console.error('Error during user registration:', e);
            // This is a common error when the username is already taken
            return fail(400, { message: 'Username already taken' });
        }
        return redirect(302, '/demo/lucia');
    }
};

// --- Validation functions remain the same ---
function validate_username(username: unknown): username is string {
    return (
        typeof username === 'string' &&
        username.length >= 3 &&
        username.length <= 31 &&
        /^[a-z0-9_-]+$/.test(username)
    );
}

function validate_password(password: unknown): password is string {
    return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
