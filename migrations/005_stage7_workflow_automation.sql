-- Stage 7: Workflow & Automation Migration
-- This migration adds workflow and automation capabilities to SonicJS

-- Workflow States Table
CREATE TABLE IF NOT EXISTS workflow_states (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_initial INTEGER DEFAULT 0,
  is_final INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default workflow states
INSERT OR IGNORE INTO workflow_states (id, name, description, color, is_initial, is_final) VALUES
('draft', 'Draft', 'Content is being worked on', '#F59E0B', 1, 0),
('pending-review', 'Pending Review', 'Content is waiting for review', '#3B82F6', 0, 0),
('approved', 'Approved', 'Content has been approved', '#10B981', 0, 0),
('published', 'Published', 'Content is live', '#059669', 0, 1),
('rejected', 'Rejected', 'Content was rejected', '#EF4444', 0, 1),
('archived', 'Archived', 'Content has been archived', '#6B7280', 0, 1);

-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  collection_id TEXT,
  is_active INTEGER DEFAULT 1,
  auto_publish INTEGER DEFAULT 0,
  require_approval INTEGER DEFAULT 1,
  approval_levels INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Workflow Transitions Table
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workflow_id TEXT NOT NULL,
  from_state_id TEXT NOT NULL,
  to_state_id TEXT NOT NULL,
  required_permission TEXT,
  auto_transition INTEGER DEFAULT 0,
  transition_conditions TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (from_state_id) REFERENCES workflow_states(id),
  FOREIGN KEY (to_state_id) REFERENCES workflow_states(id)
);

-- Content Workflow Status Table
CREATE TABLE IF NOT EXISTS content_workflow_status (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  content_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  current_state_id TEXT NOT NULL,
  assigned_to TEXT,
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id),
  FOREIGN KEY (current_state_id) REFERENCES workflow_states(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  UNIQUE(content_id, workflow_id)
);

-- Workflow History Table
CREATE TABLE IF NOT EXISTS workflow_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  content_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  from_state_id TEXT,
  to_state_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  comment TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id),
  FOREIGN KEY (from_state_id) REFERENCES workflow_states(id),
  FOREIGN KEY (to_state_id) REFERENCES workflow_states(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Scheduled Content Table
CREATE TABLE IF NOT EXISTS scheduled_content (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  content_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'publish', 'unpublish', 'archive'
  scheduled_at DATETIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  executed_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'workflow', 'schedule', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT, -- JSON
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  email_enabled INTEGER DEFAULT 1,
  in_app_enabled INTEGER DEFAULT 1,
  digest_frequency TEXT DEFAULT 'daily', -- 'immediate', 'hourly', 'daily', 'weekly'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, notification_type)
);

-- Webhooks Table
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT NOT NULL, -- JSON array of event types
  is_active INTEGER DEFAULT 1,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_success_at DATETIME,
  last_failure_at DATETIME,
  failure_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Deliveries Table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  webhook_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON
  response_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER DEFAULT 1,
  delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

-- Content Versions Table (for rollback functionality)
CREATE TABLE IF NOT EXISTS content_versions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  content_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  fields TEXT, -- JSON
  user_id TEXT NOT NULL,
  change_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(content_id, version_number)
);

-- Automation Rules Table
CREATE TABLE IF NOT EXISTS automation_rules (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'content_created', 'content_updated', 'workflow_transition', 'schedule'
  trigger_conditions TEXT, -- JSON
  action_type TEXT NOT NULL, -- 'workflow_transition', 'send_notification', 'webhook_call', 'auto_save'
  action_config TEXT, -- JSON
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Auto-save Drafts Table
CREATE TABLE IF NOT EXISTS auto_save_drafts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  content_id TEXT,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT,
  fields TEXT, -- JSON
  last_saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(content_id, user_id)
);

-- Add workflow-related columns to existing content table (skip existing columns)
ALTER TABLE content ADD COLUMN workflow_state_id TEXT DEFAULT 'draft';
ALTER TABLE content ADD COLUMN embargo_until DATETIME;
ALTER TABLE content ADD COLUMN expires_at DATETIME;
ALTER TABLE content ADD COLUMN version_number INTEGER DEFAULT 1;
ALTER TABLE content ADD COLUMN is_auto_saved INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_workflow_status_content_id ON content_workflow_status(content_id);
CREATE INDEX IF NOT EXISTS idx_content_workflow_status_workflow_id ON content_workflow_status(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_history_content_id ON workflow_history(content_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_scheduled_at ON scheduled_content(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_status ON scheduled_content(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_auto_save_drafts_user_id ON auto_save_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_content_workflow_state ON content(workflow_state_id);
CREATE INDEX IF NOT EXISTS idx_content_scheduled_publish ON content(scheduled_publish_at);

-- Insert default workflow for collections
INSERT OR IGNORE INTO workflows (id, name, description, collection_id, is_active, require_approval, approval_levels) 
SELECT 
  'default-' || id,
  'Default Workflow for ' || name,
  'Standard content approval workflow',
  id,
  1,
  1,
  1
FROM collections;

-- Insert default workflow transitions
INSERT OR IGNORE INTO workflow_transitions (workflow_id, from_state_id, to_state_id, required_permission) 
SELECT 
  w.id,
  'draft',
  'pending-review',
  'content:submit'
FROM workflows w;

INSERT OR IGNORE INTO workflow_transitions (workflow_id, from_state_id, to_state_id, required_permission) 
SELECT 
  w.id,
  'pending-review',
  'approved',
  'content:approve'
FROM workflows w;

INSERT OR IGNORE INTO workflow_transitions (workflow_id, from_state_id, to_state_id, required_permission) 
SELECT 
  w.id,
  'approved',
  'published',
  'content:publish'
FROM workflows w;

INSERT OR IGNORE INTO workflow_transitions (workflow_id, from_state_id, to_state_id, required_permission) 
SELECT 
  w.id,
  'pending-review',
  'rejected',
  'content:approve'
FROM workflows w;

-- Insert default notification preferences for all users
INSERT OR IGNORE INTO notification_preferences (user_id, notification_type, email_enabled, in_app_enabled)
SELECT 
  id,
  'workflow_assigned',
  1,
  1
FROM users;

INSERT OR IGNORE INTO notification_preferences (user_id, notification_type, email_enabled, in_app_enabled)
SELECT 
  id,
  'workflow_status_change',
  1,
  1
FROM users;

INSERT OR IGNORE INTO notification_preferences (user_id, notification_type, email_enabled, in_app_enabled)
SELECT 
  id,
  'content_scheduled',
  1,
  1
FROM users;