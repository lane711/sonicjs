-- Migration: Fix overly restrictive slug validation patterns
-- This migration relaxes the slug field validation to be more user-friendly

-- Update the pages collection slug field to allow underscores and be less restrictive
UPDATE content_fields 
SET field_options = '{"pattern": "^[a-zA-Z0-9_-]+$", "placeholder": "url-friendly-slug", "help": "Use letters, numbers, underscores, and hyphens only"}'
WHERE field_name = 'slug' AND collection_id = 'pages-collection';

-- Update blog posts slug field if it exists
UPDATE content_fields 
SET field_options = '{"pattern": "^[a-zA-Z0-9_-]+$", "placeholder": "url-friendly-slug", "help": "Use letters, numbers, underscores, and hyphens only"}'
WHERE field_name = 'slug' AND collection_id = 'blog-posts-collection';

-- Update news slug field if it exists
UPDATE content_fields 
SET field_options = '{"pattern": "^[a-zA-Z0-9_-]+$", "placeholder": "url-friendly-slug", "help": "Use letters, numbers, underscores, and hyphens only"}'
WHERE field_name = 'slug' AND collection_id = 'news-collection';

-- Update any other slug fields with the restrictive pattern
UPDATE content_fields 
SET field_options = REPLACE(field_options, '"pattern": "^[a-z0-9-]+$"', '"pattern": "^[a-zA-Z0-9_-]+$"')
WHERE field_options LIKE '%"pattern": "^[a-z0-9-]+$"%';