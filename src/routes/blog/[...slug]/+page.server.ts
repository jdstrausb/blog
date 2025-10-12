import { load_post_by_slug } from '$lib/utils/posts.server';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { env } from '$env/dynamic/public';
import { sendFeedbackEmail } from '$lib/server/email';
import { checkRateLimit, getClientIp } from '$lib/server/rate-limit';

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
            // Rate limiting check (5 submissions per hour per IP)
            const clientIp = getClientIp(request);
            const rateLimitResult = checkRateLimit(clientIp, {
                maxRequests: 5,
                windowMs: 60 * 60 * 1000 // 1 hour
            });

            if (!rateLimitResult.allowed) {
                const resetInMinutes = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
                return fail(429, {
                    error: `Too many feedback submissions. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? 's' : ''}.`
                });
            }

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

            // Validate message length (max 10,000 characters)
            if (message.length > 10000) {
                return fail(400, {
                    error: 'Message is too long. Please keep it under 10,000 characters.'
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

            // Sanitize postSlug - only allow alphanumeric, hyphens, underscores, and forward slashes
            const sanitizedPostSlug = postSlug.replace(/[^a-zA-Z0-9\-_\/]/g, '');
            if (!sanitizedPostSlug || sanitizedPostSlug !== postSlug) {
                return fail(400, {
                    error: 'Invalid post identifier'
                });
            }

            // Prevent email header injection - strip newlines from postTitle
            const sanitizedPostTitle = postTitle.replace(/[\r\n]/g, ' ').trim();

            // Construct base URL
            const baseUrl = env.PUBLIC_BASE_URL || 'http://localhost:5173';

            // Send feedback email using email service
            const result = await sendFeedbackEmail({
                feedbackType: feedbackType as 'positive' | 'negative',
                postTitle: sanitizedPostTitle,
                postSlug: sanitizedPostSlug,
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
