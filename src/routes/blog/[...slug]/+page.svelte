<script lang="ts">
    import type { Component } from 'svelte';
    import type { PageData } from './$types';

    type GlobModule = {
        default: Component;
    };

    let { data }: { data: PageData } = $props();

    const modules = import.meta.glob<GlobModule>('/src/posts/**/*.{md,svx}');

    const resolveLoader = (slug: string) => {
        const normalized = slug.replace(/^\/+/, '');
        const candidates = [
            `/src/posts/${normalized}.svx`,
            `/src/posts/${normalized}.md`,
            `/src/posts/${normalized}/index.svx`,
            `/src/posts/${normalized}/index.md`
        ];

        for (const candidate of candidates) {
            const loader = modules[candidate];
            if (loader) return loader;
        }

        return null;
    };

    const loadPostComponent = async (slug: string) => {
        const loader = resolveLoader(slug);
        if (!loader) return null;

        const mod = await loader();
        return mod.default ?? null;
    };

    let postComponentPromise = $state(loadPostComponent(data.post.slug));

    $effect(() => {
        const slug = data.post.slug;
        postComponentPromise = loadPostComponent(slug);
    });

    const postProps = {
        title: data.post.title,
        summary: data.post.summary,
        author: data.post.author,
        publishedAt: data.post.publishedAt,
        updatedAt: data.post.updatedAt,
        tags: data.post.tags,
        readingTime: data.post.readingTime,
        featuredImage: data.post.featuredImage,
        slug: data.post.slug
    };
</script>

{#await postComponentPromise}
    <p>Loading post...</p>
{:then PostComponent}
    {#if PostComponent}
        <PostComponent {...postProps} />
    {:else}
        <p>Post content is unavailable.</p>
    {/if}
{:catch}
    <p>Post content is unavailable.</p>
{/await}
