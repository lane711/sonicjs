-- Create settings table for storing application settings
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- 'general', 'appearance', 'security', etc.
  key TEXT NOT NULL,
  value TEXT NOT NULL, -- JSON value
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(category, key)
);

-- Insert default general settings
INSERT OR IGNORE INTO settings (id, category, key, value, created_at, updated_at)
VALUES
  (lower(hex(randomblob(16))), 'general', 'siteName', '"SonicJS AI"', unixepoch() * 1000, unixepoch() * 1000),
  (lower(hex(randomblob(16))), 'general', 'siteDescription', '"A modern headless CMS powered by AI"', unixepoch() * 1000, unixepoch() * 1000),
  (lower(hex(randomblob(16))), 'general', 'timezone', '"UTC"', unixepoch() * 1000, unixepoch() * 1000),
  (lower(hex(randomblob(16))), 'general', 'language', '"en"', unixepoch() * 1000, unixepoch() * 1000),
  (lower(hex(randomblob(16))), 'general', 'maintenanceMode', 'false', unixepoch() * 1000, unixepoch() * 1000);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON settings(category, key);
