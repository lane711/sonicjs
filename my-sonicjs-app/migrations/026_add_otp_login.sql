-- Add OTP Login Plugin
-- Migration: 021_add_otp_login
-- Description: Add OTP login plugin for passwordless authentication via email codes

-- Create table for OTP codes
CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  used_at INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  attempts INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_otp_email_code ON otp_codes(user_email, code);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_used ON otp_codes(used);

-- Add plugin record
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, installed_at, last_updated
) VALUES (
    'otp-login',
    'otp-login',
    'OTP Login',
    'Passwordless authentication via email one-time codes',
    '1.0.0-beta.1',
    'SonicJS Team',
    'security',
    '🔢',
    'inactive',
    TRUE,
    '["otp:manage", "otp:request", "otp:verify"]',
    unixepoch(),
    unixepoch()
);
