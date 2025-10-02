import { load_post_by_slug } from '$lib/utils/posts.server';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = true;

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
