-- Design Plugin Migration
-- Migration: 014_design_plugin
-- Description: Add design system plugin to the plugin registry

-- Insert design plugin
INSERT INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, installed_at, last_updated
) VALUES (
    'design',
    'design-plugin',
    'Design System',
    'Design system management including themes, components, and UI customization. Provides a visual interface for managing design tokens, typography, colors, and component library.',
    '1.0.0',
    'SonicJS',
    'ui',
    '🎨',
    'active',
    TRUE,
    '["design.view", "design.edit"]',
    unixepoch(),
    unixepoch()
);
