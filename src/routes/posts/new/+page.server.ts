import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

// This load function will run before the page loads.
// It protects the route so only logged in users can access it.
export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        return redirect(302, '/demo/lucia/login'); // Redirect to login page
    }
    return {};
};

export const actions: Actions = {
    default: async ({ request, locals }) => {
        // Ensure a user is logged in before processing the form
        if (!locals.user) {
            // message = 'You must be logged in to create a post.';
            return redirect(302, '/demo/lucia/login'); // Redirect to login page
        }

        const form_data = await request.formData();
        const title = form_data.get('title') as string;
        const markdown_content = form_data.get('content') as string;

        if (!title || !markdown_content) {
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
                markdown_content,
                author_id: locals.user.id,
                created_at: new Date()
            });
        } catch (e) {
            console.error('Database error while creating post:', e);
            return fail(500, { message: 'An error occurred while creating the post.' });
        }

        // Redirect to the blog index or the new post's page after creation
        return redirect(302, '/blog');
    }
};

