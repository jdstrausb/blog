<script lang="ts">
    import TableOfContents from './TableOfContents.svelte';
    import Breadcrumb from './Breadcrumb.svelte';
    import ShareWidget from './ShareWidget.svelte';
    import FeedbackWidget from './FeedbackWidget.svelte';
    import Footer from './Footer.svelte';
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
        wordCount?: number;
        authorAvatar?: string;
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
        wordCount = undefined,
        authorAvatar = undefined,
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

    // Format publication date as "Month YYYY"
    const formatPublicationDate = (date?: Date): string => {
        if (!date || Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };

    // Check if updated date should be shown (more than 1 day difference from published)
    const shouldShowUpdatedDate = $derived.by(() => {
        if (!publishedDate || !updatedDate) return false;
        const diffMs = updatedDate.getTime() - publishedDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays > 1;
    });

    // Format word count display
    const formatWordCount = (count?: number): string => {
        if (!count) return '';
        return `~${count} words`;
    };

    // Resolve author avatar with fallback
    const resolvedAuthorAvatar = $derived(authorAvatar || '/authors/default-avatar.svg');
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

<article
    class="mx-auto max-w-[var(--article-max-width)] px-[var(--article-padding-x-mobile)] py-8 md:px-[var(--article-padding-x-tablet)] md:py-12 lg:px-[var(--article-padding-x-desktop)]"
>
    <!-- Header Section: Breadcrumb → Title → Summary → Featured Image → Metadata -->
    <header class="mb-10 space-y-6 md:space-y-8">
        <!-- Breadcrumb Navigation -->
        <Breadcrumb {title} />

        <!-- Article Title (H1) - Single Display -->
        {#if title}
            <h1
                class="font-[family-name:var(--font-serif)] text-3xl leading-tight font-bold tracking-tight text-[var(--blog-title-color)] md:text-4xl lg:text-5xl"
            >
                {title}
            </h1>
        {/if}

        <!-- Article Summary/Subtitle -->
        {#if summary}
            <p class="text-lg leading-relaxed text-[var(--blog-description-color)] md:text-xl">
                {summary}
            </p>
        {/if}

        <!-- Featured Image -->
        {#if resolvedFeaturedImage}
            {@const resolved = resolvedFeaturedImage}
            <div class="overflow-hidden">
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

        <!-- Metadata Section -->
        <div class="space-y-4 md:space-y-6">
            <!-- Tags Row (Right-aligned pills) -->
            {#if tags?.length}
                <ul class="flex flex-wrap items-center justify-end gap-2">
                    {#each tags as tag}
                        {@const tagSlug = tag
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '')
                            .replace(/\s+/g, '-')}
                        <li>
                            <a
                                href="/blog/categories/{tagSlug}"
                                class="inline-block rounded-[var(--tag-pill-radius)] border border-[var(--tag-pill-border)] bg-[var(--tag-pill-bg)] px-[var(--tag-pill-padding-x)] py-[var(--tag-pill-padding-y)] text-xs font-medium tracking-wide text-[var(--tag-pill-text)] uppercase transition-colors hover:brightness-110"
                                aria-label="View posts in {tag} category"
                            >
                                {tag}
                            </a>
                        </li>
                    {/each}
                </ul>
            {/if}

            <!-- Author Info Row -->
            {#if author}
                <div class="flex items-center gap-3">
                    <img
                        src={resolvedAuthorAvatar}
                        alt={author}
                        class="h-[var(--author-avatar-size)] w-[var(--author-avatar-size)] rounded-full object-cover"
                        onerror={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                                '/authors/default-avatar.svg';
                        }}
                    />
                    <div class="flex flex-col">
                        <p class="font-[var(--author-name-weight)] text-[var(--text-color)]">
                            {author}
                        </p>
                        <p class="text-sm text-[var(--author-title-color)]">
                            Developer, administrator
                        </p>
                    </div>
                </div>
            {/if}

            <!-- Horizontal Border -->
            <div class="h-px w-full bg-[var(--metadata-border-color)]"></div>

            <!-- Reading Stats & Publication Date Row -->
            <div
                class="flex flex-col gap-2 text-sm text-[var(--metadata-text-subtle)] sm:flex-row sm:items-start sm:justify-between"
            >
                <!-- Left: Reading Stats -->
                <div class="flex flex-col gap-1">
                    <p>
                        {#if readingTime}
                            {readingTime} min read{#if wordCount}, {formatWordCount(wordCount)}{/if}
                        {:else if wordCount}
                            {formatWordCount(wordCount)}
                        {/if}
                    </p>
                </div>

                <!-- Right: Publication Date -->
                <div class="flex flex-col gap-1 sm:text-right">
                    {#if publishedDate}
                        <p class="capitalize">
                            {formatPublicationDate(publishedDate)}
                        </p>
                    {/if}
                    {#if shouldShowUpdatedDate && updatedDate}
                        <p class="text-xs">
                            Updated {formatPublicationDate(updatedDate)}
                        </p>
                    {/if}
                </div>
            </div>
        </div>
    </header>

    <!-- Table of Contents (Mobile/Tablet - Below Metadata) -->
    <div class="mb-8 lg:hidden">
        <TableOfContents {articleContainer} />
    </div>

    <!-- Content Section with Desktop TOC Sidebar -->
    <div class="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <!-- Article Content -->
        <div class="min-w-0 overflow-hidden">
            <div class="prose prose-lg max-w-none dark:prose-invert" bind:this={articleContainer}>
                {@render children?.()}
            </div>
        </div>

        <!-- Table of Contents (Desktop - Sidebar) -->
        <aside class="hidden self-start lg:sticky lg:top-24 lg:block">
            <TableOfContents {articleContainer} />
        </aside>
    </div>
</article>

<section class="share-section">
    <ShareWidget postTitle={title} postSlug={slug} />
</section>

<!-- <hr class="my-8 border-t border-[var(--muted-color)]" /> -->

<section class="feedback-section">
    <FeedbackWidget postTitle={title} postSlug={slug} />
</section>

<!-- Footer provides spacing for ScrollToTopButton -->
<Footer />

<!-- Scroll to Top Button -->
<ScrollToTopButton />
