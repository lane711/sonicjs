-- Add Email Plugin
-- Migration: 020_add_email_plugin
-- Description: Add email plugin for transactional emails via Resend

INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, installed_at, last_updated
) VALUES (
    'email',
    'email',
    'Email',
    'Send transactional emails using Resend',
    '1.0.0-beta.1',
    'SonicJS Team',
    'utilities',
    '📧',
    'inactive',
    TRUE,
    '["email:manage", "email:send", "email:view-logs"]',
    unixepoch(),
    unixepoch()
);
