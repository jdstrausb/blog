<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="max-w-2xl mx-auto py-8 px-4">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold">My Blog</h1>
		<a href="/posts/new" class="rounded-md bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700">New Post</a>
	</div>

	<div class="space-y-8">
		{#each data.posts as post}
			<article>
				<h2 class="text-2xl font-semibold hover:text-indigo-600">
					<a href={`/blog/${post.slug}`}>{post.title}</a>
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
