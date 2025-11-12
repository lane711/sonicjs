-- Add Quill Rich Text Editor Plugin
-- Migration: 024_add_quill_editor_plugin
-- Description: Add Quill plugin for modern rich text editing

-- Register the plugin (active by default)
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'quill-editor',
    'quill-editor',
    'Quill Rich Text Editor',
    'Modern rich text editor for content creation. Provides a clean, intuitive WYSIWYG editor with customizable toolbars for richtext fields.',
    '1.0.0',
    'SonicJS Team',
    'editor',
    '✍️',
    'active',
    FALSE,
    '[]',
    '[]',
    '{"theme":"snow","defaultHeight":300,"defaultToolbar":"full","placeholder":"Start writing your content..."}',
    unixepoch(),
    unixepoch()
);
