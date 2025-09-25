import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request }) => {

        const form_data = await request.formData();
        const title = form_data.get('title') as string;
        const markdownContent = form_data.get('content') as string;

        // Define author name as a constant here for now
        const author = 'Jamie Strausbaugh';

        if (!title || !markdownContent) {
            return fail(400, { message: 'Title and content are required.' });
        }

        // Create a URL-friendly slug from the title
        const slug = title
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w-]+/g, ''); // Remove all non-word chars

        try {
            // Insert the new post into the database
            await db.insert(table.post).values({
                title,
                slug: `${slug}-${Date.now()}`, // Ensure uniqueness by appending timestamp
                markdownContent,
                author: author,
                createdAt: new Date()
            });
        } catch (e) {
            console.error('Database error while creating post:', e);
            return fail(500, { message: 'An error occurred while creating the post.' });
        }

        // Redirect to the blog index after creation
        return redirect(302, '/');
    }
};

