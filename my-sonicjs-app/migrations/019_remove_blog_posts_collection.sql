-- Migration: Remove blog_posts from database-managed collections
-- Description: Remove blog-posts-collection from the database so it can be managed by code-based collection
-- Created: 2025-11-04

-- Delete content associated with blog-posts-collection
DELETE FROM content WHERE collection_id = 'blog-posts-collection';

-- Delete content fields for blog-posts-collection
DELETE FROM content_fields WHERE collection_id = 'blog-posts-collection';

-- Delete the blog-posts collection itself
DELETE FROM collections WHERE id = 'blog-posts-collection';

-- The blog-posts collection will now be managed by the code-based collection
-- in src/collections/blog-posts.collection.ts
