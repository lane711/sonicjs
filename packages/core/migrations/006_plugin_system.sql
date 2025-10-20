-- Plugin System Tables
-- Migration: 006_plugin_system
-- Description: Add plugin management system tables

-- Plugins table
CREATE TABLE IF NOT EXISTS plugins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    version TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    is_core BOOLEAN DEFAULT FALSE,
    settings JSON,
    permissions JSON,
    dependencies JSON,
    download_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    installed_at INTEGER NOT NULL,
    activated_at INTEGER,
    last_updated INTEGER NOT NULL,
    error_message TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Plugin hooks table (registered hooks by plugins)
CREATE TABLE IF NOT EXISTS plugin_hooks (
    id TEXT PRIMARY KEY,
    plugin_id TEXT NOT NULL,
    hook_name TEXT NOT NULL,
    handler_name TEXT NOT NULL,
    priority INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
    UNIQUE(plugin_id, hook_name, handler_name)
);

-- Plugin routes table
CREATE TABLE IF NOT EXISTS plugin_routes (
    id TEXT PRIMARY KEY,
    plugin_id TEXT NOT NULL,
    path TEXT NOT NULL,
    method TEXT NOT NULL,
    handler_name TEXT NOT NULL,
    middleware JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
    UNIQUE(plugin_id, path, method)
);

-- Plugin assets table (CSS, JS files provided by plugins)
CREATE TABLE IF NOT EXISTS plugin_assets (
    id TEXT PRIMARY KEY,
    plugin_id TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('css', 'js', 'image', 'font')),
    asset_path TEXT NOT NULL,
    load_order INTEGER DEFAULT 100,
    load_location TEXT DEFAULT 'footer' CHECK (load_location IN ('header', 'footer')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE
);

-- Plugin activity log
CREATE TABLE IF NOT EXISTS plugin_activity_log (
    id TEXT PRIMARY KEY,
    plugin_id TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id TEXT,
    details JSON,
    timestamp INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_plugins_status ON plugins(status);
CREATE INDEX IF NOT EXISTS idx_plugins_category ON plugins(category);
CREATE INDEX IF NOT EXISTS idx_plugin_hooks_plugin ON plugin_hooks(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_routes_plugin ON plugin_routes(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_assets_plugin ON plugin_assets(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_activity_plugin ON plugin_activity_log(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_activity_timestamp ON plugin_activity_log(timestamp);

-- Insert core plugins
INSERT INTO plugins (
    id, name, display_name, description, version, author, category, icon, 
    status, is_core, permissions, installed_at, last_updated
) VALUES 
(
    'core-auth',
    'core-auth',
    'Authentication System',
    'Core authentication and user management system',
    '1.0.0',
    'SonicJS Team',
    'security',
    '🔐',
    'active',
    TRUE,
    '["manage:users", "manage:roles", "manage:permissions"]',
    unixepoch(),
    unixepoch()
),
(
    'core-media',
    'core-media', 
    'Media Manager',
    'Core media upload and management system',
    '1.0.0',
    'SonicJS Team',
    'media',
    '📸',
    'active',
    TRUE,
    '["manage:media", "upload:files"]',
    unixepoch(),
    unixepoch()
),
(
    'core-workflow',
    'core-workflow',
    'Workflow Engine',
    'Content workflow and approval system',
    '1.0.0',
    'SonicJS Team',
    'content',
    '🔄',
    'active',
    TRUE,
    '["manage:workflows", "approve:content"]',
    unixepoch(),
    unixepoch()
);

-- FAQ Plugin will be added as a third-party plugin through the admin interface

-- Add plugin management permission
INSERT OR IGNORE INTO permissions (id, name, description, category, created_at)
VALUES (
    'manage:plugins',
    'Manage Plugins',
    'Install, uninstall, activate, and configure plugins',
    'system',
    unixepoch()
);

-- Grant plugin management permission to admin role
INSERT OR IGNORE INTO role_permissions (id, role, permission_id, created_at)
VALUES ('role-perm-manage-plugins', 'admin', 'manage:plugins', unixepoch());