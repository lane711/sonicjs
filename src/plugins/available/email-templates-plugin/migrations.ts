// Email Templates Plugin Migrations
// These migrations create and manage the email system database tables

export const emailPluginMigrations = {
  // Migration to create email system tables
  up: `
    -- Email themes for reusable email layouts
    CREATE TABLE IF NOT EXISTS email_themes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      html_template TEXT NOT NULL,
      css_styles TEXT NOT NULL,
      variables TEXT,
      is_default INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Email templates for specific email types
    CREATE TABLE IF NOT EXISTS email_templates (
      id TEXT PRIMARY KEY,
      theme_id TEXT NOT NULL REFERENCES email_themes(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      subject TEXT NOT NULL,
      markdown_content TEXT NOT NULL,
      variables TEXT,
      metadata TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      version INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Email logs for tracking delivery and engagement
    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      template_id TEXT REFERENCES email_templates(id),
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL,
      provider_id TEXT,
      error_message TEXT,
      sent_at INTEGER,
      delivered_at INTEGER,
      opened_at INTEGER,
      clicked_at INTEGER,
      metadata TEXT,
      created_at INTEGER NOT NULL
    );

    -- Email variables for template system
    CREATE TABLE IF NOT EXISTS email_variables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      data_type TEXT NOT NULL,
      default_value TEXT,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_email_themes_active ON email_themes(is_active);
    CREATE INDEX IF NOT EXISTS idx_email_templates_slug ON email_templates(slug);
    CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
    CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
    CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
    CREATE INDEX IF NOT EXISTS idx_email_variables_name ON email_variables(name);
  `,

  // Migration to remove email system tables
  down: `
    -- Drop email system tables (in reverse dependency order)
    DROP INDEX IF EXISTS idx_email_variables_name;
    DROP INDEX IF EXISTS idx_email_logs_recipient;
    DROP INDEX IF EXISTS idx_email_logs_status;
    DROP INDEX IF EXISTS idx_email_templates_active;
    DROP INDEX IF EXISTS idx_email_templates_slug;
    DROP INDEX IF EXISTS idx_email_themes_active;
    
    DROP TABLE IF EXISTS email_variables;
    DROP TABLE IF EXISTS email_logs;
    DROP TABLE IF EXISTS email_templates;
    DROP TABLE IF EXISTS email_themes;
  `
}