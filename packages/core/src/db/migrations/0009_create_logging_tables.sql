-- Create system logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  user_id TEXT REFERENCES users(id),
  session_id TEXT,
  request_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  method TEXT,
  url TEXT,
  status_code INTEGER,
  duration INTEGER,
  stack_trace TEXT,
  tags TEXT,
  source TEXT,
  created_at INTEGER NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_source ON system_logs(source);
CREATE INDEX IF NOT EXISTS idx_system_logs_category_level ON system_logs(category, level);

-- Create log configuration table
CREATE TABLE IF NOT EXISTS log_config (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 1,
  level TEXT NOT NULL DEFAULT 'info',
  retention INTEGER NOT NULL DEFAULT 30,
  max_size INTEGER DEFAULT 10000,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Insert default log configurations
INSERT OR IGNORE INTO log_config (id, category, enabled, level, retention, max_size, created_at, updated_at) VALUES
  ('auth-config', 'auth', 1, 'info', 30, 10000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('api-config', 'api', 1, 'info', 7, 50000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('workflow-config', 'workflow', 1, 'info', 30, 10000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('plugin-config', 'plugin', 1, 'info', 30, 10000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('media-config', 'media', 1, 'info', 30, 10000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('system-config', 'system', 1, 'warn', 30, 10000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('security-config', 'security', 1, 'warn', 90, 20000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('error-config', 'error', 1, 'error', 90, 20000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);