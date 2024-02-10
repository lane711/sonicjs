DROP INDEX IF EXISTS `commentsPostIdIndex`;--> statement-breakpoint
CREATE INDEX `commentsPostIdIndex` ON `comments` (`postId`);