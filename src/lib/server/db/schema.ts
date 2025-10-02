import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// --- TABLES ---

export const post = sqliteTable('post', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    // JS: markdownContent, DB column: 'markdown_content'
    markdownContent: text('markdown_content').notNull(),
    // JS: author, DB column: 'author'
    author: text('author').notNull(),
    // JS: createdAt, DB column: 'created_at'
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
});

// --- TYPE EXPORTS ---

export type Post = typeof post.$inferSelect;
