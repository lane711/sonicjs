-- Remove redundant created_by column from content table
-- The author_id column already serves this purpose

-- SQLite doesn't support DROP COLUMN directly, so we need to:
-- 1. Create a new table with the correct schema
-- 2. Copy data from old table
-- 3. Drop old table
-- 4. Rename new table

CREATE TABLE content_new (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  author_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Copy data from old table (using author_id for both columns since they're the same)
INSERT INTO content_new (id, collection_id, slug, title, data, status, published_at, author_id, created_at, updated_at)
SELECT id, collection_id, slug, title, data, status, published_at, author_id, created_at, updated_at
FROM content;

-- Drop old table
DROP TABLE content;

-- Rename new table
ALTER TABLE content_new RENAME TO content;
