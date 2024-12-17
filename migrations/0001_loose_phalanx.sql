CREATE TABLE `cacheRequests` (
	`url` text PRIMARY KEY NOT NULL,
	`createdOn` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cacheStats` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`createdOn` integer NOT NULL,
	`executionTime` integer NOT NULL
);
