-- Stage 5: Advanced Content Management enhancements
-- Add scheduling and workflow features to content table

-- Add content scheduling columns
ALTER TABLE content ADD COLUMN scheduled_publish_at INTEGER;
ALTER TABLE content ADD COLUMN scheduled_unpublish_at INTEGER;

-- Add workflow and review columns
ALTER TABLE content ADD COLUMN review_status TEXT DEFAULT 'none'; -- none, pending, approved, rejected
ALTER TABLE content ADD COLUMN reviewer_id TEXT REFERENCES users(id);
ALTER TABLE content ADD COLUMN reviewed_at INTEGER;
ALTER TABLE content ADD COLUMN review_notes TEXT;

-- Add content metadata
ALTER TABLE content ADD COLUMN meta_title TEXT;
ALTER TABLE content ADD COLUMN meta_description TEXT;
ALTER TABLE content ADD COLUMN featured_image_id TEXT REFERENCES media(id);
ALTER TABLE content ADD COLUMN content_type TEXT DEFAULT 'standard'; -- standard, template, component

-- Create content_fields table for dynamic field definitions
CREATE TABLE IF NOT EXISTS content_fields (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id),
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL, -- text, richtext, number, boolean, date, select, media, relationship
  field_label TEXT NOT NULL,
  field_options TEXT, -- JSON for select options, validation rules, etc.
  field_order INTEGER NOT NULL DEFAULT 0,
  is_required INTEGER NOT NULL DEFAULT 0,
  is_searchable INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(collection_id, field_name)
);

-- Create content_relationships table for content relationships
CREATE TABLE IF NOT EXISTS content_relationships (
  id TEXT PRIMARY KEY,
  source_content_id TEXT NOT NULL REFERENCES content(id),
  target_content_id TEXT NOT NULL REFERENCES content(id),
  relationship_type TEXT NOT NULL, -- references, tags, categories
  created_at INTEGER NOT NULL,
  UNIQUE(source_content_id, target_content_id, relationship_type)
);

-- Create workflow_templates table for reusable workflows
CREATE TABLE IF NOT EXISTS workflow_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  collection_id TEXT REFERENCES collections(id), -- null means applies to all collections
  workflow_steps TEXT NOT NULL, -- JSON array of workflow steps
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_content_scheduled_publish ON content(scheduled_publish_at);
CREATE INDEX IF NOT EXISTS idx_content_scheduled_unpublish ON content(scheduled_unpublish_at);
CREATE INDEX IF NOT EXISTS idx_content_review_status ON content(review_status);
CREATE INDEX IF NOT EXISTS idx_content_reviewer ON content(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_content_content_type ON content(content_type);

CREATE INDEX IF NOT EXISTS idx_content_fields_collection ON content_fields(collection_id);
CREATE INDEX IF NOT EXISTS idx_content_fields_name ON content_fields(field_name);
CREATE INDEX IF NOT EXISTS idx_content_fields_type ON content_fields(field_type);
CREATE INDEX IF NOT EXISTS idx_content_fields_order ON content_fields(field_order);

CREATE INDEX IF NOT EXISTS idx_content_relationships_source ON content_relationships(source_content_id);
CREATE INDEX IF NOT EXISTS idx_content_relationships_target ON content_relationships(target_content_id);
CREATE INDEX IF NOT EXISTS idx_content_relationships_type ON content_relationships(relationship_type);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_collection ON workflow_templates(collection_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active);

-- Insert default workflow template
INSERT OR IGNORE INTO workflow_templates (
  id, name, description, workflow_steps, is_active, created_at, updated_at
) VALUES (
  'default-content-workflow',
  'Default Content Workflow',
  'Standard content workflow: Draft → Review → Published',
  '[
    {"step": "draft", "name": "Draft", "description": "Content is being created", "permissions": ["author", "editor", "admin"]},
    {"step": "review", "name": "Under Review", "description": "Content is pending review", "permissions": ["editor", "admin"]},
    {"step": "published", "name": "Published", "description": "Content is live", "permissions": ["editor", "admin"]},
    {"step": "archived", "name": "Archived", "description": "Content is archived", "permissions": ["admin"]}
  ]',
  1,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);

-- Insert enhanced field definitions for existing collections
INSERT OR IGNORE INTO content_fields (
  id, collection_id, field_name, field_type, field_label, field_options, field_order, is_required, is_searchable, created_at, updated_at
) VALUES 
-- Blog Posts fields
('blog-title-field', 'blog-posts-collection', 'title', 'text', 'Title', '{"maxLength": 200, "placeholder": "Enter blog post title"}', 1, 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('blog-content-field', 'blog-posts-collection', 'content', 'richtext', 'Content', '{"toolbar": "full", "height": 400}', 2, 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('blog-excerpt-field', 'blog-posts-collection', 'excerpt', 'text', 'Excerpt', '{"maxLength": 500, "rows": 3, "placeholder": "Brief description of the post"}', 3, 0, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('blog-tags-field', 'blog-posts-collection', 'tags', 'select', 'Tags', '{"multiple": true, "options": ["technology", "business", "tutorial", "news", "update"], "allowCustom": true}', 4, 0, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('blog-featured-image-field', 'blog-posts-collection', 'featured_image', 'media', 'Featured Image', '{"accept": "image/*", "maxSize": "5MB"}', 5, 0, 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('blog-publish-date-field', 'blog-posts-collection', 'publish_date', 'date', 'Publish Date', '{"format": "YYYY-MM-DD", "defaultToday": true}', 6, 0, 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('blog-featured-field', 'blog-posts-collection', 'is_featured', 'boolean', 'Featured Post', '{"default": false}', 7, 0, 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),

-- Pages fields
('pages-title-field', 'pages-collection', 'title', 'text', 'Title', '{"maxLength": 200, "placeholder": "Enter page title"}', 1, 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('pages-content-field', 'pages-collection', 'content', 'richtext', 'Content', '{"toolbar": "full", "height": 500}', 2, 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('pages-slug-field', 'pages-collection', 'slug', 'text', 'URL Slug', '{"pattern": "^[a-z0-9-]+$", "placeholder": "url-friendly-slug"}', 3, 1, 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('pages-meta-desc-field', 'pages-collection', 'meta_description', 'text', 'Meta Description', '{"maxLength": 160, "rows": 2, "placeholder": "SEO description for search engines"}', 4, 0, 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('pages-template-field', 'pages-collection', 'template', 'select', 'Page Template', '{"options": ["default", "landing", "contact", "about"], "default": "default"}', 5, 0, 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),

-- News fields
('news-title-field', 'news-collection', 'title', 'text', 'Title', '{"maxLength": 200, "placeholder": "Enter news title"}', 1, 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('news-content-field', 'news-collection', 'content', 'richtext', 'Content', '{"toolbar": "news", "height": 400}', 2, 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('news-category-field', 'news-collection', 'category', 'select', 'Category', '{"options": ["technology", "business", "politics", "sports", "entertainment", "health"], "required": true}', 3, 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('news-author-field', 'news-collection', 'author', 'text', 'Author', '{"placeholder": "Author name"}', 4, 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('news-source-field', 'news-collection', 'source', 'text', 'Source', '{"placeholder": "News source"}', 5, 0, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
('news-priority-field', 'news-collection', 'priority', 'select', 'Priority', '{"options": ["low", "normal", "high", "breaking"], "default": "normal"}', 6, 0, 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);