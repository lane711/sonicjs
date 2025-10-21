'use strict';

var chunkIGJUBJBW_cjs = require('./chunk-IGJUBJBW.cjs');
var sqliteCore = require('drizzle-orm/sqlite-core');
var v4 = require('zod/v4');
var drizzleOrm = require('drizzle-orm');
var d1 = require('drizzle-orm/d1');

// src/services/collection-loader.ts
async function loadCollectionConfigs() {
  const collections2 = [];
  try {
    const modules = undefined?.("../collections/*.collection.ts", { eager: true }) || {};
    for (const [path, module] of Object.entries(modules)) {
      try {
        const configModule = module;
        if (!configModule.default) {
          console.warn(`Collection file ${path} does not export a default config`);
          continue;
        }
        const config = configModule.default;
        if (!config.name || !config.displayName || !config.schema) {
          console.error(`Invalid collection config in ${path}: missing required fields`);
          continue;
        }
        const normalizedConfig = {
          ...config,
          managed: config.managed !== void 0 ? config.managed : true,
          isActive: config.isActive !== void 0 ? config.isActive : true
        };
        collections2.push(normalizedConfig);
        console.log(`\u2713 Loaded collection config: ${config.name}`);
      } catch (error) {
        console.error(`Error loading collection from ${path}:`, error);
      }
    }
    console.log(`Loaded ${collections2.length} collection configuration(s)`);
    return collections2;
  } catch (error) {
    console.error("Error loading collection configurations:", error);
    return [];
  }
}
async function loadCollectionConfig(name) {
  try {
    console.warn("loadCollectionConfig requires implementation in consuming application");
    return null;
  } catch (error) {
    console.error(`Error loading collection ${name}:`, error);
    return null;
  }
}
async function getAvailableCollectionNames() {
  try {
    const modules = undefined?.("../collections/*.collection.ts") || {};
    const names = [];
    for (const path of Object.keys(modules)) {
      const match = path.match(/\/([^/]+)\.collection\.ts$/);
      if (match && match[1]) {
        names.push(match[1]);
      }
    }
    return names;
  } catch (error) {
    console.error("Error getting collection names:", error);
    return [];
  }
}
function validateCollectionConfig(config) {
  const errors = [];
  if (!config.name) {
    errors.push("Collection name is required");
  } else if (!/^[a-z0-9_]+$/.test(config.name)) {
    errors.push("Collection name must contain only lowercase letters, numbers, and underscores");
  }
  if (!config.displayName) {
    errors.push("Display name is required");
  }
  if (!config.schema) {
    errors.push("Schema is required");
  } else {
    if (config.schema.type !== "object") {
      errors.push('Schema type must be "object"');
    }
    if (!config.schema.properties || typeof config.schema.properties !== "object") {
      errors.push("Schema must have properties");
    }
    for (const [fieldName, fieldConfig] of Object.entries(config.schema.properties || {})) {
      if (!fieldConfig.type) {
        errors.push(`Field "${fieldName}" is missing type`);
      }
      if (fieldConfig.type === "reference" && !fieldConfig.collection) {
        errors.push(`Reference field "${fieldName}" is missing collection property`);
      }
      if (["select", "multiselect", "radio"].includes(fieldConfig.type) && !fieldConfig.enum) {
        errors.push(`Select field "${fieldName}" is missing enum options`);
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

// src/services/collection-sync.ts
async function syncCollections(db) {
  console.log("\u{1F504} Starting collection sync...");
  const results = [];
  const configs = await loadCollectionConfigs();
  if (configs.length === 0) {
    console.log("\u26A0\uFE0F  No collection configurations found");
    return results;
  }
  for (const config of configs) {
    const result = await syncCollection(db, config);
    results.push(result);
  }
  const created = results.filter((r) => r.status === "created").length;
  const updated = results.filter((r) => r.status === "updated").length;
  const unchanged = results.filter((r) => r.status === "unchanged").length;
  const errors = results.filter((r) => r.status === "error").length;
  console.log(`\u2705 Collection sync complete: ${created} created, ${updated} updated, ${unchanged} unchanged, ${errors} errors`);
  return results;
}
async function syncCollection(db, config) {
  try {
    const validation = validateCollectionConfig(config);
    if (!validation.valid) {
      return {
        name: config.name,
        status: "error",
        error: `Validation failed: ${validation.errors.join(", ")}`
      };
    }
    const existingStmt = db.prepare("SELECT * FROM collections WHERE name = ?");
    const existing = await existingStmt.bind(config.name).first();
    const now = Date.now();
    const collectionId = existing?.id || `col-${config.name}-${crypto.randomUUID().slice(0, 8)}`;
    const schemaJson = JSON.stringify(config.schema);
    const isActive = config.isActive !== false ? 1 : 0;
    const managed = config.managed !== false ? 1 : 0;
    if (!existing) {
      const insertStmt = db.prepare(`
        INSERT INTO collections (id, name, display_name, description, schema, is_active, managed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      await insertStmt.bind(
        collectionId,
        config.name,
        config.displayName,
        config.description || null,
        schemaJson,
        isActive,
        managed,
        now,
        now
      ).run();
      console.log(`  \u2713 Created collection: ${config.name}`);
      return {
        name: config.name,
        status: "created",
        message: `Created collection "${config.displayName}"`
      };
    } else {
      const existingSchema = existing.schema ? JSON.stringify(existing.schema) : "{}";
      const existingDisplayName = existing.display_name;
      const existingDescription = existing.description;
      const existingIsActive = existing.is_active;
      const existingManaged = existing.managed;
      const needsUpdate = schemaJson !== existingSchema || config.displayName !== existingDisplayName || (config.description || null) !== existingDescription || isActive !== existingIsActive || managed !== existingManaged;
      if (!needsUpdate) {
        return {
          name: config.name,
          status: "unchanged",
          message: `Collection "${config.displayName}" is up to date`
        };
      }
      const updateStmt = db.prepare(`
        UPDATE collections
        SET display_name = ?, description = ?, schema = ?, is_active = ?, managed = ?, updated_at = ?
        WHERE name = ?
      `);
      await updateStmt.bind(
        config.displayName,
        config.description || null,
        schemaJson,
        isActive,
        managed,
        now,
        config.name
      ).run();
      console.log(`  \u2713 Updated collection: ${config.name}`);
      return {
        name: config.name,
        status: "updated",
        message: `Updated collection "${config.displayName}"`
      };
    }
  } catch (error) {
    console.error(`  \u2717 Error syncing collection ${config.name}:`, error);
    return {
      name: config.name,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function isCollectionManaged(db, collectionName) {
  try {
    const stmt = db.prepare("SELECT managed FROM collections WHERE name = ?");
    const result = await stmt.bind(collectionName).first();
    return result?.managed === 1;
  } catch (error) {
    console.error(`Error checking if collection is managed:`, error);
    return false;
  }
}
async function getManagedCollections(db) {
  try {
    const stmt = db.prepare("SELECT name FROM collections WHERE managed = 1");
    const { results } = await stmt.all();
    return (results || []).map((row) => row.name);
  } catch (error) {
    console.error("Error getting managed collections:", error);
    return [];
  }
}
async function cleanupRemovedCollections(db) {
  try {
    const configs = await loadCollectionConfigs();
    const configNames = new Set(configs.map((c) => c.name));
    const managedCollections = await getManagedCollections(db);
    const removed = [];
    for (const managedName of managedCollections) {
      if (!configNames.has(managedName)) {
        const updateStmt = db.prepare(`
          UPDATE collections
          SET is_active = 0, updated_at = ?
          WHERE name = ? AND managed = 1
        `);
        await updateStmt.bind(Date.now(), managedName).run();
        removed.push(managedName);
        console.log(`  \u26A0\uFE0F  Deactivated removed collection: ${managedName}`);
      }
    }
    return removed;
  } catch (error) {
    console.error("Error cleaning up removed collections:", error);
    return [];
  }
}
async function fullCollectionSync(db) {
  const results = await syncCollections(db);
  const removed = await cleanupRemovedCollections(db);
  return { results, removed };
}

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
      { id: "006", name: "Plugin System", filename: "006_plugin_system.sql", description: "Plugin registration and configuration system" }
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

-- Insert default admin user (password: admin123)
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
      case "003":
      case "004":
      case "005":
      case "007":
      case "008":
      case "009":
      case "011":
      case "012":
      case "013":
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

// src/db/schema.ts
var schema_exports = {};
chunkIGJUBJBW_cjs.__export(schema_exports, {
  apiTokens: () => apiTokens,
  collections: () => collections,
  content: () => content,
  contentVersions: () => contentVersions,
  insertCollectionSchema: () => insertCollectionSchema,
  insertContentSchema: () => insertContentSchema,
  insertLogConfigSchema: () => insertLogConfigSchema,
  insertMediaSchema: () => insertMediaSchema,
  insertPluginActivityLogSchema: () => insertPluginActivityLogSchema,
  insertPluginAssetSchema: () => insertPluginAssetSchema,
  insertPluginHookSchema: () => insertPluginHookSchema,
  insertPluginRouteSchema: () => insertPluginRouteSchema,
  insertPluginSchema: () => insertPluginSchema,
  insertSystemLogSchema: () => insertSystemLogSchema,
  insertUserSchema: () => insertUserSchema,
  insertWorkflowHistorySchema: () => insertWorkflowHistorySchema,
  logConfig: () => logConfig,
  media: () => media,
  pluginActivityLog: () => pluginActivityLog,
  pluginAssets: () => pluginAssets,
  pluginHooks: () => pluginHooks,
  pluginRoutes: () => pluginRoutes,
  plugins: () => plugins,
  selectCollectionSchema: () => selectCollectionSchema,
  selectContentSchema: () => selectContentSchema,
  selectLogConfigSchema: () => selectLogConfigSchema,
  selectMediaSchema: () => selectMediaSchema,
  selectPluginActivityLogSchema: () => selectPluginActivityLogSchema,
  selectPluginAssetSchema: () => selectPluginAssetSchema,
  selectPluginHookSchema: () => selectPluginHookSchema,
  selectPluginRouteSchema: () => selectPluginRouteSchema,
  selectPluginSchema: () => selectPluginSchema,
  selectSystemLogSchema: () => selectSystemLogSchema,
  selectUserSchema: () => selectUserSchema,
  selectWorkflowHistorySchema: () => selectWorkflowHistorySchema,
  systemLogs: () => systemLogs,
  users: () => users,
  workflowHistory: () => workflowHistory
});
var CONSTANTS = {
  INT8_MIN: -128,
  INT8_MAX: 127,
  INT8_UNSIGNED_MAX: 255,
  INT16_MIN: -32768,
  INT16_MAX: 32767,
  INT16_UNSIGNED_MAX: 65535,
  INT24_MIN: -8388608,
  INT24_MAX: 8388607,
  INT24_UNSIGNED_MAX: 16777215,
  INT32_MIN: -2147483648,
  INT32_MAX: 2147483647,
  INT32_UNSIGNED_MAX: 4294967295,
  INT48_MIN: -140737488355328,
  INT48_MAX: 140737488355327,
  INT48_UNSIGNED_MAX: 281474976710655,
  INT64_MIN: -9223372036854775808n,
  INT64_MAX: 9223372036854775807n,
  INT64_UNSIGNED_MAX: 18446744073709551615n
};
function isColumnType(column, columnTypes) {
  return columnTypes.includes(column.columnType);
}
function isWithEnum(column) {
  return "enumValues" in column && Array.isArray(column.enumValues) && column.enumValues.length > 0;
}
var isPgEnum = isWithEnum;
var literalSchema = v4.z.union([v4.z.string(), v4.z.number(), v4.z.boolean(), v4.z.null()]);
var jsonSchema = v4.z.union([
  literalSchema,
  v4.z.record(v4.z.string(), v4.z.any()),
  v4.z.array(v4.z.any())
]);
var bufferSchema = v4.z.custom((v) => v instanceof Buffer);
function columnToSchema(column, factory) {
  const z$1 = v4.z;
  const coerce = {};
  let schema;
  if (isWithEnum(column)) {
    schema = column.enumValues.length ? z$1.enum(column.enumValues) : z$1.string();
  }
  if (!schema) {
    if (isColumnType(column, ["PgGeometry", "PgPointTuple"])) {
      schema = z$1.tuple([z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgGeometryObject", "PgPointObject"])) {
      schema = z$1.object({ x: z$1.number(), y: z$1.number() });
    } else if (isColumnType(column, ["PgHalfVector", "PgVector"])) {
      schema = z$1.array(z$1.number());
      schema = column.dimensions ? schema.length(column.dimensions) : schema;
    } else if (isColumnType(column, ["PgLine"])) {
      schema = z$1.tuple([z$1.number(), z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgLineABC"])) {
      schema = z$1.object({
        a: z$1.number(),
        b: z$1.number(),
        c: z$1.number()
      });
    } else if (isColumnType(column, ["PgArray"])) {
      schema = z$1.array(columnToSchema(column.baseColumn));
      schema = column.size ? schema.length(column.size) : schema;
    } else if (column.dataType === "array") {
      schema = z$1.array(z$1.any());
    } else if (column.dataType === "number") {
      schema = numberColumnToSchema(column, z$1, coerce);
    } else if (column.dataType === "bigint") {
      schema = bigintColumnToSchema(column, z$1, coerce);
    } else if (column.dataType === "boolean") {
      schema = coerce === true || coerce.boolean ? z$1.coerce.boolean() : z$1.boolean();
    } else if (column.dataType === "date") {
      schema = coerce === true || coerce.date ? z$1.coerce.date() : z$1.date();
    } else if (column.dataType === "string") {
      schema = stringColumnToSchema(column, z$1, coerce);
    } else if (column.dataType === "json") {
      schema = jsonSchema;
    } else if (column.dataType === "custom") {
      schema = z$1.any();
    } else if (column.dataType === "buffer") {
      schema = bufferSchema;
    }
  }
  if (!schema) {
    schema = z$1.any();
  }
  return schema;
}
function numberColumnToSchema(column, z2, coerce) {
  let unsigned = column.getSQLType().includes("unsigned");
  let min;
  let max;
  let integer2 = false;
  if (isColumnType(column, ["MySqlTinyInt", "SingleStoreTinyInt"])) {
    min = unsigned ? 0 : CONSTANTS.INT8_MIN;
    max = unsigned ? CONSTANTS.INT8_UNSIGNED_MAX : CONSTANTS.INT8_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgSmallInt",
    "PgSmallSerial",
    "MySqlSmallInt",
    "SingleStoreSmallInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT16_MIN;
    max = unsigned ? CONSTANTS.INT16_UNSIGNED_MAX : CONSTANTS.INT16_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgReal",
    "MySqlFloat",
    "MySqlMediumInt",
    "SingleStoreMediumInt",
    "SingleStoreFloat"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT24_MIN;
    max = unsigned ? CONSTANTS.INT24_UNSIGNED_MAX : CONSTANTS.INT24_MAX;
    integer2 = isColumnType(column, ["MySqlMediumInt", "SingleStoreMediumInt"]);
  } else if (isColumnType(column, [
    "PgInteger",
    "PgSerial",
    "MySqlInt",
    "SingleStoreInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT32_MIN;
    max = unsigned ? CONSTANTS.INT32_UNSIGNED_MAX : CONSTANTS.INT32_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgDoublePrecision",
    "MySqlReal",
    "MySqlDouble",
    "SingleStoreReal",
    "SingleStoreDouble",
    "SQLiteReal"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT48_MIN;
    max = unsigned ? CONSTANTS.INT48_UNSIGNED_MAX : CONSTANTS.INT48_MAX;
  } else if (isColumnType(column, [
    "PgBigInt53",
    "PgBigSerial53",
    "MySqlBigInt53",
    "MySqlSerial",
    "SingleStoreBigInt53",
    "SingleStoreSerial",
    "SQLiteInteger"
  ])) {
    unsigned = unsigned || isColumnType(column, ["MySqlSerial", "SingleStoreSerial"]);
    min = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
    integer2 = true;
  } else if (isColumnType(column, ["MySqlYear", "SingleStoreYear"])) {
    min = 1901;
    max = 2155;
    integer2 = true;
  } else {
    min = Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
  }
  let schema = coerce === true || coerce?.number ? integer2 ? z2.coerce.number() : z2.coerce.number().int() : integer2 ? z2.int() : z2.number();
  schema = schema.gte(min).lte(max);
  return schema;
}
function bigintColumnToSchema(column, z2, coerce) {
  const unsigned = column.getSQLType().includes("unsigned");
  const min = unsigned ? 0n : CONSTANTS.INT64_MIN;
  const max = unsigned ? CONSTANTS.INT64_UNSIGNED_MAX : CONSTANTS.INT64_MAX;
  const schema = coerce === true || coerce?.bigint ? z2.coerce.bigint() : z2.bigint();
  return schema.gte(min).lte(max);
}
function stringColumnToSchema(column, z2, coerce) {
  if (isColumnType(column, ["PgUUID"])) {
    return z2.uuid();
  }
  let max;
  let regex;
  let fixed = false;
  if (isColumnType(column, ["PgVarchar", "SQLiteText"])) {
    max = column.length;
  } else if (isColumnType(column, ["MySqlVarChar", "SingleStoreVarChar"])) {
    max = column.length ?? CONSTANTS.INT16_UNSIGNED_MAX;
  } else if (isColumnType(column, ["MySqlText", "SingleStoreText"])) {
    if (column.textType === "longtext") {
      max = CONSTANTS.INT32_UNSIGNED_MAX;
    } else if (column.textType === "mediumtext") {
      max = CONSTANTS.INT24_UNSIGNED_MAX;
    } else if (column.textType === "text") {
      max = CONSTANTS.INT16_UNSIGNED_MAX;
    } else {
      max = CONSTANTS.INT8_UNSIGNED_MAX;
    }
  }
  if (isColumnType(column, [
    "PgChar",
    "MySqlChar",
    "SingleStoreChar"
  ])) {
    max = column.length;
    fixed = true;
  }
  if (isColumnType(column, ["PgBinaryVector"])) {
    regex = /^[01]+$/;
    max = column.dimensions;
  }
  let schema = coerce === true || coerce?.string ? z2.coerce.string() : z2.string();
  schema = regex ? schema.regex(regex) : schema;
  return max && fixed ? schema.length(max) : max ? schema.max(max) : schema;
}
function getColumns(tableLike) {
  return drizzleOrm.isTable(tableLike) ? drizzleOrm.getTableColumns(tableLike) : drizzleOrm.getViewSelectedFields(tableLike);
}
function handleColumns(columns, refinements, conditions, factory) {
  const columnSchemas = {};
  for (const [key, selected] of Object.entries(columns)) {
    if (!drizzleOrm.is(selected, drizzleOrm.Column) && !drizzleOrm.is(selected, drizzleOrm.SQL) && !drizzleOrm.is(selected, drizzleOrm.SQL.Aliased) && typeof selected === "object") {
      const columns2 = drizzleOrm.isTable(selected) || drizzleOrm.isView(selected) ? getColumns(selected) : selected;
      columnSchemas[key] = handleColumns(columns2, refinements[key] ?? {}, conditions);
      continue;
    }
    const refinement = refinements[key];
    if (refinement !== void 0 && typeof refinement !== "function") {
      columnSchemas[key] = refinement;
      continue;
    }
    const column = drizzleOrm.is(selected, drizzleOrm.Column) ? selected : void 0;
    const schema = column ? columnToSchema(column) : v4.z.any();
    const refined = typeof refinement === "function" ? refinement(schema) : schema;
    if (conditions.never(column)) {
      continue;
    } else {
      columnSchemas[key] = refined;
    }
    if (column) {
      if (conditions.nullable(column)) {
        columnSchemas[key] = columnSchemas[key].nullable();
      }
      if (conditions.optional(column)) {
        columnSchemas[key] = columnSchemas[key].optional();
      }
    }
  }
  return v4.z.object(columnSchemas);
}
function handleEnum(enum_, factory) {
  const zod = v4.z;
  return zod.enum(enum_.enumValues);
}
var selectConditions = {
  never: () => false,
  optional: () => false,
  nullable: (column) => !column.notNull
};
var insertConditions = {
  never: (column) => column?.generated?.type === "always" || column?.generatedIdentity?.type === "always",
  optional: (column) => !column.notNull || column.notNull && column.hasDefault,
  nullable: (column) => !column.notNull
};
var createSelectSchema = (entity, refine) => {
  if (isPgEnum(entity)) {
    return handleEnum(entity);
  }
  const columns = getColumns(entity);
  return handleColumns(columns, {}, selectConditions);
};
var createInsertSchema = (entity, refine) => {
  const columns = getColumns(entity);
  return handleColumns(columns, refine ?? {}, insertConditions);
};

// src/db/schema.ts
var users = sqliteCore.sqliteTable("users", {
  id: sqliteCore.text("id").primaryKey(),
  email: sqliteCore.text("email").notNull().unique(),
  username: sqliteCore.text("username").notNull().unique(),
  firstName: sqliteCore.text("first_name").notNull(),
  lastName: sqliteCore.text("last_name").notNull(),
  passwordHash: sqliteCore.text("password_hash"),
  // Hashed password, nullable for OAuth users
  role: sqliteCore.text("role").notNull().default("viewer"),
  // 'admin', 'editor', 'author', 'viewer'
  avatar: sqliteCore.text("avatar"),
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: sqliteCore.integer("last_login_at"),
  createdAt: sqliteCore.integer("created_at").notNull(),
  updatedAt: sqliteCore.integer("updated_at").notNull()
});
var collections = sqliteCore.sqliteTable("collections", {
  id: sqliteCore.text("id").primaryKey(),
  name: sqliteCore.text("name").notNull().unique(),
  displayName: sqliteCore.text("display_name").notNull(),
  description: sqliteCore.text("description"),
  schema: sqliteCore.text("schema", { mode: "json" }).notNull(),
  // JSON schema definition
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  managed: sqliteCore.integer("managed", { mode: "boolean" }).notNull().default(false),
  // Config-managed collections cannot be edited in UI
  createdAt: sqliteCore.integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: sqliteCore.integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var content = sqliteCore.sqliteTable("content", {
  id: sqliteCore.text("id").primaryKey(),
  collectionId: sqliteCore.text("collection_id").notNull().references(() => collections.id),
  slug: sqliteCore.text("slug").notNull(),
  title: sqliteCore.text("title").notNull(),
  data: sqliteCore.text("data", { mode: "json" }).notNull(),
  // JSON content data
  status: sqliteCore.text("status").notNull().default("draft"),
  // 'draft', 'published', 'archived'
  publishedAt: sqliteCore.integer("published_at", { mode: "timestamp" }),
  authorId: sqliteCore.text("author_id").notNull().references(() => users.id),
  createdAt: sqliteCore.integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: sqliteCore.integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var contentVersions = sqliteCore.sqliteTable("content_versions", {
  id: sqliteCore.text("id").primaryKey(),
  contentId: sqliteCore.text("content_id").notNull().references(() => content.id),
  version: sqliteCore.integer("version").notNull(),
  data: sqliteCore.text("data", { mode: "json" }).notNull(),
  authorId: sqliteCore.text("author_id").notNull().references(() => users.id),
  createdAt: sqliteCore.integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var media = sqliteCore.sqliteTable("media", {
  id: sqliteCore.text("id").primaryKey(),
  filename: sqliteCore.text("filename").notNull(),
  originalName: sqliteCore.text("original_name").notNull(),
  mimeType: sqliteCore.text("mime_type").notNull(),
  size: sqliteCore.integer("size").notNull(),
  width: sqliteCore.integer("width"),
  height: sqliteCore.integer("height"),
  folder: sqliteCore.text("folder").notNull().default("uploads"),
  r2Key: sqliteCore.text("r2_key").notNull(),
  // R2 storage key
  publicUrl: sqliteCore.text("public_url").notNull(),
  // CDN URL
  thumbnailUrl: sqliteCore.text("thumbnail_url"),
  alt: sqliteCore.text("alt"),
  caption: sqliteCore.text("caption"),
  tags: sqliteCore.text("tags", { mode: "json" }),
  // JSON array of tags
  uploadedBy: sqliteCore.text("uploaded_by").notNull().references(() => users.id),
  uploadedAt: sqliteCore.integer("uploaded_at").notNull(),
  updatedAt: sqliteCore.integer("updated_at"),
  publishedAt: sqliteCore.integer("published_at"),
  scheduledAt: sqliteCore.integer("scheduled_at"),
  archivedAt: sqliteCore.integer("archived_at"),
  deletedAt: sqliteCore.integer("deleted_at")
});
var apiTokens = sqliteCore.sqliteTable("api_tokens", {
  id: sqliteCore.text("id").primaryKey(),
  name: sqliteCore.text("name").notNull(),
  token: sqliteCore.text("token").notNull().unique(),
  userId: sqliteCore.text("user_id").notNull().references(() => users.id),
  permissions: sqliteCore.text("permissions", { mode: "json" }).notNull(),
  // Array of permissions
  expiresAt: sqliteCore.integer("expires_at", { mode: "timestamp" }),
  lastUsedAt: sqliteCore.integer("last_used_at", { mode: "timestamp" }),
  createdAt: sqliteCore.integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var workflowHistory = sqliteCore.sqliteTable("workflow_history", {
  id: sqliteCore.text("id").primaryKey(),
  contentId: sqliteCore.text("content_id").notNull().references(() => content.id),
  action: sqliteCore.text("action").notNull(),
  fromStatus: sqliteCore.text("from_status").notNull(),
  toStatus: sqliteCore.text("to_status").notNull(),
  userId: sqliteCore.text("user_id").notNull().references(() => users.id),
  comment: sqliteCore.text("comment"),
  createdAt: sqliteCore.integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var plugins = sqliteCore.sqliteTable("plugins", {
  id: sqliteCore.text("id").primaryKey(),
  name: sqliteCore.text("name").notNull().unique(),
  displayName: sqliteCore.text("display_name").notNull(),
  description: sqliteCore.text("description"),
  version: sqliteCore.text("version").notNull(),
  author: sqliteCore.text("author").notNull(),
  category: sqliteCore.text("category").notNull(),
  icon: sqliteCore.text("icon"),
  status: sqliteCore.text("status").notNull().default("inactive"),
  // 'active', 'inactive', 'error'
  isCore: sqliteCore.integer("is_core", { mode: "boolean" }).notNull().default(false),
  settings: sqliteCore.text("settings", { mode: "json" }),
  permissions: sqliteCore.text("permissions", { mode: "json" }),
  dependencies: sqliteCore.text("dependencies", { mode: "json" }),
  downloadCount: sqliteCore.integer("download_count").notNull().default(0),
  rating: sqliteCore.integer("rating").notNull().default(0),
  installedAt: sqliteCore.integer("installed_at").notNull(),
  activatedAt: sqliteCore.integer("activated_at"),
  lastUpdated: sqliteCore.integer("last_updated").notNull(),
  errorMessage: sqliteCore.text("error_message"),
  createdAt: sqliteCore.integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1e3)),
  updatedAt: sqliteCore.integer("updated_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1e3))
});
var pluginHooks = sqliteCore.sqliteTable("plugin_hooks", {
  id: sqliteCore.text("id").primaryKey(),
  pluginId: sqliteCore.text("plugin_id").notNull().references(() => plugins.id),
  hookName: sqliteCore.text("hook_name").notNull(),
  handlerName: sqliteCore.text("handler_name").notNull(),
  priority: sqliteCore.integer("priority").notNull().default(10),
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteCore.integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1e3))
});
var pluginRoutes = sqliteCore.sqliteTable("plugin_routes", {
  id: sqliteCore.text("id").primaryKey(),
  pluginId: sqliteCore.text("plugin_id").notNull().references(() => plugins.id),
  path: sqliteCore.text("path").notNull(),
  method: sqliteCore.text("method").notNull(),
  handlerName: sqliteCore.text("handler_name").notNull(),
  middleware: sqliteCore.text("middleware", { mode: "json" }),
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteCore.integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1e3))
});
var pluginAssets = sqliteCore.sqliteTable("plugin_assets", {
  id: sqliteCore.text("id").primaryKey(),
  pluginId: sqliteCore.text("plugin_id").notNull().references(() => plugins.id),
  assetType: sqliteCore.text("asset_type").notNull(),
  // 'css', 'js', 'image', 'font'
  assetPath: sqliteCore.text("asset_path").notNull(),
  loadOrder: sqliteCore.integer("load_order").notNull().default(100),
  loadLocation: sqliteCore.text("load_location").notNull().default("footer"),
  // 'header', 'footer'
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteCore.integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1e3))
});
var pluginActivityLog = sqliteCore.sqliteTable("plugin_activity_log", {
  id: sqliteCore.text("id").primaryKey(),
  pluginId: sqliteCore.text("plugin_id").notNull().references(() => plugins.id),
  action: sqliteCore.text("action").notNull(),
  userId: sqliteCore.text("user_id"),
  details: sqliteCore.text("details", { mode: "json" }),
  timestamp: sqliteCore.integer("timestamp").notNull().$defaultFn(() => Math.floor(Date.now() / 1e3))
});
var insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
  firstName: (schema) => schema.min(1),
  lastName: (schema) => schema.min(1),
  username: (schema) => schema.min(3)
});
var selectUserSchema = createSelectSchema(users);
var insertCollectionSchema = createInsertSchema(collections, {
  name: (schema) => schema.min(1).regex(/^[a-z0-9_]+$/, "Collection name must be lowercase with underscores"),
  displayName: (schema) => schema.min(1)
});
var selectCollectionSchema = createSelectSchema(collections);
var insertContentSchema = createInsertSchema(content, {
  slug: (schema) => schema.min(1).regex(/^[a-zA-Z0-9_-]+$/, "Slug must contain only letters, numbers, underscores, and hyphens"),
  title: (schema) => schema.min(1),
  status: (schema) => schema
});
var selectContentSchema = createSelectSchema(content);
var insertMediaSchema = createInsertSchema(media, {
  filename: (schema) => schema.min(1),
  originalName: (schema) => schema.min(1),
  mimeType: (schema) => schema.min(1),
  size: (schema) => schema.positive(),
  r2Key: (schema) => schema.min(1),
  publicUrl: (schema) => schema.url(),
  folder: (schema) => schema.min(1)
});
var selectMediaSchema = createSelectSchema(media);
var insertWorkflowHistorySchema = createInsertSchema(workflowHistory, {
  action: (schema) => schema.min(1),
  fromStatus: (schema) => schema.min(1),
  toStatus: (schema) => schema.min(1)
});
var selectWorkflowHistorySchema = createSelectSchema(workflowHistory);
var insertPluginSchema = createInsertSchema(plugins, {
  name: (schema) => schema.min(1),
  displayName: (schema) => schema.min(1),
  version: (schema) => schema.min(1),
  author: (schema) => schema.min(1),
  category: (schema) => schema.min(1)
});
var selectPluginSchema = createSelectSchema(plugins);
var insertPluginHookSchema = createInsertSchema(pluginHooks, {
  hookName: (schema) => schema.min(1),
  handlerName: (schema) => schema.min(1)
});
var selectPluginHookSchema = createSelectSchema(pluginHooks);
var insertPluginRouteSchema = createInsertSchema(pluginRoutes, {
  path: (schema) => schema.min(1),
  method: (schema) => schema.min(1),
  handlerName: (schema) => schema.min(1)
});
var selectPluginRouteSchema = createSelectSchema(pluginRoutes);
var insertPluginAssetSchema = createInsertSchema(pluginAssets, {
  assetType: (schema) => schema.min(1),
  assetPath: (schema) => schema.min(1)
});
var selectPluginAssetSchema = createSelectSchema(pluginAssets);
var insertPluginActivityLogSchema = createInsertSchema(pluginActivityLog, {
  action: (schema) => schema.min(1)
});
var selectPluginActivityLogSchema = createSelectSchema(pluginActivityLog);
var systemLogs = sqliteCore.sqliteTable("system_logs", {
  id: sqliteCore.text("id").primaryKey(),
  level: sqliteCore.text("level").notNull(),
  // 'debug', 'info', 'warn', 'error', 'fatal'
  category: sqliteCore.text("category").notNull(),
  // 'auth', 'api', 'workflow', 'plugin', 'media', 'system', etc.
  message: sqliteCore.text("message").notNull(),
  data: sqliteCore.text("data", { mode: "json" }),
  // Additional structured data
  userId: sqliteCore.text("user_id").references(() => users.id),
  sessionId: sqliteCore.text("session_id"),
  requestId: sqliteCore.text("request_id"),
  ipAddress: sqliteCore.text("ip_address"),
  userAgent: sqliteCore.text("user_agent"),
  method: sqliteCore.text("method"),
  // HTTP method for API logs
  url: sqliteCore.text("url"),
  // Request URL for API logs
  statusCode: sqliteCore.integer("status_code"),
  // HTTP status code for API logs
  duration: sqliteCore.integer("duration"),
  // Request duration in milliseconds
  stackTrace: sqliteCore.text("stack_trace"),
  // Error stack trace for error logs
  tags: sqliteCore.text("tags", { mode: "json" }),
  // Array of tags for categorization
  source: sqliteCore.text("source"),
  // Source component/module that generated the log
  createdAt: sqliteCore.integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var logConfig = sqliteCore.sqliteTable("log_config", {
  id: sqliteCore.text("id").primaryKey(),
  category: sqliteCore.text("category").notNull().unique(),
  enabled: sqliteCore.integer("enabled", { mode: "boolean" }).notNull().default(true),
  level: sqliteCore.text("level").notNull().default("info"),
  // minimum log level to store
  retention: sqliteCore.integer("retention").notNull().default(30),
  // days to keep logs
  maxSize: sqliteCore.integer("max_size").default(1e4),
  // max number of logs per category
  createdAt: sqliteCore.integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: sqliteCore.integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var insertSystemLogSchema = createInsertSchema(systemLogs, {
  level: (schema) => schema.min(1),
  category: (schema) => schema.min(1),
  message: (schema) => schema.min(1)
});
var selectSystemLogSchema = createSelectSchema(systemLogs);
var insertLogConfigSchema = createInsertSchema(logConfig, {
  category: (schema) => schema.min(1),
  level: (schema) => schema.min(1)
});
var selectLogConfigSchema = createSelectSchema(logConfig);
var Logger = class {
  db;
  enabled = true;
  configCache = /* @__PURE__ */ new Map();
  lastConfigRefresh = 0;
  configRefreshInterval = 6e4;
  // 1 minute
  constructor(database) {
    this.db = d1.drizzle(database);
  }
  /**
   * Log a debug message
   */
  async debug(category, message, data, context) {
    return this.log("debug", category, message, data, context);
  }
  /**
   * Log an info message
   */
  async info(category, message, data, context) {
    return this.log("info", category, message, data, context);
  }
  /**
   * Log a warning message
   */
  async warn(category, message, data, context) {
    return this.log("warn", category, message, data, context);
  }
  /**
   * Log an error message
   */
  async error(category, message, error, context) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    return this.log("error", category, message, errorData, {
      ...context,
      stackTrace: error instanceof Error ? error.stack : void 0
    });
  }
  /**
   * Log a fatal message
   */
  async fatal(category, message, error, context) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    return this.log("fatal", category, message, errorData, {
      ...context,
      stackTrace: error instanceof Error ? error.stack : void 0
    });
  }
  /**
   * Log an API request
   */
  async logRequest(method, url, statusCode, duration, context) {
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    return this.log(level, "api", `${method} ${url} - ${statusCode}`, {
      method,
      url,
      statusCode,
      duration
    }, {
      ...context,
      method,
      url,
      statusCode,
      duration
    });
  }
  /**
   * Log an authentication event
   */
  async logAuth(action, userId, success = true, context) {
    const level = success ? "info" : "warn";
    return this.log(level, "auth", `Authentication ${action}: ${success ? "success" : "failed"}`, {
      action,
      success,
      userId
    }, {
      ...context,
      userId,
      tags: ["authentication", action]
    });
  }
  /**
   * Log a security event
   */
  async logSecurity(event, severity, context) {
    const level = severity === "critical" ? "fatal" : severity === "high" ? "error" : "warn";
    return this.log(level, "security", `Security event: ${event}`, {
      event,
      severity
    }, {
      ...context,
      tags: ["security", severity]
    });
  }
  /**
   * Core logging method
   */
  async log(level, category, message, data, context) {
    if (!this.enabled) return;
    try {
      const config = await this.getConfig(category);
      if (!config || !config.enabled || !this.shouldLog(level, config.level)) {
        return;
      }
      const logEntry = {
        id: crypto.randomUUID(),
        level,
        category,
        message,
        data: data ? JSON.stringify(data) : null,
        userId: context?.userId || null,
        sessionId: context?.sessionId || null,
        requestId: context?.requestId || null,
        ipAddress: context?.ipAddress || null,
        userAgent: context?.userAgent || null,
        method: context?.method || null,
        url: context?.url || null,
        statusCode: context?.statusCode || null,
        duration: context?.duration || null,
        stackTrace: context?.stackTrace || null,
        tags: context?.tags ? JSON.stringify(context.tags) : null,
        source: context?.source || null,
        createdAt: /* @__PURE__ */ new Date()
      };
      await this.db.insert(systemLogs).values(logEntry);
      if (config.maxSize) {
        await this.cleanupCategory(category, config.maxSize);
      }
    } catch (error) {
      console.error("Logger error:", error);
    }
  }
  /**
   * Get logs with filtering and pagination
   */
  async getLogs(filter = {}) {
    try {
      const conditions = [];
      if (filter.level && filter.level.length > 0) {
        conditions.push(drizzleOrm.inArray(systemLogs.level, filter.level));
      }
      if (filter.category && filter.category.length > 0) {
        conditions.push(drizzleOrm.inArray(systemLogs.category, filter.category));
      }
      if (filter.userId) {
        conditions.push(drizzleOrm.eq(systemLogs.userId, filter.userId));
      }
      if (filter.source) {
        conditions.push(drizzleOrm.eq(systemLogs.source, filter.source));
      }
      if (filter.search) {
        conditions.push(
          drizzleOrm.like(systemLogs.message, `%${filter.search}%`)
        );
      }
      if (filter.startDate) {
        conditions.push(drizzleOrm.gte(systemLogs.createdAt, filter.startDate));
      }
      if (filter.endDate) {
        conditions.push(drizzleOrm.lte(systemLogs.createdAt, filter.endDate));
      }
      const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
      const totalResult = await this.db.select({ count: drizzleOrm.count() }).from(systemLogs).where(whereClause);
      const total = totalResult[0]?.count || 0;
      const sortColumn = filter.sortBy === "level" ? systemLogs.level : filter.sortBy === "category" ? systemLogs.category : systemLogs.createdAt;
      const sortFn = filter.sortOrder === "asc" ? drizzleOrm.asc : drizzleOrm.desc;
      const logs = await this.db.select().from(systemLogs).where(whereClause).orderBy(sortFn(sortColumn)).limit(filter.limit || 50).offset(filter.offset || 0);
      return { logs, total };
    } catch (error) {
      console.error("Error getting logs:", error);
      return { logs: [], total: 0 };
    }
  }
  /**
   * Get log configuration for a category
   */
  async getConfig(category) {
    try {
      const now = Date.now();
      if (this.configCache.has(category) && now - this.lastConfigRefresh < this.configRefreshInterval) {
        return this.configCache.get(category) || null;
      }
      const configs = await this.db.select().from(logConfig).where(drizzleOrm.eq(logConfig.category, category));
      const config = configs[0] || null;
      if (config) {
        this.configCache.set(category, config);
        this.lastConfigRefresh = now;
      }
      return config;
    } catch (error) {
      console.error("Error getting log config:", error);
      return null;
    }
  }
  /**
   * Update log configuration
   */
  async updateConfig(category, updates) {
    try {
      await this.db.update(logConfig).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(drizzleOrm.eq(logConfig.category, category));
      this.configCache.delete(category);
    } catch (error) {
      console.error("Error updating log config:", error);
    }
  }
  /**
   * Get all log configurations
   */
  async getAllConfigs() {
    try {
      return await this.db.select().from(logConfig);
    } catch (error) {
      console.error("Error getting log configs:", error);
      return [];
    }
  }
  /**
   * Clean up old logs for a category
   */
  async cleanupCategory(category, maxSize) {
    try {
      const countResult = await this.db.select({ count: drizzleOrm.count() }).from(systemLogs).where(drizzleOrm.eq(systemLogs.category, category));
      const currentCount = countResult[0]?.count || 0;
      if (currentCount > maxSize) {
        const cutoffLogs = await this.db.select({ createdAt: systemLogs.createdAt }).from(systemLogs).where(drizzleOrm.eq(systemLogs.category, category)).orderBy(drizzleOrm.desc(systemLogs.createdAt)).limit(1).offset(maxSize - 1);
        if (cutoffLogs[0]) {
          await this.db.delete(systemLogs).where(
            drizzleOrm.and(
              drizzleOrm.eq(systemLogs.category, category),
              drizzleOrm.lte(systemLogs.createdAt, cutoffLogs[0].createdAt)
            )
          );
        }
      }
    } catch (error) {
      console.error("Error cleaning up logs:", error);
    }
  }
  /**
   * Clean up logs based on retention policy
   */
  async cleanupByRetention() {
    try {
      const configs = await this.getAllConfigs();
      for (const config of configs) {
        if (config.retention > 0) {
          const cutoffDate = /* @__PURE__ */ new Date();
          cutoffDate.setDate(cutoffDate.getDate() - config.retention);
          await this.db.delete(systemLogs).where(
            drizzleOrm.and(
              drizzleOrm.eq(systemLogs.category, config.category),
              drizzleOrm.lte(systemLogs.createdAt, cutoffDate)
            )
          );
        }
      }
    } catch (error) {
      console.error("Error cleaning up logs by retention:", error);
    }
  }
  /**
   * Check if a log level should be recorded based on configuration
   */
  shouldLog(level, configLevel) {
    const levels = ["debug", "info", "warn", "error", "fatal"];
    const levelIndex = levels.indexOf(level);
    const configLevelIndex = levels.indexOf(configLevel);
    return levelIndex >= configLevelIndex;
  }
  /**
   * Enable or disable logging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  /**
   * Check if logging is enabled
   */
  isEnabled() {
    return this.enabled;
  }
};
var loggerInstance = null;
function getLogger(database) {
  if (!loggerInstance && database) {
    loggerInstance = new Logger(database);
  }
  if (!loggerInstance) {
    throw new Error("Logger not initialized. Call getLogger with a database instance first.");
  }
  return loggerInstance;
}
function initLogger(database) {
  loggerInstance = new Logger(database);
  return loggerInstance;
}

// src/services/plugin-service.ts
var PluginService = class {
  constructor(db) {
    this.db = db;
  }
  async getAllPlugins() {
    await this.ensureAllPluginsExist();
    const stmt = this.db.prepare(`
      SELECT * FROM plugins
      ORDER BY is_core DESC, display_name ASC
    `);
    const { results } = await stmt.all();
    return (results || []).map(this.mapPluginFromDb);
  }
  /**
   * Ensure all plugins from the registry exist in the database
   * Auto-installs any newly detected plugins with inactive status
   *
   * Note: This method should be overridden or configured with a plugin registry
   * in the consuming application
   */
  async ensureAllPluginsExist() {
    console.log("[PluginService] ensureAllPluginsExist - requires PLUGIN_REGISTRY configuration");
  }
  async getPlugin(pluginId) {
    const stmt = this.db.prepare("SELECT * FROM plugins WHERE id = ?");
    const plugin = await stmt.bind(pluginId).first();
    if (!plugin) return null;
    return this.mapPluginFromDb(plugin);
  }
  async getPluginByName(name) {
    const stmt = this.db.prepare("SELECT * FROM plugins WHERE name = ?");
    const plugin = await stmt.bind(name).first();
    if (!plugin) return null;
    return this.mapPluginFromDb(plugin);
  }
  async getPluginStats() {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as errors
      FROM plugins
    `);
    const stats = await stmt.first();
    return {
      total: stats.total || 0,
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      errors: stats.errors || 0
    };
  }
  async installPlugin(pluginData) {
    const id = pluginData.id || `plugin-${Date.now()}`;
    const now = Math.floor(Date.now() / 1e3);
    const stmt = this.db.prepare(`
      INSERT INTO plugins (
        id, name, display_name, description, version, author, category, icon,
        status, is_core, settings, permissions, dependencies, download_count, 
        rating, installed_at, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      id,
      pluginData.name || id,
      pluginData.display_name || "Unnamed Plugin",
      pluginData.description || "",
      pluginData.version || "1.0.0",
      pluginData.author || "Unknown",
      pluginData.category || "utilities",
      pluginData.icon || "\u{1F50C}",
      "inactive",
      pluginData.is_core || false,
      JSON.stringify(pluginData.settings || {}),
      JSON.stringify(pluginData.permissions || []),
      JSON.stringify(pluginData.dependencies || []),
      pluginData.download_count || 0,
      pluginData.rating || 0,
      now,
      now
    ).run();
    await this.logActivity(id, "installed", null, { version: pluginData.version });
    const installed = await this.getPlugin(id);
    if (!installed) throw new Error("Failed to install plugin");
    return installed;
  }
  async uninstallPlugin(pluginId) {
    const plugin = await this.getPlugin(pluginId);
    if (!plugin) throw new Error("Plugin not found");
    if (plugin.is_core) throw new Error("Cannot uninstall core plugins");
    if (plugin.status === "active") {
      await this.deactivatePlugin(pluginId);
    }
    const stmt = this.db.prepare("DELETE FROM plugins WHERE id = ?");
    await stmt.bind(pluginId).run();
    await this.logActivity(pluginId, "uninstalled", null, { name: plugin.name });
  }
  async activatePlugin(pluginId) {
    const plugin = await this.getPlugin(pluginId);
    if (!plugin) throw new Error("Plugin not found");
    if (plugin.dependencies && plugin.dependencies.length > 0) {
      await this.checkDependencies(plugin.dependencies);
    }
    const now = Math.floor(Date.now() / 1e3);
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET status = 'active', activated_at = ?, error_message = NULL 
      WHERE id = ?
    `);
    await stmt.bind(now, pluginId).run();
    await this.logActivity(pluginId, "activated", null);
  }
  async deactivatePlugin(pluginId) {
    const plugin = await this.getPlugin(pluginId);
    if (!plugin) throw new Error("Plugin not found");
    await this.checkDependents(plugin.name);
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET status = 'inactive', activated_at = NULL 
      WHERE id = ?
    `);
    await stmt.bind(pluginId).run();
    await this.logActivity(pluginId, "deactivated", null);
  }
  async updatePluginSettings(pluginId, settings) {
    const plugin = await this.getPlugin(pluginId);
    if (!plugin) throw new Error("Plugin not found");
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET settings = ?, updated_at = unixepoch() 
      WHERE id = ?
    `);
    await stmt.bind(JSON.stringify(settings), pluginId).run();
    await this.logActivity(pluginId, "settings_updated", null);
  }
  async setPluginError(pluginId, error) {
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET status = 'error', error_message = ? 
      WHERE id = ?
    `);
    await stmt.bind(error, pluginId).run();
    await this.logActivity(pluginId, "error", null, { error });
  }
  async getPluginActivity(pluginId, limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM plugin_activity_log 
      WHERE plugin_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    const { results } = await stmt.bind(pluginId, limit).all();
    return (results || []).map((row) => ({
      id: row.id,
      action: row.action,
      userId: row.user_id,
      details: row.details ? JSON.parse(row.details) : null,
      timestamp: row.timestamp
    }));
  }
  async registerHook(pluginId, hookName, handlerName, priority = 10) {
    const id = `hook-${Date.now()}`;
    const stmt = this.db.prepare(`
      INSERT INTO plugin_hooks (id, plugin_id, hook_name, handler_name, priority)
      VALUES (?, ?, ?, ?, ?)
    `);
    await stmt.bind(id, pluginId, hookName, handlerName, priority).run();
  }
  async registerRoute(pluginId, path, method, handlerName, middleware) {
    const id = `route-${Date.now()}`;
    const stmt = this.db.prepare(`
      INSERT INTO plugin_routes (id, plugin_id, path, method, handler_name, middleware)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      id,
      pluginId,
      path,
      method,
      handlerName,
      JSON.stringify(middleware || [])
    ).run();
  }
  async getPluginHooks(pluginId) {
    const stmt = this.db.prepare(`
      SELECT * FROM plugin_hooks 
      WHERE plugin_id = ? AND is_active = TRUE
      ORDER BY priority ASC
    `);
    const { results } = await stmt.bind(pluginId).all();
    return results || [];
  }
  async getPluginRoutes(pluginId) {
    const stmt = this.db.prepare(`
      SELECT * FROM plugin_routes 
      WHERE plugin_id = ? AND is_active = TRUE
    `);
    const { results } = await stmt.bind(pluginId).all();
    return results || [];
  }
  async checkDependencies(dependencies) {
    for (const dep of dependencies) {
      const plugin = await this.getPluginByName(dep);
      if (!plugin || plugin.status !== "active") {
        throw new Error(`Required dependency '${dep}' is not active`);
      }
    }
  }
  async checkDependents(pluginName) {
    const stmt = this.db.prepare(`
      SELECT id, display_name FROM plugins 
      WHERE status = 'active' 
      AND dependencies LIKE ?
    `);
    const { results } = await stmt.bind(`%"${pluginName}"%`).all();
    if (results && results.length > 0) {
      const names = results.map((p) => p.display_name).join(", ");
      throw new Error(`Cannot deactivate. The following plugins depend on this one: ${names}`);
    }
  }
  async logActivity(pluginId, action, userId, details) {
    const id = `activity-${Date.now()}`;
    const stmt = this.db.prepare(`
      INSERT INTO plugin_activity_log (id, plugin_id, action, user_id, details)
      VALUES (?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      id,
      pluginId,
      action,
      userId,
      details ? JSON.stringify(details) : null
    ).run();
  }
  mapPluginFromDb(row) {
    return {
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      description: row.description,
      version: row.version,
      author: row.author,
      category: row.category,
      icon: row.icon,
      status: row.status,
      is_core: row.is_core === 1,
      settings: row.settings ? JSON.parse(row.settings) : void 0,
      permissions: row.permissions ? JSON.parse(row.permissions) : void 0,
      dependencies: row.dependencies ? JSON.parse(row.dependencies) : void 0,
      download_count: row.download_count || 0,
      rating: row.rating || 0,
      installed_at: row.installed_at,
      activated_at: row.activated_at,
      last_updated: row.last_updated,
      error_message: row.error_message
    };
  }
};

// src/services/plugin-bootstrap.ts
var PluginBootstrapService = class {
  constructor(db) {
    this.db = db;
    this.pluginService = new PluginService(db);
  }
  pluginService;
  /**
   * Core plugins that should always be available in the system
   */
  CORE_PLUGINS = [
    {
      id: "core-auth",
      name: "core-auth",
      display_name: "Authentication System",
      description: "Core authentication and user management system",
      version: "1.0.0",
      author: "SonicJS Team",
      category: "security",
      icon: "\u{1F510}",
      permissions: ["manage:users", "manage:roles", "manage:permissions"],
      dependencies: [],
      settings: {
        requiredFields: {
          email: { required: true, minLength: 5, label: "Email", type: "email" },
          password: { required: true, minLength: 8, label: "Password", type: "password" },
          username: { required: true, minLength: 3, label: "Username", type: "text" },
          firstName: { required: true, minLength: 1, label: "First Name", type: "text" },
          lastName: { required: true, minLength: 1, label: "Last Name", type: "text" }
        },
        validation: {
          emailFormat: true,
          allowDuplicateUsernames: false,
          passwordRequirements: {
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false
          }
        },
        registration: {
          enabled: true,
          requireEmailVerification: false,
          defaultRole: "viewer"
        }
      }
    },
    {
      id: "core-media",
      name: "core-media",
      display_name: "Media Manager",
      description: "Core media upload and management system",
      version: "1.0.0",
      author: "SonicJS Team",
      category: "media",
      icon: "\u{1F4F8}",
      permissions: ["manage:media", "upload:files"],
      dependencies: [],
      settings: {}
    },
    {
      id: "database-tools",
      name: "database-tools",
      display_name: "Database Tools",
      description: "Database management tools including truncate, backup, and validation",
      version: "1.0.0",
      author: "SonicJS Team",
      category: "system",
      icon: "\u{1F5C4}\uFE0F",
      permissions: ["manage:database", "admin"],
      dependencies: [],
      settings: {
        enableTruncate: true,
        enableBackup: true,
        enableValidation: true,
        requireConfirmation: true
      }
    },
    {
      id: "seed-data",
      name: "seed-data",
      display_name: "Seed Data",
      description: "Generate realistic example users and content for testing and development",
      version: "1.0.0",
      author: "SonicJS Team",
      category: "development",
      icon: "\u{1F331}",
      permissions: ["admin"],
      dependencies: [],
      settings: {
        userCount: 20,
        contentCount: 200,
        defaultPassword: "password123"
      }
    },
    {
      id: "core-cache",
      name: "core-cache",
      display_name: "Cache System",
      description: "Three-tiered caching system with memory, KV, and database layers",
      version: "1.0.0",
      author: "SonicJS Team",
      category: "performance",
      icon: "\u26A1",
      permissions: ["manage:cache", "view:stats"],
      dependencies: [],
      settings: {
        enableMemoryCache: true,
        enableKVCache: true,
        enableDatabaseCache: true,
        defaultTTL: 3600
      }
    }
  ];
  /**
   * Bootstrap all core plugins - install them if they don't exist
   */
  async bootstrapCorePlugins() {
    console.log("[PluginBootstrap] Starting core plugin bootstrap process...");
    try {
      for (const corePlugin of this.CORE_PLUGINS) {
        await this.ensurePluginInstalled(corePlugin);
      }
      console.log(
        "[PluginBootstrap] Core plugin bootstrap completed successfully"
      );
    } catch (error) {
      console.error("[PluginBootstrap] Error during plugin bootstrap:", error);
      throw error;
    }
  }
  /**
   * Ensure a specific plugin is installed
   */
  async ensurePluginInstalled(plugin) {
    try {
      const existingPlugin = await this.pluginService.getPlugin(plugin.id);
      if (existingPlugin) {
        console.log(
          `[PluginBootstrap] Plugin already installed: ${plugin.display_name} (status: ${existingPlugin.status})`
        );
        if (existingPlugin.version !== plugin.version) {
          console.log(
            `[PluginBootstrap] Updating plugin version: ${plugin.display_name} from ${existingPlugin.version} to ${plugin.version}`
          );
          await this.updatePlugin(plugin);
        }
        if (plugin.id === "core-auth" && existingPlugin.status !== "active") {
          console.log(
            `[PluginBootstrap] Core-auth plugin is inactive, activating it now...`
          );
          await this.pluginService.activatePlugin(plugin.id);
        }
      } else {
        console.log(
          `[PluginBootstrap] Installing plugin: ${plugin.display_name}`
        );
        await this.pluginService.installPlugin({
          ...plugin,
          is_core: plugin.name.startsWith("core-")
        });
        if (plugin.name.startsWith("core-")) {
          console.log(
            `[PluginBootstrap] Activating newly installed core plugin: ${plugin.display_name}`
          );
          await this.pluginService.activatePlugin(plugin.id);
        }
      }
    } catch (error) {
      console.error(
        `[PluginBootstrap] Error ensuring plugin ${plugin.display_name}:`,
        error
      );
    }
  }
  /**
   * Update an existing plugin
   */
  async updatePlugin(plugin) {
    const now = Math.floor(Date.now() / 1e3);
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET 
        version = ?,
        description = ?,
        permissions = ?,
        settings = ?,
        last_updated = ?
      WHERE id = ?
    `);
    await stmt.bind(
      plugin.version,
      plugin.description,
      JSON.stringify(plugin.permissions),
      JSON.stringify(plugin.settings || {}),
      now,
      plugin.id
    ).run();
  }
  /**
   * Check if bootstrap is needed (first run detection)
   */
  async isBootstrapNeeded() {
    try {
      for (const corePlugin of this.CORE_PLUGINS.filter(
        (p) => p.name.startsWith("core-")
      )) {
        const exists = await this.pluginService.getPlugin(corePlugin.id);
        if (!exists) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(
        "[PluginBootstrap] Error checking bootstrap status:",
        error
      );
      return true;
    }
  }
};

exports.Logger = Logger;
exports.MigrationService = MigrationService;
exports.PluginBootstrapService = PluginBootstrapService;
exports.PluginService = PluginService;
exports.apiTokens = apiTokens;
exports.cleanupRemovedCollections = cleanupRemovedCollections;
exports.collections = collections;
exports.content = content;
exports.contentVersions = contentVersions;
exports.fullCollectionSync = fullCollectionSync;
exports.getAvailableCollectionNames = getAvailableCollectionNames;
exports.getLogger = getLogger;
exports.getManagedCollections = getManagedCollections;
exports.initLogger = initLogger;
exports.insertCollectionSchema = insertCollectionSchema;
exports.insertContentSchema = insertContentSchema;
exports.insertLogConfigSchema = insertLogConfigSchema;
exports.insertMediaSchema = insertMediaSchema;
exports.insertPluginActivityLogSchema = insertPluginActivityLogSchema;
exports.insertPluginAssetSchema = insertPluginAssetSchema;
exports.insertPluginHookSchema = insertPluginHookSchema;
exports.insertPluginRouteSchema = insertPluginRouteSchema;
exports.insertPluginSchema = insertPluginSchema;
exports.insertSystemLogSchema = insertSystemLogSchema;
exports.insertUserSchema = insertUserSchema;
exports.insertWorkflowHistorySchema = insertWorkflowHistorySchema;
exports.isCollectionManaged = isCollectionManaged;
exports.loadCollectionConfig = loadCollectionConfig;
exports.loadCollectionConfigs = loadCollectionConfigs;
exports.logConfig = logConfig;
exports.media = media;
exports.pluginActivityLog = pluginActivityLog;
exports.pluginAssets = pluginAssets;
exports.pluginHooks = pluginHooks;
exports.pluginRoutes = pluginRoutes;
exports.plugins = plugins;
exports.schema_exports = schema_exports;
exports.selectCollectionSchema = selectCollectionSchema;
exports.selectContentSchema = selectContentSchema;
exports.selectLogConfigSchema = selectLogConfigSchema;
exports.selectMediaSchema = selectMediaSchema;
exports.selectPluginActivityLogSchema = selectPluginActivityLogSchema;
exports.selectPluginAssetSchema = selectPluginAssetSchema;
exports.selectPluginHookSchema = selectPluginHookSchema;
exports.selectPluginRouteSchema = selectPluginRouteSchema;
exports.selectPluginSchema = selectPluginSchema;
exports.selectSystemLogSchema = selectSystemLogSchema;
exports.selectUserSchema = selectUserSchema;
exports.selectWorkflowHistorySchema = selectWorkflowHistorySchema;
exports.syncCollection = syncCollection;
exports.syncCollections = syncCollections;
exports.systemLogs = systemLogs;
exports.users = users;
exports.validateCollectionConfig = validateCollectionConfig;
exports.workflowHistory = workflowHistory;
//# sourceMappingURL=chunk-RNR4HA23.cjs.map
//# sourceMappingURL=chunk-RNR4HA23.cjs.map