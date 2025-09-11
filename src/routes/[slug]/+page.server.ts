import { db } from '$lib/server/db';
import { post, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const results = await db
    .select({
      title: post.title,
      markdown_content: post.markdownContent,
      author: user.username,
      created_at: post.createdAt
    })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(eq(post.slug, params.slug));

  const blog_post = results.at(0);

  if (!blog_post) {
    throw error(404, 'Post not found');
  }

  // Convert markdown to HTML on the server
  const content_html = await marked.parse(blog_post.markdown_content);

  return {
    post: {
      ...blog_post,
      content_html // Pass the rendered HTML to the page
    }
  };
};

