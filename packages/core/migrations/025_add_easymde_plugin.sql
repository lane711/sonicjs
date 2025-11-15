-- Add EasyMDE Rich Text Editor Plugin
-- Migration: 025_add_easymde_plugin
-- Description: Add EasyMDE plugin for markdown-based rich text editing

-- Register the plugin (inactive by default, replacing MDXEditor)
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'easymde-editor',
    'easymde-editor',
    'EasyMDE Editor',
    'Lightweight markdown editor for content creation. Simple, elegant WYSIWYG markdown editor with live preview, toolbar, and dark mode support for richtext fields.',
    '1.0.0',
    'SonicJS Team',
    'editor',
    '✍️',
    'inactive',
    TRUE,
    '[]',
    '[]',
    '{"theme":"dark","defaultHeight":300,"toolbar":"full","spellChecker":false,"placeholder":"Start writing your content..."}',
    unixepoch(),
    unixepoch()
);
