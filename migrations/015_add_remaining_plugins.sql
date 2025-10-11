-- Add Remaining Plugins
-- Migration: 015_add_remaining_plugins
-- Description: Add all remaining core plugins that were missing from the registry

-- Testimonials Plugin (with correct name)
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'testimonials-plugin',
    'testimonials-plugin',
    'Customer Testimonials',
    'Manage customer testimonials and reviews with rating support',
    '1.0.0',
    'SonicJS',
    'content',
    '⭐',
    'active',
    FALSE,
    '["manage:testimonials"]',
    '[]',
    '{"defaultPublished": true, "requireRating": false}',
    unixepoch(),
    unixepoch()
);

-- Code Examples Plugin (with correct name)
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'code-examples-plugin',
    'code-examples-plugin',
    'Code Examples',
    'Manage code snippets and examples with syntax highlighting support',
    '1.0.0',
    'SonicJS',
    'content',
    '💻',
    'active',
    FALSE,
    '["manage:code-examples"]',
    '[]',
    '{"defaultPublished": true, "supportedLanguages": ["javascript", "typescript", "python", "go", "rust", "java", "php", "ruby", "sql"]}',
    unixepoch(),
    unixepoch()
);

-- Workflow Plugin (with correct name)
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, installed_at, last_updated
) VALUES (
    'workflow-plugin',
    'workflow-plugin',
    'Workflow Engine',
    'Content workflow management with approval chains, scheduling, and automation',
    '1.0.0',
    'SonicJS Team',
    'content',
    '🔄',
    'active',
    TRUE,
    '["manage:workflows", "approve:content"]',
    '[]',
    unixepoch(),
    unixepoch()
);

-- Demo Login Plugin (already exists with correct name from migration 007, but let's ensure it's there)
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, installed_at, last_updated
) VALUES (
    'demo-login-plugin',
    'demo-login-plugin',
    'Demo Login Prefill',
    'Prefills login form with demo credentials for easy site demonstration',
    '1.0.0',
    'SonicJS',
    'demo',
    '🎯',
    'active',
    FALSE,
    '[]',
    '[]',
    unixepoch(),
    unixepoch()
);
