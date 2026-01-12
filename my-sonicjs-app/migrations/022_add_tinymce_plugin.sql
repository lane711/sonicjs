-- Add TinyMCE Rich Text Editor Plugin
-- Migration: 022_add_tinymce_plugin
-- Description: Add TinyMCE plugin for WYSIWYG rich text editing

-- Register the plugin (active by default since it replaces hardcoded TinyMCE)
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'tinymce-plugin',
    'tinymce-plugin',
    'TinyMCE Rich Text Editor',
    'Powerful WYSIWYG rich text editor for content creation. Provides a full-featured editor with formatting, media embedding, and customizable toolbars for richtext fields.',
    '1.0.0',
    'SonicJS Team',
    'editor',
    '✏️',
    'active',
    FALSE,
    '[]',
    '[]',
    '{"apiKey":"no-api-key","defaultHeight":300,"defaultToolbar":"full","skin":"oxide-dark"}',
    unixepoch(),
    unixepoch()
);
