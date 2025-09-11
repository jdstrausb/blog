import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// --- TABLES ---

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  // JS: passwordHash, DB column: 'password_hash'
  passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  // JS: userId, DB column: 'user_id' (REQUIRED BY LUCIA)
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  // JS: expiresAt, DB column: 'expires_at' (REQUIRED BY LUCIA)
  expiresAt: integer('expires_at').notNull()
});

export const post = sqliteTable('post', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  // JS: markdownContent, DB column: 'markdown_content'
  markdownContent: text('markdown_content').notNull(),
  // JS: authorId, DB column: 'author_id'
  authorId: text('author_id')
    .notNull()
    .references(() => user.id),
  // JS: createdAt, DB column: 'created_at'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
});

export const comment = sqliteTable('comment', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  // JS: authorId, DB column: 'author_id'
  authorId: text('author_id')
    .notNull()
    .references(() => user.id),
  // JS: postId, DB column: 'post_id'
  postId: integer('post_id')
    .notNull()
    .references(() => post.id),
  // JS: createdAt, DB column: 'created_at'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
});


// --- RELATIONS ---

export const userRelations = relations(user, ({ many }) => ({
  posts: many(post),
  comments: many(comment)
}));

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(user, {
    // IMPORTANT: Use the new camelCase property names here
    fields: [post.authorId],
    references: [user.id]
  }),
  comments: many(comment)
}));

export const commentRelations = relations(comment, ({ one }) => ({
  author: one(user, {
    // IMPORTANT: Use the new camelCase property names here
    fields: [comment.authorId],
    references: [user.id]
  }),
  post: one(post, {
    // IMPORTANT: Use the new camelCase property names here
    fields: [comment.postId],
    references: [post.id]
  })
}));


// --- TYPE EXPORTS ---

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Post = typeof post.$inferSelect;
export type Comment = typeof comment.$inferSelect;
