CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text,
	`lastName` text,
	`company` text,
	`email` text,
	`phone` text,
	`message` text,
	`createdOn` integer,
	`updatedOn` integer
);
