<script lang="ts">
  import type { PageData } from './$types';
  import Header from '$lib/components/Header.svelte';

  let { data }: { data: PageData } = $props();
</script>

<div class="max-w-2xl mx-auto py-8 px-4">
  <Header />

  <h2 class="text-3xl font-bold mb-8">My Blog</h2>

  <div class="space-y-8">
    {#each data.posts as post}
      <article>
        <h2 class="text-2xl font-semibold hover:text-indigo-600">
          <a href={`/${post.slug}`}>{post.title}</a>
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          By {post.author} on {new Date(post.created_at).toLocaleDateString()}
        </p>
      </article>
    {:else}
      <p>No posts yet. <a href="/posts/new" class="text-indigo-600 hover:underline">Write the first one!</a></p>
    {/each}
  </div>
</div>
