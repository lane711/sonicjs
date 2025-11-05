-- Magic Link Authentication Plugin Migration
-- Creates table for storing magic link tokens

CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  used_at INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL,
  INDEX idx_magic_links_token (token),
  INDEX idx_magic_links_email (user_email),
  INDEX idx_magic_links_expires (expires_at)
);
