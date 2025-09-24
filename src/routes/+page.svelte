<!-- src/routes/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-2xl px-4 py-8">
    <PageHeader class="mb-12" />

    <h2 class="mb-8 text-3xl font-bold">My Blog</h2>

    <div class="space-y-8">
        {#each data.posts as post}
            <article>
                <h2 class="text-2xl font-semibold hover:text-indigo-600">
                    <a href={`/${post.slug}`}>{post.title}</a>
                </h2>
                <p class="mt-1 text-sm text-gray-500">
                    By {post.author} on {new Date(post.created_at).toLocaleDateString()}
                </p>
            </article>
        {:else}
            <p>
                No posts yet. <a href="/posts/new" class="text-indigo-600 hover:underline"
                    >Write the first one!</a
                >
            </p>
        {/each}
    </div>
</div>
