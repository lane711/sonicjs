-- Migration: Fix slug field type
-- Description: Update slug fields to use 'slug' field type instead of 'text' for proper auto-generation
-- Created: 2026-01-10

-- Update pages collection slug field to use 'slug' field type
UPDATE content_fields 
SET field_type = 'slug'
WHERE field_name = 'slug' AND collection_id = 'pages-collection';

-- Update blog posts slug field if it exists
UPDATE content_fields 
SET field_type = 'slug'
WHERE field_name = 'slug' AND collection_id = 'blog-posts-collection';

-- Update news slug field if it exists
UPDATE content_fields 
SET field_type = 'slug'
WHERE field_name = 'slug' AND collection_id = 'news-collection';
