<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<div class="max-w-2xl mx-auto py-8 px-4">
  <h1 class="text-3xl font-bold mb-6">Create a New Post</h1>

  <form method="POST" use:enhance class="space-y-6">
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
      <input
        type="text"
        id="title"
        name="title"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label for="content" class="block text-sm font-medium text-gray-700">Content (Markdown)</label>
      <textarea
        id="content"
        name="content"
        rows="10"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
      ></textarea>
    </div>

    {#if form?.message}
      <p class="text-red-500">{form.message}</p>
    {/if}

    <div>
      <button
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Publish
      </button>
    </div>
  </form>
</div>
