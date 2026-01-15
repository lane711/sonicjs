-- User Profiles Table
-- Stores extended user profile data separate from auth concerns
-- Customize columns as needed for your app

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Customize these columns for your app:
  display_name TEXT,
  bio TEXT,
  company TEXT,
  job_title TEXT,
  website TEXT,
  location TEXT,
  date_of_birth INTEGER,

  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS user_profiles_updated_at
  AFTER UPDATE ON user_profiles
BEGIN
  UPDATE user_profiles SET updated_at = strftime('%s', 'now') * 1000 WHERE id = NEW.id;
END;
