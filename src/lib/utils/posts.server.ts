import type { Component } from 'svelte';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
// import type { Picture } from 'vite-imagetools';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Calculate word count from raw markdown content
 * Strips frontmatter, HTML/Svelte tags, code blocks, inline code, and URLs
 */
const calculateWordCount = (content: string): number => {
    // Strip frontmatter
    let text = content.replace(/^---[\s\S]*?---/, '');

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');

    // Remove inline code
    text = text.replace(/`[^`]*`/g, '');

    // Remove HTML/Svelte tags
    text = text.replace(/<[^>]*>/g, '');

    // Remove URLs
    text = text.replace(/https?:\/\/[^\s]+/g, '');

    // Split by whitespace and filter empty strings
    const words = text.split(/\s+/).filter(word => word.length > 0);

    // Round to nearest 50
    const count = words.length;
    return Math.round(count / 50) * 50;
};

/**
 * Convert author name to slug for avatar filename
 */
const authorNameToSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

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
    wordCount?: number;
    authorAvatar?: string;
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
    slug: string,
    filePath: string
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

    // Read file content for word count calculation
    let wordCount: number | undefined;
    try {
        const projectRoot = path.resolve(__dirname, '../../../');
        const fullPath = path.join(projectRoot, filePath.replace(/^\//, ''));
        const content = readFileSync(fullPath, 'utf-8');
        wordCount = calculateWordCount(content);
    } catch (error) {
        console.warn(`Could not calculate word count for ${filePath}:`, error);
        wordCount = undefined;
    }

    // Generate author avatar path
    const authorSlug = authorNameToSlug(author);
    const authorAvatar = `/authors/${authorSlug}.png`;

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
        featuredImage,
        wordCount,
        authorAvatar
    };
};

const buildPosts = (): BlogPost[] => {
    const posts: BlogPost[] = [];

    for (const [path, module] of Object.entries(postModules)) {
        const slug = normalizeSlug(path);
        const meta = coerceMetadata(module.metadata, slug, path);

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
