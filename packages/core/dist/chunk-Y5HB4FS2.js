// src/services/migrations.ts
var MigrationService = class {
  constructor(db) {
    this.db = db;
  }
  /**
   * Initialize the migrations tracking table
   */
  async initializeMigrationsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        checksum TEXT
      )
    `;
    await this.db.prepare(createTableQuery).run();
  }
  /**
   * Get all available migrations from the migrations directory
   */
  async getAvailableMigrations() {
    const migrations = [];
    const migrationFiles = [
      { id: "001", name: "Initial Schema", filename: "001_initial_schema.sql", description: "Initial database schema with users, content, collections, and media tables" },
      { id: "002", name: "FAQ Plugin", filename: "002_faq_plugin.sql", description: "FAQ plugin tables and initial data" },
      { id: "003", name: "Stage 5 Enhancements", filename: "003_stage5_enhancements.sql", description: "Enhanced content management and media handling" },
      { id: "004", name: "User Management", filename: "004_stage6_user_management.sql", description: "Advanced user management with roles and permissions" },
      { id: "005", name: "Workflow & Automation", filename: "005_stage7_workflow_automation.sql", description: "Workflow states, automation rules, and scheduled content" },
      { id: "006", name: "Plugin System", filename: "006_plugin_system.sql", description: "Plugin registration and configuration system" },
      { id: "007", name: "Demo Login Plugin", filename: "007_demo_login_plugin.sql", description: "Demo login functionality" },
      { id: "008", name: "Fix Slug Validation", filename: "008_fix_slug_validation.sql", description: "Fix slug validation in content" },
      { id: "009", name: "System Logging", filename: "009_system_logging.sql", description: "System logging and audit trails" },
      { id: "011", name: "Config Managed Collections", filename: "011_config_managed_collections.sql", description: "Configuration for managed collections" },
      { id: "012", name: "Testimonials Plugin", filename: "012_testimonials_plugin.sql", description: "Testimonials plugin and collection" },
      { id: "013", name: "Code Examples Plugin", filename: "013_code_examples_plugin.sql", description: "Code examples plugin and collection" },
      { id: "014", name: "Fix Plugin Registry", filename: "014_fix_plugin_registry.sql", description: "Fix plugin registry issues" },
      { id: "015", name: "Add Remaining Plugins", filename: "015_add_remaining_plugins.sql", description: "Add remaining core plugins" },
      { id: "016", name: "Remove Duplicate Cache Plugin", filename: "016_remove_duplicate_cache_plugin.sql", description: "Remove duplicate cache plugin entries" },
      { id: "017", name: "Auth Configurable Fields", filename: "017_auth_configurable_fields.sql", description: "Configurable authentication fields" },
      { id: "020", name: "Add Email Plugin", filename: "020_add_email_plugin.sql", description: "Email notification plugin" },
      { id: "021", name: "Add OTP Login", filename: "021_add_otp_login.sql", description: "One-time password login functionality" },
      { id: "022", name: "Add TinyMCE Plugin", filename: "022_add_tinymce_plugin.sql", description: "TinyMCE rich text editor plugin" },
      { id: "023", name: "Add EasyMDE Plugin", filename: "023_add_easy_mdx_plugin.sql", description: "EasyMDE markdown editor plugin" },
      { id: "024", name: "Add Quill Editor Plugin", filename: "024_add_quill_editor_plugin.sql", description: "Quill rich text editor plugin" },
      { id: "025", name: "Rename MDXEditor to EasyMDX", filename: "025_rename_mdxeditor_to_easy_mdx.sql", description: "Rename mdxeditor-plugin to easy-mdx" }
    ];
    const appliedResult = await this.db.prepare(
      "SELECT id, name, filename, applied_at FROM migrations ORDER BY applied_at ASC"
    ).all();
    const appliedMigrations = new Map(
      appliedResult.results?.map((row) => [row.id, row]) || []
    );
    await this.autoDetectAppliedMigrations(appliedMigrations);
    for (const file of migrationFiles) {
      const applied = appliedMigrations.has(file.id);
      const appliedData = appliedMigrations.get(file.id);
      migrations.push({
        id: file.id,
        name: file.name,
        filename: file.filename,
        description: file.description,
        applied,
        appliedAt: applied ? appliedData?.applied_at : void 0,
        size: await this.getMigrationFileSize(file.filename)
      });
    }
    return migrations;
  }
  /**
   * Auto-detect applied migrations by checking if their tables exist
   */
  async autoDetectAppliedMigrations(appliedMigrations) {
    if (!appliedMigrations.has("001")) {
      const hasBasicTables = await this.checkTablesExist(["users", "content", "collections", "media"]);
      if (hasBasicTables) {
        appliedMigrations.set("001", {
          id: "001",
          applied_at: (/* @__PURE__ */ new Date()).toISOString(),
          name: "Initial Schema",
          filename: "001_initial_schema.sql"
        });
        await this.markMigrationApplied("001", "Initial Schema", "001_initial_schema.sql");
      }
    }
    if (!appliedMigrations.has("002")) {
      const hasFaqTables = await this.checkTablesExist(["faqs", "faq_categories"]);
      if (hasFaqTables) {
        appliedMigrations.set("002", {
          id: "002",
          applied_at: (/* @__PURE__ */ new Date()).toISOString(),
          name: "FAQ Plugin",
          filename: "002_faq_plugin.sql"
        });
        await this.markMigrationApplied("002", "FAQ Plugin", "002_faq_plugin.sql");
      }
    }
    if (!appliedMigrations.has("003")) {
      const hasEnhancedTables = await this.checkTablesExist(["content_versions", "email_themes", "email_templates"]);
      if (hasEnhancedTables) {
        appliedMigrations.set("003", {
          id: "003",
          applied_at: (/* @__PURE__ */ new Date()).toISOString(),
          name: "Stage 5 Enhancements",
          filename: "003_stage5_enhancements.sql"
        });
        await this.markMigrationApplied("003", "Stage 5 Enhancements", "003_stage5_enhancements.sql");
      }
    }
    if (!appliedMigrations.has("004")) {
      const hasUserTables = await this.checkTablesExist(["api_tokens", "workflow_history"]);
      if (hasUserTables) {
        appliedMigrations.set("004", {
          id: "004",
          applied_at: (/* @__PURE__ */ new Date()).toISOString(),
          name: "User Management",
          filename: "004_stage6_user_management.sql"
        });
        await this.markMigrationApplied("004", "User Management", "004_stage6_user_management.sql");
      }
    }
    if (!appliedMigrations.has("006")) {
      const hasPluginTables = await this.checkTablesExist(["plugins", "plugin_hooks"]);
      if (hasPluginTables) {
        appliedMigrations.set("006", {
          id: "006",
          applied_at: (/* @__PURE__ */ new Date()).toISOString(),
          name: "Plugin System",
          filename: "006_plugin_system.sql"
        });
        await this.markMigrationApplied("006", "Plugin System", "006_plugin_system.sql");
      }
    }
  }
  /**
   * Check if specific tables exist in the database
   */
  async checkTablesExist(tableNames) {
    try {
      for (const tableName of tableNames) {
        const result = await this.db.prepare(
          `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
        ).bind(tableName).first();
        if (!result) {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Get migration status summary
   */
  async getMigrationStatus() {
    await this.initializeMigrationsTable();
    const migrations = await this.getAvailableMigrations();
    const appliedMigrations = migrations.filter((m) => m.applied);
    const pendingMigrations = migrations.filter((m) => !m.applied);
    const lastApplied = appliedMigrations.length > 0 ? appliedMigrations[appliedMigrations.length - 1]?.appliedAt : void 0;
    return {
      totalMigrations: migrations.length,
      appliedMigrations: appliedMigrations.length,
      pendingMigrations: pendingMigrations.length,
      lastApplied,
      migrations
    };
  }
  /**
   * Mark a migration as applied
   */
  async markMigrationApplied(migrationId, name, filename) {
    await this.initializeMigrationsTable();
    await this.db.prepare(
      "INSERT OR REPLACE INTO migrations (id, name, filename, applied_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
    ).bind(migrationId, name, filename).run();
  }
  /**
   * Check if a specific migration has been applied
   */
  async isMigrationApplied(migrationId) {
    await this.initializeMigrationsTable();
    const result = await this.db.prepare(
      "SELECT COUNT(*) as count FROM migrations WHERE id = ?"
    ).bind(migrationId).first();
    return result?.count > 0;
  }
  /**
   * Get the last applied migration
   */
  async getLastAppliedMigration() {
    await this.initializeMigrationsTable();
    const result = await this.db.prepare(
      "SELECT id, name, filename, applied_at FROM migrations ORDER BY applied_at DESC LIMIT 1"
    ).first();
    if (!result) return null;
    return {
      id: result.id,
      name: result.name,
      filename: result.filename,
      applied: true,
      appliedAt: result.applied_at
    };
  }
  /**
   * Get migration file size (simulated)
   */
  async getMigrationFileSize(filename) {
    const sizesMap = {
      "001_initial_schema.sql": 15420,
      "002_faq_plugin.sql": 2340,
      "003_stage5_enhancements.sql": 8920,
      "004_stage6_user_management.sql": 12680,
      "005_stage7_workflow_automation.sql": 18750,
      "006_plugin_system.sql": 5430
    };
    return sizesMap[filename] || 1e3;
  }
  /**
   * Run pending migrations
   */
  async runPendingMigrations() {
    const status = await this.getMigrationStatus();
    const pendingMigrations = status.migrations.filter((m) => !m.applied);
    if (pendingMigrations.length === 0) {
      return {
        success: true,
        message: "All migrations are up to date",
        applied: []
      };
    }
    const applied = [];
    for (const migration of pendingMigrations) {
      try {
        await this.applyMigration(migration);
        await this.markMigrationApplied(migration.id, migration.name, migration.filename);
        applied.push(migration.id);
      } catch (error) {
        console.error(`Failed to apply migration ${migration.id}:`, error);
        break;
      }
    }
    return {
      success: true,
      message: `Applied ${applied.length} migration(s)`,
      applied
    };
  }
  /**
   * Apply a specific migration
   */
  async applyMigration(migration) {
    console.log(`Applying migration ${migration.id}: ${migration.name}`);
    const migrationSQL = await this.getMigrationSQL(migration.id);
    if (migrationSQL === null) {
      throw new Error(`Migration SQL not found for ${migration.id}`);
    }
    if (migrationSQL === "") {
      console.log(`Skipping migration ${migration.id} (empty/obsolete)`);
      return;
    }
    const statements = this.splitSQLStatements(migrationSQL);
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await this.db.prepare(statement).run();
        } catch (error) {
          console.error(`Error executing statement: ${statement}`, error);
          throw error;
        }
      }
    }
  }
  /**
   * Split SQL into statements, handling CREATE TRIGGER properly
   */
  splitSQLStatements(sql) {
    const statements = [];
    let current = "";
    let inTrigger = false;
    const lines = sql.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("--") || trimmed.length === 0) {
        continue;
      }
      if (trimmed.toUpperCase().includes("CREATE TRIGGER")) {
        inTrigger = true;
      }
      current += line + "\n";
      if (inTrigger && trimmed.toUpperCase() === "END;") {
        statements.push(current.trim());
        current = "";
        inTrigger = false;
      } else if (!inTrigger && trimmed.endsWith(";")) {
        statements.push(current.trim());
        current = "";
      }
    }
    if (current.trim()) {
      statements.push(current.trim());
    }
    return statements.filter((s) => s.length > 0);
  }
  /**
   * Get migration SQL by ID
   */
  async getMigrationSQL(migrationId) {
    switch (migrationId) {
      case "001":
        return `
-- Initial schema for SonicJS AI
-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  avatar TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create collections table for content schema definitions
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  schema TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create content table for actual content data
CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  author_id TEXT NOT NULL REFERENCES users(id),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create content_versions table for versioning
CREATE TABLE IF NOT EXISTS content_versions (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES content(id),
  version INTEGER NOT NULL,
  data TEXT NOT NULL,
  author_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL
);

-- Create media/files table with comprehensive R2 integration
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  folder TEXT NOT NULL DEFAULT 'uploads',
  r2_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt TEXT,
  caption TEXT,
  tags TEXT,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  uploaded_at INTEGER NOT NULL,
  updated_at INTEGER,
  published_at INTEGER,
  scheduled_at INTEGER,
  archived_at INTEGER,
  deleted_at INTEGER
);

-- Create API tokens table for programmatic access
CREATE TABLE IF NOT EXISTS api_tokens (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id),
  permissions TEXT NOT NULL,
  expires_at INTEGER,
  last_used_at INTEGER,
  created_at INTEGER NOT NULL
);

-- Create workflow history table for content workflow tracking
CREATE TABLE IF NOT EXISTS workflow_history (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES content(id),
  action TEXT NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  comment TEXT,
  created_at INTEGER NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_collections_name ON collections(name);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);

CREATE INDEX IF NOT EXISTS idx_content_collection ON content(collection_id);
CREATE INDEX IF NOT EXISTS idx_content_author ON content(author_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_published ON content(published_at);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);

CREATE INDEX IF NOT EXISTS idx_content_versions_content ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_version ON content_versions(version);

CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON media(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_media_deleted ON media(deleted_at);

CREATE INDEX IF NOT EXISTS idx_api_tokens_user ON api_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_token ON api_tokens(token);

CREATE INDEX IF NOT EXISTS idx_workflow_history_content ON workflow_history(content_id);
CREATE INDEX IF NOT EXISTS idx_workflow_history_user ON workflow_history(user_id);

-- Insert default admin user (password: sonicjs!)
INSERT OR IGNORE INTO users (
  id, email, username, first_name, last_name, password_hash,
  role, is_active, created_at, updated_at
) VALUES (
  'admin-user-id',
  'admin@sonicjs.com',
  'admin',
  'Admin',
  'User',
  'd1c379e871838f44e21d5a55841349e50636f06df139bfef11870eec74c381db',
  'admin',
  1,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);

-- Insert sample collections
INSERT OR IGNORE INTO collections (
  id, name, display_name, description, schema,
  is_active, created_at, updated_at
) VALUES (
  'blog-posts-collection',
  'blog_posts',
  'Blog Posts',
  'Blog post content collection',
  '{"type":"object","properties":{"title":{"type":"string","title":"Title","required":true},"content":{"type":"string","title":"Content","format":"richtext"},"excerpt":{"type":"string","title":"Excerpt"},"featured_image":{"type":"string","title":"Featured Image","format":"media"},"tags":{"type":"array","title":"Tags","items":{"type":"string"}},"status":{"type":"string","title":"Status","enum":["draft","published","archived"],"default":"draft"}},"required":["title"]}',
  1,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
(
  'pages-collection',
  'pages',
  'Pages',
  'Static page content collection',
  '{"type":"object","properties":{"title":{"type":"string","title":"Title","required":true},"content":{"type":"string","title":"Content","format":"richtext"},"slug":{"type":"string","title":"Slug"},"meta_description":{"type":"string","title":"Meta Description"},"featured_image":{"type":"string","title":"Featured Image","format":"media"}},"required":["title"]}',
  1,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
(
  'news-collection',
  'news',
  'News',
  'News article content collection',
  '{"type":"object","properties":{"title":{"type":"string","title":"Title","required":true},"content":{"type":"string","title":"Content","format":"richtext"},"publish_date":{"type":"string","title":"Publish Date","format":"date"},"author":{"type":"string","title":"Author"},"category":{"type":"string","title":"Category","enum":["technology","business","general"]}},"required":["title"]}',
  1,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);

-- Insert sample content
INSERT OR IGNORE INTO content (
  id, collection_id, slug, title, data, status,
  author_id, created_by, created_at, updated_at
) VALUES (
  'welcome-blog-post',
  'blog-posts-collection',
  'welcome-to-sonicjs-ai',
  'Welcome to SonicJS AI',
  '{"title":"Welcome to SonicJS AI","content":"<h1>Welcome to SonicJS AI</h1><p>This is your first blog post created with SonicJS AI, a modern headless CMS built on Cloudflare Workers.</p><h2>Features</h2><ul><li>Cloudflare-native architecture</li><li>TypeScript-first development</li><li>Hono.js framework</li><li>D1 database</li><li>R2 media storage</li><li>Edge computing</li></ul><p>Get started by exploring the admin interface and creating your own content!</p>","excerpt":"Welcome to SonicJS AI, a modern headless CMS built on Cloudflare Workers with TypeScript and Hono.js.","status":"published","tags":["welcome","cms","cloudflare"]}',
  'published',
  'admin-user-id',
  'admin-user-id',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);
        `;
      case "002":
        return `
          CREATE TABLE IF NOT EXISTS faqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            category TEXT,
            tags TEXT,
            isPublished INTEGER NOT NULL DEFAULT 1,
            sortOrder INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
          );

          CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
          CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(isPublished);
          CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sortOrder);

          CREATE TRIGGER IF NOT EXISTS faqs_updated_at
            AFTER UPDATE ON faqs
          BEGIN
            UPDATE faqs SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
          END;
        `;
      case "006":
        return `
          -- Plugin System Tables
          CREATE TABLE IF NOT EXISTS plugins (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL UNIQUE,
              display_name TEXT NOT NULL,
              description TEXT,
              version TEXT NOT NULL,
              author TEXT NOT NULL,
              category TEXT NOT NULL,
              icon TEXT,
              status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
              is_core BOOLEAN DEFAULT FALSE,
              settings JSON,
              permissions JSON,
              dependencies JSON,
              download_count INTEGER DEFAULT 0,
              rating REAL DEFAULT 0,
              installed_at INTEGER NOT NULL,
              activated_at INTEGER,
              last_updated INTEGER NOT NULL,
              error_message TEXT,
              created_at INTEGER DEFAULT (unixepoch()),
              updated_at INTEGER DEFAULT (unixepoch())
          );

          CREATE TABLE IF NOT EXISTS plugin_hooks (
              id TEXT PRIMARY KEY,
              plugin_id TEXT NOT NULL,
              hook_name TEXT NOT NULL,
              handler_name TEXT NOT NULL,
              priority INTEGER DEFAULT 10,
              is_active BOOLEAN DEFAULT TRUE,
              created_at INTEGER DEFAULT (unixepoch()),
              FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
              UNIQUE(plugin_id, hook_name, handler_name)
          );

          CREATE TABLE IF NOT EXISTS plugin_routes (
              id TEXT PRIMARY KEY,
              plugin_id TEXT NOT NULL,
              path TEXT NOT NULL,
              method TEXT NOT NULL,
              handler_name TEXT NOT NULL,
              middleware JSON,
              is_active BOOLEAN DEFAULT TRUE,
              created_at INTEGER DEFAULT (unixepoch()),
              FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
              UNIQUE(plugin_id, path, method)
          );

          CREATE TABLE IF NOT EXISTS plugin_assets (
              id TEXT PRIMARY KEY,
              plugin_id TEXT NOT NULL,
              asset_type TEXT NOT NULL CHECK (asset_type IN ('css', 'js', 'image', 'font')),
              asset_path TEXT NOT NULL,
              load_order INTEGER DEFAULT 100,
              load_location TEXT DEFAULT 'footer' CHECK (load_location IN ('header', 'footer')),
              is_active BOOLEAN DEFAULT TRUE,
              created_at INTEGER DEFAULT (unixepoch()),
              FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS plugin_activity_log (
              id TEXT PRIMARY KEY,
              plugin_id TEXT NOT NULL,
              action TEXT NOT NULL,
              user_id TEXT,
              details JSON,
              timestamp INTEGER DEFAULT (unixepoch()),
              FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE
          );

          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_plugins_status ON plugins(status);
          CREATE INDEX IF NOT EXISTS idx_plugins_category ON plugins(category);
          CREATE INDEX IF NOT EXISTS idx_plugin_hooks_plugin ON plugin_hooks(plugin_id);
          CREATE INDEX IF NOT EXISTS idx_plugin_routes_plugin ON plugin_routes(plugin_id);
          CREATE INDEX IF NOT EXISTS idx_plugin_assets_plugin ON plugin_assets(plugin_id);
          CREATE INDEX IF NOT EXISTS idx_plugin_activity_plugin ON plugin_activity_log(plugin_id);
          CREATE INDEX IF NOT EXISTS idx_plugin_activity_timestamp ON plugin_activity_log(timestamp);

          -- Insert core plugins
          INSERT OR IGNORE INTO plugins (
              id, name, display_name, description, version, author, category, icon,
              status, is_core, permissions, installed_at, last_updated
          ) VALUES 
          (
              'core-auth',
              'core-auth',
              'Authentication System',
              'Core authentication and user management system',
              '1.0.0',
              'SonicJS Team',
              'security',
              '\u{1F510}',
              'active',
              TRUE,
              '["manage:users", "manage:roles", "manage:permissions"]',
              unixepoch(),
              unixepoch()
          ),
          (
              'core-media',
              'core-media', 
              'Media Manager',
              'Core media upload and management system',
              '1.0.0',
              'SonicJS Team',
              'media',
              '\u{1F4F8}',
              'active',
              TRUE,
              '["manage:media", "upload:files"]',
              unixepoch(),
              unixepoch()
          ),
          (
              'core-workflow',
              'core-workflow',
              'Workflow Engine',
              'Content workflow and approval system',
              '1.0.0',
              'SonicJS Team',
              'content',
              '\u{1F504}',
              'active',
              TRUE,
              '["manage:workflows", "approve:content"]',
              unixepoch(),
              unixepoch()
          ),
          (
              'cache',
              'cache',
              'Cache System',
              'Three-tiered caching system with memory, KV, and database layers',
              '1.0.0',
              'SonicJS Team',
              'performance',
              '\u26A1',
              'active',
              TRUE,
              '["manage:cache","view:stats"]',
              unixepoch(),
              unixepoch()
          ),
          (
              'design',
              'design-plugin',
              'Design System',
              'Design system management including themes, components, and UI customization. Provides a visual interface for managing design tokens, typography, colors, and component library.',
              '1.0.0',
              'SonicJS',
              'ui',
              '\u{1F3A8}',
              'active',
              TRUE,
              '["design.view", "design.edit"]',
              unixepoch(),
              unixepoch()
          );
        `;
      case "020":
        return `
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
    'communication',
    '\u{1F4E7}',
    'inactive',
    TRUE,
    '["email:manage", "email:send", "email:view-logs"]',
    unixepoch(),
    unixepoch()
);
        `;
      case "022":
        return `
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'tinymce-plugin',
    'tinymce-plugin',
    'TinyMCE Rich Text Editor',
    'Powerful WYSIWYG rich text editor for content creation. Provides a full-featured editor with formatting, media embedding, and customizable toolbars for richtext fields.',
    '1.0.0',
    'SonicJS Team',
    'editor',
    '\u270F\uFE0F',
    'active',
    FALSE,
    '[]',
    '[]',
    '{"apiKey":"no-api-key","defaultHeight":300,"defaultToolbar":"full","skin":"oxide-dark"}',
    unixepoch(),
    unixepoch()
);
        `;
      case "023":
        return `
INSERT OR REPLACE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'easy-mdx',
    'easy-mdx',
    'EasyMDE Markdown Editor',
    'Lightweight markdown editor with live preview. Provides a simple and efficient editor with markdown support for richtext fields.',
    '1.0.0',
    'SonicJS Team',
    'editor',
    '\u270D\uFE0F',
    'active',
    1,
    '[]',
    '[]',
    '{"defaultHeight":400,"theme":"dark","toolbar":"full","placeholder":"Start writing your content..."}',
    unixepoch(),
    unixepoch()
);
        `;
      case "024":
        return `
INSERT OR IGNORE INTO plugins (
    id, name, display_name, description, version, author, category, icon,
    status, is_core, permissions, dependencies, settings, installed_at, last_updated
) VALUES (
    'quill-editor',
    'quill-editor',
    'Quill Rich Text Editor',
    'Modern rich text editor for content creation. Provides a clean, intuitive WYSIWYG editor with customizable toolbars for richtext fields.',
    '1.0.0',
    'SonicJS Team',
    'editor',
    '\u270D\uFE0F',
    'active',
    FALSE,
    '[]',
    '[]',
    '{"theme":"snow","defaultHeight":300,"defaultToolbar":"full","placeholder":"Start writing your content..."}',
    unixepoch(),
    unixepoch()
);
        `;
      case "025":
        return `
UPDATE plugins
SET
    id = 'easy-mdx',
    name = 'easy-mdx',
    display_name = 'EasyMDE Markdown Editor',
    description = 'Lightweight markdown editor with live preview. Provides a simple and efficient editor with markdown support for richtext fields.'
WHERE id = 'mdxeditor-plugin';

UPDATE plugin_hooks
SET plugin_id = 'easy-mdx'
WHERE plugin_id = 'mdxeditor-plugin';

UPDATE plugin_activity_log
SET plugin_id = 'easy-mdx'
WHERE plugin_id = 'mdxeditor-plugin';
        `;
      case "003":
      case "004":
      case "005":
      case "007":
      case "008":
      case "009":
      case "011":
      case "012":
      case "013":
      case "014":
      case "015":
      case "016":
      case "017":
      case "021":
        return "";
      default:
        return null;
    }
  }
  /**
   * Validate database schema (placeholder)
   */
  async validateSchema() {
    const issues = [];
    const requiredTables = [
      "users",
      "content",
      "collections",
      "media",
      "sessions"
    ];
    for (const table of requiredTables) {
      try {
        await this.db.prepare(`SELECT COUNT(*) FROM ${table} LIMIT 1`).first();
      } catch (error) {
        issues.push(`Missing table: ${table}`);
      }
    }
    return {
      valid: issues.length === 0,
      issues
    };
  }
};

export { MigrationService };
//# sourceMappingURL=chunk-Y5HB4FS2.js.map
//# sourceMappingURL=chunk-Y5HB4FS2.js.map