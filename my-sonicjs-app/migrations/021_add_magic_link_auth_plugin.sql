-- Add Magic Link Authentication Plugin
-- Migration: 021_add_magic_link_auth_plugin
-- Description: Add magic link authentication plugin for passwordless login

-- Create magic_links table
CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  used_at INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(user_email);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON magic_links(expires_at);

-- Register the plugin
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, installed_at, last_updated
) VALUES (
    'magic-link-auth',
    'magic-link-auth',
    'Magic Link Authentication',
    'Passwordless authentication via email magic links. Users receive a secure one-time link to sign in without entering a password.',
    '1.0.0',
    'SonicJS Team',
    'security',
    '🔗',
    'inactive',
    FALSE,
    '["auth:manage", "auth:magic-link"]',
    '["email"]',
    unixepoch(),
    unixepoch()
);
