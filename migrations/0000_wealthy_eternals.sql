CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`body` text,
	`created_on` integer,
	`updated_on` integer
);

CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text,
	`user_id` text,
	`post_id` integer,
	`created_on` integer,
	`updated_on` integer
);

CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`body` text,
	`user_id` text,
	`created_on` integer,
	`updated_on` integer
);

CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`password` text,
	`role` text,
	`created_on` integer,
	`updated_on` integer
);

CREATE INDEX `user_idx` ON `comments` (`id`);
CREATE INDEX `post_idx` ON `comments` (`id`);