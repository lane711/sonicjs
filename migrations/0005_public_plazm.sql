ALTER TABLE `users` ADD `passwordExpiresOn` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordOTPExpiresOn` integer;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `passwordExpired`;