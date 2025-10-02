import { load_all_posts } from '$lib/utils/posts.server';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = async () => {
    const posts = await load_all_posts();

    return {
        posts
    };
};
