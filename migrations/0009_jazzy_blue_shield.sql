CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text,
	`answer` text,
	`sort` integer DEFAULT 100,
	`createdOn` integer,
	`updatedOn` integer
);
