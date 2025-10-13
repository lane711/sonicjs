-- Fix Plugin Registry
-- Migration: 014_fix_plugin_registry
-- Description: Add missing plugins and fix plugin name mismatches

-- Note: Cannot easily update plugin names as they may be referenced elsewhere
-- Instead we'll add the missing plugins with correct names

-- Insert missing plugins

-- Core Analytics Plugin
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, installed_at, last_updated
) VALUES (
    'core-analytics',
    'core-analytics',
    'Analytics & Tracking',
    'Core analytics tracking and reporting plugin with page views and event tracking',
    '1.0.0',
    'SonicJS Team',
    'analytics',
    '📊',
    'active',
    TRUE,
    '["view:analytics", "manage:tracking"]',
    unixepoch(),
    unixepoch()
);

-- FAQ Plugin
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, installed_at, last_updated
) VALUES (
    'faq-plugin',
    'faq-plugin',
    'FAQ Management',
    'Frequently Asked Questions management plugin with categories, search, and custom styling',
    '1.0.0',
    'SonicJS',
    'content',
    '❓',
    'active',
    FALSE,
    '["manage:faqs"]',
    unixepoch(),
    unixepoch()
);

-- Seed Data Plugin
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, installed_at, last_updated
) VALUES (
    'seed-data',
    'seed-data',
    'Seed Data Generator',
    'Generate realistic example users and content for testing and development',
    '1.0.0',
    'SonicJS Team',
    'development',
    '🌱',
    'inactive',
    FALSE,
    '["admin"]',
    unixepoch(),
    unixepoch()
);

-- Database Tools Plugin
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, installed_at, last_updated
) VALUES (
    'database-tools',
    'database-tools',
    'Database Tools',
    'Database management tools including truncate, backup, and validation',
    '1.0.0',
    'SonicJS Team',
    'system',
    '🗄️',
    'active',
    FALSE,
    '["manage:database", "admin"]',
    unixepoch(),
    unixepoch()
);
