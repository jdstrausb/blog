<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="max-w-2xl mx-auto py-8 px-4">
  <article>
    <h1 class="text-4xl font-extrabold mb-2">{data.post.title}</h1>
    <p class="text-md text-gray-500 mb-8">
      By {data.post.author} on {new Date(data.post.created_at).toLocaleDateString()}
    </p>

    <!--
      The 'prose' class from @tailwindcss/typography will automatically
      style all the HTML elements generated from your markdown.
    -->
    <div class="prose lg:prose-xl">
      {@html data.post.content_html}
    </div>
  </article>
</div>
