import { load_post_by_slug } from '$lib/utils/posts.server';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { sendFeedbackEmail } from '$lib/server/email';

// Note: prerender disabled to support form actions
export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
    const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug;
    const post = await load_post_by_slug(slug);

    if (!post) {
        throw error(404, 'Post not found');
    }

    return {
        post
    };
};

export const actions: Actions = {
    submitFeedback: async ({ request }) => {
        try {
            const formData = await request.formData();
            const feedbackType = formData.get('feedbackType') as string;
            const postTitle = formData.get('postTitle') as string;
            const postSlug = formData.get('postSlug') as string;
            const name = formData.get('name') as string | null;
            const email = formData.get('email') as string | null;
            const message = formData.get('message') as string;

            // Validate required fields
            if (!feedbackType || !postTitle || !postSlug || !message?.trim()) {
                return fail(400, {
                    error: 'Please provide all required information'
                });
            }

            // Validate feedback type
            if (feedbackType !== 'positive' && feedbackType !== 'negative') {
                return fail(400, {
                    error: 'Invalid feedback type'
                });
            }

            // Validate email format if provided
            if (email && email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    return fail(400, {
                        error: 'Please enter a valid email address'
                    });
                }
            }

            // Construct base URL
            const baseUrl = PUBLIC_BASE_URL || 'http://localhost:5173';

            // Send feedback email using email service
            const result = await sendFeedbackEmail({
                feedbackType: feedbackType as 'positive' | 'negative',
                postTitle,
                postSlug,
                name: name || undefined,
                email: email || undefined,
                message,
                baseUrl
            });

            if (!result.success) {
                return fail(500, {
                    error: result.error || 'Your email couldn\'t be sent at this time'
                });
            }

            return { success: true };
        } catch (err) {
            console.error('[FeedbackWidget Error] Unexpected error:', err);
            return fail(500, {
                error: 'Your message failed to send due to an application error.'
            });
        }
    }
};
