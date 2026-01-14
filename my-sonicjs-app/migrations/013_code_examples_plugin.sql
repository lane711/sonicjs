-- Code Examples Plugin Migration
-- Creates code_examples table for the code examples plugin
-- This demonstrates a code-based collection for storing and managing code snippets

CREATE TABLE IF NOT EXISTS code_examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT,
  tags TEXT,
  isPublished INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_code_examples_published ON code_examples(isPublished);
CREATE INDEX IF NOT EXISTS idx_code_examples_sort_order ON code_examples(sortOrder);
CREATE INDEX IF NOT EXISTS idx_code_examples_language ON code_examples(language);
CREATE INDEX IF NOT EXISTS idx_code_examples_category ON code_examples(category);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS code_examples_updated_at
  AFTER UPDATE ON code_examples
BEGIN
  UPDATE code_examples SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- Insert plugin record
INSERT OR IGNORE INTO plugins (name, display_name, description, version, status, category, settings) VALUES
('code-examples',
 'Code Examples',
 'Manage code snippets and examples with syntax highlighting support. Perfect for documentation and tutorials.',
 '1.0.0',
 'active',
 'content',
 '{"defaultPublished": true, "supportedLanguages": ["javascript", "typescript", "python", "go", "rust", "java", "php", "ruby", "sql"]}');

-- Note: Sample code examples removed to avoid D1 SQL parsing issues with multi-line strings
-- Users can add their own code examples through the admin interface
