CREATE TABLE `blog` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`body` text
);

CREATE TABLE `user` (
	`id` integer,
	`name` text,
	`email` text,
	`password` text,
	`role` text,
	`created_at` integer,
	`updated_at` integer
);

CREATE UNIQUE INDEX `titleIdx` ON `blog` (`title`);