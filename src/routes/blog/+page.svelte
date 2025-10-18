<script lang="ts">
    import type { PageData } from './$types';
    import Breadcrumb from '../../lib/components/blog/Breadcrumb.svelte';
    import BlogPostCard from '$lib/components/blog/BlogPostCard.svelte';

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Blog</title>
    <meta name="description" content="Latest posts from the SvelteKit blog." />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10 lg:py-16">
    <header class="mb-12">
        <!-- Breadcrumb Navigation -->
        <Breadcrumb />
        <h1 class="font-serif text-4xl font-bold tracking-tight text-[var(--text-color)]">Blog</h1>
        <p class="mt-3 text-lg text-[var(--blog-description-color)]">
            Long-form tutorials, updates, and deep dives powered by MDSvex.
        </p>
    </header>

    {#if data.posts.length}
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {#each data.posts as post}
                <BlogPostCard {post} />
            {/each}
        </div>
    {:else}
        <div
            class="rounded-lg border border-dashed border-[var(--blog-empty-border)] p-10 text-center"
        >
            <h2 class="font-serif text-2xl font-semibold text-[var(--blog-empty-heading)]">
                No posts yet
            </h2>
            <p class="mt-2 text-[var(--blog-empty-text)]">
                Create a new `.svx` file under <code>src/posts/</code> to publish your first article.
            </p>
        </div>
    {/if}
</div>
