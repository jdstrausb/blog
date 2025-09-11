import { db } from '$lib/server/db';
import { post, user } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Query posts and join with the user table to get author's username
  const posts = await db
    .select({
      title: post.title,
      slug: post.slug,
      author: user.username,
      created_at: post.createdAt
    })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .orderBy(desc(post.createdAt)); // Show newest posts first

  return { posts };
};
