import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '$lib/server/db';
import { session, user } from '$lib/server/db/schema';

// Create the Drizzle adapter
const adapter = new DrizzleSQLiteAdapter(db, session, user);

// Instantiate Lucia
export const lucia = new Lucia(adapter, {
    sessionCookie: {
          attributes: {
              // set to `true` when using https
              secure: process.env.NODE_ENV === 'production'
          }
    },
    getUserAttributes: (attributes) => {
        // This defines what data is available on the `user` object
        // in `event.locals.user`
        return {
            username: attributes.username
        };
    }
});

// IMPORTANT!
declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    username: string;
}
