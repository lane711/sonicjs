-- Add MDXEditor Rich Text Editor Plugin
-- Migration: 023_add_mdxeditor_plugin
-- Description: Add MDXEditor plugin for modern MDX-based rich text editing

-- Register the plugin (active by default)
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'mdxeditor-plugin',
    'mdxeditor-plugin',
    'MDXEditor Rich Text Editor',
    'Modern React-based MDX editor for content creation. Provides a powerful editor with markdown support, live preview, and extensible features for richtext fields.',
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
