-- System Logging Tables
-- Migration: 009_system_logging
-- Description: Add system logging and configuration tables

-- System logs table for tracking application events
CREATE TABLE IF NOT EXISTS system_logs (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    category TEXT NOT NULL CHECK (category IN ('auth', 'api', 'workflow', 'plugin', 'media', 'system', 'security', 'error')),
    message TEXT NOT NULL,
    data TEXT,  -- JSON data
    user_id TEXT,
    session_id TEXT,
    request_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    method TEXT,
    url TEXT,
    status_code INTEGER,
    duration INTEGER,  -- milliseconds
    stack_trace TEXT,
    tags TEXT,  -- JSON array
    source TEXT,  -- source of the log entry
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Log configuration table for managing log settings per category
CREATE TABLE IF NOT EXISTS log_config (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL UNIQUE CHECK (category IN ('auth', 'api', 'workflow', 'plugin', 'media', 'system', 'security', 'error')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    retention_days INTEGER NOT NULL DEFAULT 30,
    max_size_mb INTEGER NOT NULL DEFAULT 100,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_status_code ON system_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_system_logs_source ON system_logs(source);

-- Insert default log configurations
INSERT OR IGNORE INTO log_config (id, category, enabled, level, retention_days, max_size_mb) VALUES
('log-config-auth', 'auth', TRUE, 'info', 90, 50),
('log-config-api', 'api', TRUE, 'info', 30, 100),
('log-config-workflow', 'workflow', TRUE, 'info', 60, 50),
('log-config-plugin', 'plugin', TRUE, 'warn', 30, 25),
('log-config-media', 'media', TRUE, 'info', 30, 50),
('log-config-system', 'system', TRUE, 'info', 90, 100),
('log-config-security', 'security', TRUE, 'warn', 180, 100),
('log-config-error', 'error', TRUE, 'error', 90, 200);