CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`body` text,
	`created_on` integer,
	`updated_on` integer
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text,
	`user_id` text,
	`post_id` integer,
	`created_on` integer,
	`updated_on` integer
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`body` text,
	`user_id` text,
	`category_id` text,
	`created_on` integer,
	`updated_on` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text,
	`lastName` text,
	`email` text,
	`password` text,
	`role` text,
	`created_on` integer,
	`updated_on` integer
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `comments` (`id`);--> statement-breakpoint
CREATE INDEX `post_idx` ON `comments` (`id`);