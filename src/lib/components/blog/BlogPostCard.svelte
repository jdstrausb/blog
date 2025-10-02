<script lang="ts">
    export interface BlogPostCardData {
        slug: string;
        title: string;
        summary: string;
        publishedAt: string;
        tags?: string[];
        readingTime?: number;
    }

    let { post }: { post: BlogPostCardData } = $props();

    const formattedDate = $derived.by(() => {
        const created = new Date(post.publishedAt);
        return Number.isNaN(created.getTime())
            ? post.publishedAt
            : created.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
              });
    });
</script>

<article
    class="flex h-full flex-col rounded-lg border border-[var(--blog-card-border)] bg-[var(--blog-card-bg)] p-6 transition hover:-translate-y-0.5"
    style="box-shadow: 0 1px 2px 0 var(--blog-card-shadow);"
    onmouseenter={(e) =>
        (e.currentTarget.style.boxShadow =
            '0 4px 6px -1px var(--blog-card-shadow-hover), 0 2px 4px -1px var(--blog-card-shadow-hover)')}
    onmouseleave={(e) => (e.currentTarget.style.boxShadow = '0 1px 2px 0 var(--blog-card-shadow)')}
>
    <div
        class="mb-3 flex flex-wrap gap-2 text-xs tracking-wide text-[var(--blog-card-tag-category-color)] uppercase"
    >
        {#if post.tags?.length}
            {#each post.tags.slice(0, 3) as tag}
                <span
                    class="rounded-full border border-[var(--blog-tag-border)] bg-[var(--blog-tag-bg)] px-2 py-1 text-[var(--blog-tag-text)]"
                    >{tag}</span
                >
            {/each}
        {/if}
    </div>

    <h2 class="text-2xl font-semibold text-[var(--blog-card-title-color)]">
        <a href={`/blog/${post.slug}`} class="hover:text-[var(--blog-card-tag-category-color)]"
            >{post.title}</a
        >
    </h2>

    {#if post.summary}
        <p class="mt-3 flex-1 text-sm text-[var(--blog-card-summary-color)]">{post.summary}</p>
    {/if}

    <footer class="mt-6 text-sm text-[var(--blog-card-footer-color)]">
        <span>{formattedDate}</span>
        {#if post.readingTime}
            <span> • {post.readingTime} min read</span>
        {/if}
    </footer>
</article>
