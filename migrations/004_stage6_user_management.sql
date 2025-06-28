-- Stage 6: User Management & Permissions enhancements
-- Enhanced user system with profiles, teams, permissions, and activity logging

-- Add user profile and preferences columns
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN email_notifications INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'dark';
ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN password_reset_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_expires INTEGER;
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN invitation_token TEXT;
ALTER TABLE users ADD COLUMN invited_by TEXT REFERENCES users(id);
ALTER TABLE users ADD COLUMN invited_at INTEGER;
ALTER TABLE users ADD COLUMN accepted_invitation_at INTEGER;

-- Create teams table for team-based collaboration
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  owner_id TEXT NOT NULL REFERENCES users(id),
  settings TEXT, -- JSON for team settings
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create team memberships table
CREATE TABLE IF NOT EXISTS team_memberships (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, editor, member, viewer
  permissions TEXT, -- JSON for specific permissions
  joined_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(team_id, user_id)
);

-- Create permissions table for granular access control
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- content, users, collections, media, settings
  created_at INTEGER NOT NULL
);

-- Create role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  permission_id TEXT NOT NULL REFERENCES permissions(id),
  created_at INTEGER NOT NULL,
  UNIQUE(role, permission_id)
);

-- Create user sessions table for better session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);

-- Create activity log table for audit trails
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT, -- users, content, collections, media, etc.
  resource_id TEXT,
  details TEXT, -- JSON with additional details
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
);

-- Create password history table for security
CREATE TABLE IF NOT EXISTS password_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Insert default permissions
INSERT OR IGNORE INTO permissions (id, name, description, category, created_at) VALUES
  ('perm_content_create', 'content.create', 'Create new content', 'content', strftime('%s', 'now') * 1000),
  ('perm_content_read', 'content.read', 'View content', 'content', strftime('%s', 'now') * 1000),
  ('perm_content_update', 'content.update', 'Edit existing content', 'content', strftime('%s', 'now') * 1000),
  ('perm_content_delete', 'content.delete', 'Delete content', 'content', strftime('%s', 'now') * 1000),
  ('perm_content_publish', 'content.publish', 'Publish/unpublish content', 'content', strftime('%s', 'now') * 1000),
  
  ('perm_collections_create', 'collections.create', 'Create new collections', 'collections', strftime('%s', 'now') * 1000),
  ('perm_collections_read', 'collections.read', 'View collections', 'collections', strftime('%s', 'now') * 1000),
  ('perm_collections_update', 'collections.update', 'Edit collections', 'collections', strftime('%s', 'now') * 1000),
  ('perm_collections_delete', 'collections.delete', 'Delete collections', 'collections', strftime('%s', 'now') * 1000),
  ('perm_collections_fields', 'collections.fields', 'Manage collection fields', 'collections', strftime('%s', 'now') * 1000),
  
  ('perm_media_upload', 'media.upload', 'Upload media files', 'media', strftime('%s', 'now') * 1000),
  ('perm_media_read', 'media.read', 'View media files', 'media', strftime('%s', 'now') * 1000),
  ('perm_media_update', 'media.update', 'Edit media metadata', 'media', strftime('%s', 'now') * 1000),
  ('perm_media_delete', 'media.delete', 'Delete media files', 'media', strftime('%s', 'now') * 1000),
  
  ('perm_users_create', 'users.create', 'Invite new users', 'users', strftime('%s', 'now') * 1000),
  ('perm_users_read', 'users.read', 'View user profiles', 'users', strftime('%s', 'now') * 1000),
  ('perm_users_update', 'users.update', 'Edit user profiles', 'users', strftime('%s', 'now') * 1000),
  ('perm_users_delete', 'users.delete', 'Deactivate users', 'users', strftime('%s', 'now') * 1000),
  ('perm_users_roles', 'users.roles', 'Manage user roles', 'users', strftime('%s', 'now') * 1000),
  
  ('perm_settings_read', 'settings.read', 'View system settings', 'settings', strftime('%s', 'now') * 1000),
  ('perm_settings_update', 'settings.update', 'Modify system settings', 'settings', strftime('%s', 'now') * 1000),
  ('perm_activity_read', 'activity.read', 'View activity logs', 'settings', strftime('%s', 'now') * 1000);

-- Assign permissions to default roles
INSERT OR IGNORE INTO role_permissions (id, role, permission_id, created_at) VALUES
  -- Admin has all permissions
  ('rp_admin_content_create', 'admin', 'perm_content_create', strftime('%s', 'now') * 1000),
  ('rp_admin_content_read', 'admin', 'perm_content_read', strftime('%s', 'now') * 1000),
  ('rp_admin_content_update', 'admin', 'perm_content_update', strftime('%s', 'now') * 1000),
  ('rp_admin_content_delete', 'admin', 'perm_content_delete', strftime('%s', 'now') * 1000),
  ('rp_admin_content_publish', 'admin', 'perm_content_publish', strftime('%s', 'now') * 1000),
  ('rp_admin_collections_create', 'admin', 'perm_collections_create', strftime('%s', 'now') * 1000),
  ('rp_admin_collections_read', 'admin', 'perm_collections_read', strftime('%s', 'now') * 1000),
  ('rp_admin_collections_update', 'admin', 'perm_collections_update', strftime('%s', 'now') * 1000),
  ('rp_admin_collections_delete', 'admin', 'perm_collections_delete', strftime('%s', 'now') * 1000),
  ('rp_admin_collections_fields', 'admin', 'perm_collections_fields', strftime('%s', 'now') * 1000),
  ('rp_admin_media_upload', 'admin', 'perm_media_upload', strftime('%s', 'now') * 1000),
  ('rp_admin_media_read', 'admin', 'perm_media_read', strftime('%s', 'now') * 1000),
  ('rp_admin_media_update', 'admin', 'perm_media_update', strftime('%s', 'now') * 1000),
  ('rp_admin_media_delete', 'admin', 'perm_media_delete', strftime('%s', 'now') * 1000),
  ('rp_admin_users_create', 'admin', 'perm_users_create', strftime('%s', 'now') * 1000),
  ('rp_admin_users_read', 'admin', 'perm_users_read', strftime('%s', 'now') * 1000),
  ('rp_admin_users_update', 'admin', 'perm_users_update', strftime('%s', 'now') * 1000),
  ('rp_admin_users_delete', 'admin', 'perm_users_delete', strftime('%s', 'now') * 1000),
  ('rp_admin_users_roles', 'admin', 'perm_users_roles', strftime('%s', 'now') * 1000),
  ('rp_admin_settings_read', 'admin', 'perm_settings_read', strftime('%s', 'now') * 1000),
  ('rp_admin_settings_update', 'admin', 'perm_settings_update', strftime('%s', 'now') * 1000),
  ('rp_admin_activity_read', 'admin', 'perm_activity_read', strftime('%s', 'now') * 1000),
  
  -- Editor permissions
  ('rp_editor_content_create', 'editor', 'perm_content_create', strftime('%s', 'now') * 1000),
  ('rp_editor_content_read', 'editor', 'perm_content_read', strftime('%s', 'now') * 1000),
  ('rp_editor_content_update', 'editor', 'perm_content_update', strftime('%s', 'now') * 1000),
  ('rp_editor_content_publish', 'editor', 'perm_content_publish', strftime('%s', 'now') * 1000),
  ('rp_editor_collections_read', 'editor', 'perm_collections_read', strftime('%s', 'now') * 1000),
  ('rp_editor_media_upload', 'editor', 'perm_media_upload', strftime('%s', 'now') * 1000),
  ('rp_editor_media_read', 'editor', 'perm_media_read', strftime('%s', 'now') * 1000),
  ('rp_editor_media_update', 'editor', 'perm_media_update', strftime('%s', 'now') * 1000),
  ('rp_editor_users_read', 'editor', 'perm_users_read', strftime('%s', 'now') * 1000),
  
  -- Viewer permissions
  ('rp_viewer_content_read', 'viewer', 'perm_content_read', strftime('%s', 'now') * 1000),
  ('rp_viewer_collections_read', 'viewer', 'perm_collections_read', strftime('%s', 'now') * 1000),
  ('rp_viewer_media_read', 'viewer', 'perm_media_read', strftime('%s', 'now') * 1000),
  ('rp_viewer_users_read', 'viewer', 'perm_users_read', strftime('%s', 'now') * 1000);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_invitation_token ON users(invitation_token);