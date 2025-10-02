<script lang="ts">
    interface Props {
        title?: string;
    }

    let { title }: Props = $props();
</script>

<div class="mb-6 flex items-center gap-2 text-sm text-[var(--blog-meta-color)]">
    <!-- Home Icon -->
    <a
        href="/"
        class="flex items-center text-[var(--nav-link-color)] hover:text-[var(--nav-link-hover-color)] transition-colors"
        aria-label="Home"
    >
        <svg
            class="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"/>
        </svg>
    </a>

    <!-- Separator -->
    <span class="text-[var(--blog-meta-color)]">/</span>

    <!-- Blog Link -->
    <a
        href="/blog"
        class="text-[var(--nav-link-color)] hover:text-[var(--nav-link-hover-color)] transition-colors"
    >
        Blog
    </a>

    {#if title}
        <!-- Separator -->
        <span class="text-[var(--blog-meta-color)]">/</span>

        <!-- Current Post Title (non-clickable) -->
        <span class="font-medium text-[var(--blog-title-color)] truncate">
            {title}
        </span>
    {/if}
</div>