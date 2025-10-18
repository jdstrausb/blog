<script lang="ts">
    import { page } from '$app/state';
    let { class: class_name = '' }: { class?: string } = $props();

    const path = $derived(page.url.pathname);
</script>

<div class="flex flex-col items-center justify-between gap-4 sm:flex-row {class_name}">
    <h1 class="text-center font-serif text-4xl font-bold text-[var(--text-color)] sm:text-left">
        <a href="/">Jamie Strausbaugh</a>
    </h1>
    <nav class="flex items-center gap-4">
        {#if path === '/about'}
            <a
                href="/"
                class="text-[var(--nav-link-color)] hover:text-[var(--nav-link-hover-color)] hover:underline"
                >Blog</a
            >
        {:else}
            <a
                href="/about"
                class="text-[var(--nav-link-color)] hover:text-[var(--nav-link-hover-color)] hover:underline"
                >About</a
            >
            <!-- <a
                href="/posts/new"
                class="rounded-md bg-[var(--primary-button-bg)] px-4 py-2 text-[var(--primary-button-text)] transition hover:bg-[var(--primary-button-hover-bg)]"
            >
                New Post
            </a> -->
        {/if}
    </nav>
</div>
