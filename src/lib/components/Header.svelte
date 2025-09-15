<script lang="ts">
  import { page } from '$app/state';
  import ThemeToggle from './ThemeToggle.svelte';
  const path = $derived(page.url.pathname);
</script>

<header class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
  <h1 class="text-4xl font-bold text-center sm:text-left">
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
        >New Post</a
      >
    {/if}
    <ThemeToggle />
  </nav>
</header>

