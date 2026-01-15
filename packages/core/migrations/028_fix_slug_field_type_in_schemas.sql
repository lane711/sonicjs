-- Migration: Fix slug field type in collection schemas
-- Description: Update slug fields in collection schemas to use 'slug' type instead of 'string'
-- Created: 2026-01-10

-- Update pages-collection schema
UPDATE collections 
SET schema = REPLACE(
  schema,
  '"slug":{"type":"string"',
  '"slug":{"type":"slug"'
)
WHERE id = 'pages-collection' AND schema LIKE '%"slug":{"type":"string"%';

-- Update blog-posts-collection schema if it exists
UPDATE collections 
SET schema = REPLACE(
  schema,
  '"slug":{"type":"string"',
  '"slug":{"type":"slug"'
)
WHERE id = 'blog-posts-collection' AND schema LIKE '%"slug":{"type":"string"%';

-- Update news-collection schema if it exists
UPDATE collections 
SET schema = REPLACE(
  schema,
  '"slug":{"type":"string"',
  '"slug":{"type":"slug"'
)
WHERE id = 'news-collection' AND schema LIKE '%"slug":{"type":"string"%';
