import type { Component } from 'svelte';
// import type { Picture } from 'vite-imagetools';

export interface BlogPostMetadata {
    slug: string;
    title: string;
    summary: string;
    author: string;
    publishedAt: string;
    updatedAt?: string;
    tags: string[];
    readingTime: number;
    published: boolean;
    featuredImage?: string; // Keep this as string for serialization
}

export interface BlogPost extends BlogPostMetadata {
    component: Component;
}

type GlobModule = {
    default: Component;
    metadata?: Partial<BlogPostMetadata> & Record<string, unknown>;
};

const postModules = import.meta.glob<GlobModule>('/src/posts/**/*.{md,svx}', {
    eager: true
});

const normalizeSlug = (path: string) =>
    path
        .replace(/^\/src\/posts\//, '')
        .replace(/\.(md|svx)$/, '')
        .replace(/index$/, '')
        .replace(/\/+$/, '');

const coerceMetadata = (
    raw: Partial<BlogPostMetadata> | undefined,
    slug: string
): BlogPostMetadata | null => {
    if (!raw) return null;

    const {
        title,
        summary,
        author,
        publishedAt,
        updatedAt,
        tags = [],
        readingTime = 0,
        published = false,
        featuredImage
    } = raw;

    if (!title || !summary || !author || !publishedAt) {
        return null;
    }

    // Just pass through the string - no server-side image processing
    return {
        slug,
        title,
        summary,
        author,
        publishedAt,
        updatedAt,
        tags,
        readingTime,
        published,
        featuredImage
    };
};

const buildPosts = (): BlogPost[] => {
    const posts: BlogPost[] = [];

    for (const [path, module] of Object.entries(postModules)) {
        const slug = normalizeSlug(path);
        const meta = coerceMetadata(module.metadata, slug);

        if (!meta || !meta.published) continue;

        posts.push({
            ...meta,
            component: module.default
        });
    }

    return posts.sort((a, b) => {
        const aDate = new Date(a.publishedAt).getTime();
        const bDate = new Date(b.publishedAt).getTime();
        return Number.isNaN(bDate) || Number.isNaN(aDate) ? 0 : bDate - aDate;
    });
};

let cachedPosts: BlogPost[] | null = null;

const getPosts = () => {
    if (!cachedPosts) {
        cachedPosts = buildPosts();
    }
    return cachedPosts;
};

export const load_all_posts = async (): Promise<BlogPostMetadata[]> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return getPosts().map(({ component, ...metadata }) => metadata);
};

export const load_post_by_slug = async (slug: string): Promise<BlogPostMetadata | null> => {
    const normalized = slug.replace(/^\/+/, '');
    const posts = getPosts();
    const match = posts.find((post) => post.slug === normalized);

    if (!match) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { component, ...metadata } = match;
    return metadata;
};
