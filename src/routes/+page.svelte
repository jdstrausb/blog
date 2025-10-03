<!-- src/routes/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import PageHeader from '$lib/components/PageHeader.svelte';

    let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-2xl px-4 py-8">
    <PageHeader class="mb-12" />

    <h2 class="mb-8 font-serif text-3xl font-bold text-[var(--text-color)]">My Blog</h2>

    <div class="space-y-8">
        {#each data.posts as post}
            <article>
                <h3
                    class="font-serif text-2xl font-semibold text-[var(--homepage-title-color)] hover:text-[var(--homepage-title-hover-color)]"
                >
                    <a href={`/blog/${post.slug}`}>{post.title}</a>
                </h3>
                <p class="mt-1 text-sm text-[var(--homepage-meta-color)]">
                    By {post.author} on {new Date(post.publishedAt).toLocaleDateString()}
                </p>
                {#if post.summary}
                    <p class="mt-2 text-[var(--homepage-summary-color)]">{post.summary}</p>
                {/if}
            </article>
        {/each}

        {#if !data.posts.length}
            <p class="text-[var(--homepage-empty-text-color)]">
                No posts yet. Create a new markdown file under <code>src/posts/</code> to publish your
                first story.
            </p>
        {/if}
    </div>

    <div class="mt-10">
        <a
            class="inline-flex items-center gap-2 rounded-md bg-[var(--primary-button-bg)] px-4 py-2 font-semibold text-[var(--primary-button-text)] shadow-sm transition hover:bg-[var(--primary-button-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-button-focus-outline)]"
            href="/blog"
        >
            View all posts
            <span aria-hidden="true">→</span>
        </a>
    </div>
</div>
