<script lang="ts">
  import { page } from '$app/state';
  let { class: class_name = '' }: { class?: string } = $props();

  const path = $derived(page.url.pathname);
</script>

<div class="flex flex-col items-center justify-between gap-4 sm:flex-row {class_name}">
    <h1 class="text-center text-4xl font-bold sm:text-left">
        <a href="/">Jamie Strausbaugh</a>
    </h1>
    <nav class="flex items-center gap-4">
        {#if path === '/about'}
            <a href="/" class="text-indigo-600 hover:underline">Blog</a>
        {:else}
            <a href="/about" class="text-indigo-600 hover:underline">About</a>
            <a
                href="/posts/new"
                class="rounded-md bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
            >
                New Post
            </a>
        {/if}
    </nav>
</div>
