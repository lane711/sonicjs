-- Rename mdxeditor-plugin to easy-mdx
-- Migration: 025_rename_mdxeditor_to_easy_mdx
-- Description: Update plugin ID from mdxeditor-plugin to easy-mdx to reflect the change to EasyMDE editor

-- Update the plugin record if it exists with the old ID
UPDATE plugins
SET
    id = 'easy-mdx',
    name = 'easy-mdx',
    display_name = 'EasyMDE Markdown Editor',
    description = 'Lightweight markdown editor with live preview. Provides a simple and efficient editor with markdown support for richtext fields.'
WHERE id = 'mdxeditor-plugin';

-- Update any plugin_hooks references
UPDATE plugin_hooks
SET plugin_id = 'easy-mdx'
WHERE plugin_id = 'mdxeditor-plugin';

-- Update any plugin_activity_log references
UPDATE plugin_activity_log
SET plugin_id = 'easy-mdx'
WHERE plugin_id = 'mdxeditor-plugin';
