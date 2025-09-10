import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	password_hash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	user_id: text('user_id')
		.notNull()
		.references(() => user.id),
	expires_at: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const post = sqliteTable('post', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    markdown_content: text('markdown_content').notNull(),
    author_id: text('author_id')
        .notNull()
        .references(() => user.id),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
});

export const comment = sqliteTable('comment', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    content: text('content').notNull(),
    author_id: text('author_id')
        .notNull()
        .references(() => user.id),
    post_id: integer('post_id')
        .notNull()
        .references(() => post.id),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
});

export const user_relations = relations(user, ({ many }) => ({
    posts: many(post),
    comments: many(comment)
}));

export const post_relations = relations(post, ({ one, many }) => ({
    author: one(user, {
        fields: [post.author_id],
        references: [user.id]
    }),
    comments: many(comment)
}));

export const comment_relations = relations(comment, ({ one }) => ({
    author: one(user, {
        fields: [comment.author_id],
        references: [user.id]
    }),
    post: one(post, {
        fields: [comment.post_id],
        references: [post.id]
    })
}));

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Post = typeof post.$inferSelect;

export type Comment = typeof comment.$inferSelect;
