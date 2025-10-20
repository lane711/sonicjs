-- Testimonials Plugin Migration
-- Creates testimonials table for the testimonials plugin
-- This demonstrates a code-based collection defined in src/plugins/core-plugins/testimonials-plugin.ts

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_company TEXT,
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  isPublished INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(isPublished);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort_order ON testimonials(sortOrder);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS testimonials_updated_at
  AFTER UPDATE ON testimonials
BEGIN
  UPDATE testimonials SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- Insert plugin record
INSERT OR IGNORE INTO plugins (name, display_name, description, version, status, category, settings) VALUES
('testimonials',
 'Customer Testimonials',
 'Manage customer testimonials and reviews with rating support. This is a code-based collection example.',
 '1.0.0',
 'active',
 'content',
 '{"defaultPublished": true, "requireRating": false}');

-- Insert sample testimonial data
INSERT OR IGNORE INTO testimonials (author_name, author_title, author_company, testimonial_text, rating, isPublished, sortOrder) VALUES
('Jane Smith',
 'CTO',
 'TechStartup Inc',
 'SonicJS AI has transformed how we manage our content. The plugin architecture is brilliant and the edge deployment is blazing fast.',
 5,
 1,
 1),

('Michael Chen',
 'Lead Developer',
 'Digital Agency Co',
 'We migrated from WordPress to SonicJS AI and couldn''t be happier. The TypeScript-first approach and modern tooling make development a joy.',
 5,
 1,
 2),

('Sarah Johnson',
 'Product Manager',
 'E-commerce Solutions',
 'The headless CMS approach combined with Cloudflare Workers gives us unmatched performance. Our content is served globally with minimal latency.',
 4,
 1,
 3),

('David Rodriguez',
 'Full Stack Developer',
 'Creative Studio',
 'Great CMS for modern web applications. The admin interface is clean and the API is well-designed. Plugin system is very flexible.',
 5,
 1,
 4),

('Emily Watson',
 'Technical Director',
 'Media Company',
 'SonicJS AI solved our content distribution challenges. The R2 integration for media storage works flawlessly and scales effortlessly.',
 4,
 1,
 5);
