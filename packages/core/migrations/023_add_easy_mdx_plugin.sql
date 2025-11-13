-- Add EasyMDE Markdown Editor Plugin
-- Migration: 023_add_easy_mdx_plugin
-- Description: Add EasyMDE plugin for lightweight markdown editing

-- Register the plugin (active by default)
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'easy-mdx',
    'easy-mdx',
    'EasyMDE Markdown Editor',
    'Lightweight markdown editor with live preview. Provides a simple and efficient editor with markdown support for richtext fields.',
    '1.0.0',
    'SonicJS Team',
    'editor',
    '📝',
    'active',
    FALSE,
    '[]',
    '[]',
    '{"defaultHeight":400,"theme":"dark","toolbar":"full","placeholder":"Start writing your content..."}',
    unixepoch(),
    unixepoch()
);
