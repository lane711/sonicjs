-- FAQ Plugin Migration (DEPRECATED - Now managed by third-party plugin)
-- Creates FAQ table for the FAQ plugin
-- NOTE: This migration is kept for historical purposes. 
-- The FAQ functionality is now provided by the faq-plugin third-party plugin.

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  tags TEXT,
  isPublished INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(isPublished);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sortOrder);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS faqs_updated_at
  AFTER UPDATE ON faqs
BEGIN
  UPDATE faqs SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- Insert sample FAQ data
INSERT OR IGNORE INTO faqs (question, answer, category, tags, isPublished, sortOrder) VALUES 
('What is SonicJS AI?', 
'SonicJS AI is a modern, TypeScript-first headless CMS built for Cloudflare''s edge platform. It provides a complete content management system with admin interface, API endpoints, and plugin architecture.',
'general',
'sonicjs, cms, cloudflare',
1,
1),

('How do I get started with SonicJS AI?',
'To get started: 1) Clone the repository, 2) Install dependencies with npm install, 3) Set up your Cloudflare account and services, 4) Run the development server with npm run dev, 5) Access the admin interface at /admin.',
'general',
'getting-started, setup',
1,
2),

('What technologies does SonicJS AI use?',
'SonicJS AI is built with: TypeScript for type safety, Hono.js as the web framework, Cloudflare D1 for the database, Cloudflare R2 for media storage, Cloudflare Workers for serverless execution, and Tailwind CSS for styling.',
'technical',
'technology-stack, typescript, cloudflare',
1,
3),

('How do I create content in SonicJS AI?',
'Content creation is done through the admin interface. Navigate to /admin, log in with your credentials, go to Content section, select a collection, and click "New Content" to create articles, pages, or other content types.',
'general',
'content-creation, admin',
1,
4),

('Is SonicJS AI free to use?',
'SonicJS AI is open source and free to use. You only pay for the Cloudflare services you consume (D1 database, R2 storage, Workers execution time). Cloudflare offers generous free tiers for development and small projects.',
'billing',
'pricing, open-source, cloudflare',
1,
5),

('How do I add custom functionality?',
'SonicJS AI features a plugin system that allows you to extend functionality. You can create plugins using the PluginBuilder API, add custom routes, models, admin pages, and integrate with external services.',
'technical',
'plugins, customization, development',
1,
6),

('Can I customize the admin interface?',
'Yes! The admin interface is built with TypeScript templates and can be customized. You can modify existing templates, create new components, add custom pages, and integrate your own styling while maintaining the dark theme.',
'technical',
'admin-interface, customization, templates',
1,
7),

('How does authentication work?',
'SonicJS AI includes a built-in authentication system with JWT tokens, role-based access control (admin, editor, viewer), secure password hashing, and session management. Users can be managed through the admin interface.',
'technical',
'authentication, security, users',
1,
8);