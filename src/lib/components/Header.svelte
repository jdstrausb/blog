<script lang="ts">
  import { page } from '$app/state';
  const path = $derived(page.url.pathname);
</script>

<header class="flex justify-between items-center mb-12">
  <h1 class="text-4xl font-bold">
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
  </nav>
</header>

