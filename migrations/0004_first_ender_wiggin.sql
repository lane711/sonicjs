ALTER TABLE `users` ADD `passwordExpired` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordOTP` text;