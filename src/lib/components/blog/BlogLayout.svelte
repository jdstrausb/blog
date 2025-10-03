<script lang="ts">
    import TableOfContents from './TableOfContents.svelte';
    import Breadcrumb from './Breadcrumb.svelte';
    import ShareWidget from './ShareWidget.svelte';
    import ScrollToTopButton from './ScrollToTopButton.svelte';
    import type { Picture } from 'vite-imagetools';
    import { getEnhancedImage } from '$lib/utils/enhanced-images.client';

    interface Props {
        title?: string;
        summary?: string;
        author?: string;
        publishedAt?: string;
        updatedAt?: string | undefined;
        tags?: string[];
        readingTime?: number;
        featuredImage?: string | undefined; // Now always a string from server
        slug?: string;
        children?: import('svelte').Snippet;
    }

    let {
        title = '',
        summary = '',
        author = '',
        publishedAt = '',
        updatedAt = undefined,
        tags = [],
        readingTime = 0,
        featuredImage = undefined,
        slug = '',
        children
    }: Props = $props();

    // Resolve enhanced image on client-side
    const resolvedFeaturedImage = $derived.by((): Picture | string | undefined => {
        if (!featuredImage) return undefined;

        console.log('Resolving image for:', featuredImage);
        const enhanced = getEnhancedImage(featuredImage);

        if (enhanced) {
            console.log('Found enhanced version:', enhanced);
            return enhanced;
        } else {
            console.log('No enhanced version, using string:', featuredImage);
            return featuredImage;
        }
    });

    let articleContainer = $state<HTMLElement | null>(null);

    const publishedDate = publishedAt ? new Date(publishedAt) : undefined;
    const updatedDate = updatedAt ? new Date(updatedAt) : undefined;

    const formatted = (date?: Date) =>
        date && !Number.isNaN(date.getTime())
            ? date.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
              })
            : undefined;
</script>

<svelte:head>
    {#if title}<title>{title}</title>{/if}
    {#if summary}<meta name="description" content={summary} />{/if}
    {#if author}<meta name="author" content={author} />{/if}
    {#if title}<meta property="og:title" content={title} />{/if}
    {#if summary}<meta property="og:description" content={summary} />{/if}
    {#if resolvedFeaturedImage}
        {@const resolved = resolvedFeaturedImage}
        <meta
            property="og:image"
            content={typeof resolved === 'string' ? resolved : resolved.img.src}
        />
    {/if}
    <meta property="og:type" content="article" />
</svelte:head>

<article class="mx-auto max-w-6xl px-4 py-10 lg:py-16">
    <header class="mb-12 border-b border-gray-200 pb-6 dark:border-gray-700">
        <!-- Breadcrumb Navigation -->
        <Breadcrumb {title} />

        {#if tags?.length}
            <div
                class="mb-4 flex flex-wrap gap-2 text-xs tracking-wide text-[var(--blog-tag-text)] uppercase"
            >
                {#each tags as tag}
                    <span
                        class="rounded-full border border-[var(--blog-tag-border)] bg-[var(--blog-tag-bg)] px-2 py-1 text-[var(--blog-tag-text)]"
                        >{tag}</span
                    >
                {/each}
            </div>
        {/if}

        {#if title}
            <h1 class="text-4xl font-extrabold tracking-tight text-[var(--blog-title-color)]">
                {title}
            </h1>
        {/if}

        <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--blog-meta-color)]">
            {#if author}
                <span>By {author}</span>
            {/if}
            {#if publishedDate}
                <span>• Published {formatted(publishedDate)}</span>
            {/if}\
            {#if updatedDate}
                <span>• Updated {formatted(updatedDate)}</span>
            {/if}
            {#if readingTime}
                <span>• {readingTime} min read</span>
            {/if}
        </div>
    </header>

    <div class="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div>
            {#if resolvedFeaturedImage}
                {@const resolved = resolvedFeaturedImage}
                <div class="mb-8 overflow-hidden rounded-lg">
                    {#if typeof resolved === 'string'}
                        <img
                            src={resolved}
                            alt={title}
                            class="h-auto w-full object-cover"
                            loading="lazy"
                        />
                    {:else}
                        <enhanced:img src={resolved} alt={title} class="w-full" />
                    {/if}
                </div>
            {/if}

            <div class="prose prose-lg max-w-none dark:prose-invert" bind:this={articleContainer}>
                {@render children?.()}
            </div>
        </div>
        <aside class="self-start lg:sticky lg:top-24">
            <TableOfContents {articleContainer} />
        </aside>
    </div>
</article>

<section class="share-section">
    <ShareWidget postTitle={title} postSlug={slug} />
</section>

<section class="feedback-section">

</section>

<!-- Scroll to Top Button -->
<ScrollToTopButton />
