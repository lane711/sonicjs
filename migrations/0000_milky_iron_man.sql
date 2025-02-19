CREATE TABLE  IF NOT EXISTS `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE  IF NOT EXISTS `categoriesToPosts` (
	`id` text NOT NULL,
	`postId` text NOT NULL,
	`categoryId` text NOT NULL,
	`createdOn` integer,
	`updatedOn` integer,
	PRIMARY KEY(`postId`, `categoryId`),
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE  IF NOT EXISTS `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`userId` text NOT NULL,
	`postId` integer NOT NULL,
	`tags` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE  IF NOT EXISTS `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`userId` text NOT NULL,
	`image` text,
	`images` text,
	`tags` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE  IF NOT EXISTS `userSessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`activeExpires` integer NOT NULL,
	`idleExpires` integer NOT NULL,
	`createdOn` integer,
	`updatedOn` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE  IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text,
	`lastName` text,
	`email` text,
	`password` text NOT NULL,
	`role` text DEFAULT 'user',
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `commentsUserIdIndex` ON `comments` (`userId`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `commentsPostIdIndex` ON `comments` (`postId`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `postUserIdIndex` ON `posts` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `email_idx` ON `users` (`email`);