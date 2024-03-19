CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` integer,
	`title` text,
	`description` text,
	`source` text,
	`text` text,
	`tags` text,
	`sort` integer DEFAULT 10,
	`userId` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
DROP TABLE `frequencies`;