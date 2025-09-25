import { db } from '$lib/server/db';
import { post } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Query posts and join with the user table to get author's username
  const posts = await db
    .select({
      title: post.title,
      slug: post.slug,
      author: post.author,
      created_at: post.createdAt
    })
    .from(post)
    .orderBy(desc(post.createdAt)); // Show newest posts first

  return { posts };
};
