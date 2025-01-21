drop table if exists cacheRequests;

--> statement-breakpoint
CREATE TABLE `cacheRequests` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`createdOn` integer NOT NULL
);

--> statement-breakpoint
drop table if exists cacheStats;

--> statement-breakpoint
CREATE TABLE `cacheStats` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`createdOn` integer NOT NULL,
	`executionTime` integer NOT NULL
);

--> statement-breakpoint
CREATE UNIQUE INDEX `cacheRequests_url_unique` ON `cacheRequests` (`url`);

--> statement-breakpoint
CREATE UNIQUE INDEX `url` ON `cacheRequests` (`url`);