ALTER TABLE `blog-posts` RENAME TO `posts`;
ALTER TABLE `user` RENAME TO `users`;
DROP INDEX IF EXISTS `titleIdx`;
ALTER TABLE posts ADD `user_id` integer;
ALTER TABLE `posts` DROP COLUMN `title`;