CREATE TABLE `post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`markdown_content` text NOT NULL,
	`author` text NOT NULL,
	`created_at` integer DEFAULT '"2025-09-24T20:21:00.331Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_slug_unique` ON `post` (`slug`);