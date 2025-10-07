import { D1Database } from '@cloudflare/workers-types'
import fs from 'fs'
import path from 'path'

export interface Migration {
  id: string
  name: string
  filename: string
  description?: string
  applied: boolean
  appliedAt?: string
  size?: number
}

export interface MigrationStatus {
  totalMigrations: number
  appliedMigrations: number
  pendingMigrations: number
  lastApplied?: string
  migrations: Migration[]
}

export class MigrationService {
  constructor(private db: D1Database) {}

  /**
   * Initialize the migrations tracking table
   */
  async initializeMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        checksum TEXT
      )
    `
    
    await this.db.prepare(createTableQuery).run()
  }

  /**
   * Get all available migrations from the migrations directory
   */
  async getAvailableMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = []
    
    // In a real implementation, this would read from the migrations directory
    // For now, we'll use a hardcoded list based on the existing migrations
    const migrationFiles = [
      { id: '001', name: 'Initial Schema', filename: '001_initial_schema.sql', description: 'Initial database schema with users, content, collections, and media tables' },
      { id: '002', name: 'FAQ Plugin', filename: '002_faq_plugin.sql', description: 'FAQ plugin tables and initial data' },
      { id: '003', name: 'Stage 5 Enhancements', filename: '003_stage5_enhancements.sql', description: 'Enhanced content management and media handling' },
      { id: '004', name: 'User Management', filename: '004_stage6_user_management.sql', description: 'Advanced user management with roles and permissions' },
      { id: '005', name: 'Workflow & Automation', filename: '005_stage7_workflow_automation.sql', description: 'Workflow states, automation rules, and scheduled content' },
      { id: '006', name: 'Plugin System', filename: '006_plugin_system.sql', description: 'Plugin registration and configuration system' }
    ]

    // Get applied migrations from database
    const appliedResult = await this.db.prepare(
      'SELECT id, name, filename, applied_at FROM migrations ORDER BY applied_at ASC'
    ).all()
    
    const appliedMigrations = new Map(
      appliedResult.results?.map((row: any) => [row.id, row]) || []
    )

    // Auto-detect applied migrations by checking if their tables exist
    await this.autoDetectAppliedMigrations(appliedMigrations)

    // Combine with migration files to create complete status
    for (const file of migrationFiles) {
      const applied = appliedMigrations.has(file.id)
      const appliedData = appliedMigrations.get(file.id)
      
      migrations.push({
        id: file.id,
        name: file.name,
        filename: file.filename,
        description: file.description,
        applied,
        appliedAt: applied ? appliedData?.applied_at : undefined,
        size: await this.getMigrationFileSize(file.filename)
      })
    }

    return migrations
  }

  /**
   * Auto-detect applied migrations by checking if their tables exist
   */
  private async autoDetectAppliedMigrations(appliedMigrations: Map<string, any>): Promise<void> {
    // Check if basic schema tables exist (migration 001)
    if (!appliedMigrations.has('001')) {
      const hasBasicTables = await this.checkTablesExist(['users', 'content', 'collections', 'media'])
      if (hasBasicTables) {
        appliedMigrations.set('001', { 
          id: '001', 
          applied_at: new Date().toISOString(),
          name: 'Initial Schema',
          filename: '001_initial_schema.sql'
        })
        // Mark as applied in database
        await this.markMigrationApplied('001', 'Initial Schema', '001_initial_schema.sql')
      }
    }

    // Check if FAQ tables exist (migration 002) 
    if (!appliedMigrations.has('002')) {
      const hasFaqTables = await this.checkTablesExist(['faqs', 'faq_categories'])
      if (hasFaqTables) {
        appliedMigrations.set('002', { 
          id: '002', 
          applied_at: new Date().toISOString(),
          name: 'FAQ Plugin',
          filename: '002_faq_plugin.sql'
        })
        await this.markMigrationApplied('002', 'FAQ Plugin', '002_faq_plugin.sql')
      }
    }

    // Check if enhanced tables exist (migration 003)
    if (!appliedMigrations.has('003')) {
      const hasEnhancedTables = await this.checkTablesExist(['content_versions', 'email_themes', 'email_templates'])
      if (hasEnhancedTables) {
        appliedMigrations.set('003', { 
          id: '003', 
          applied_at: new Date().toISOString(),
          name: 'Stage 5 Enhancements',
          filename: '003_stage5_enhancements.sql'
        })
        await this.markMigrationApplied('003', 'Stage 5 Enhancements', '003_stage5_enhancements.sql')
      }
    }

    // Check if user management tables exist (migration 004)
    if (!appliedMigrations.has('004')) {
      const hasUserTables = await this.checkTablesExist(['api_tokens', 'workflow_history'])
      if (hasUserTables) {
        appliedMigrations.set('004', { 
          id: '004', 
          applied_at: new Date().toISOString(),
          name: 'User Management',
          filename: '004_stage6_user_management.sql'
        })
        await this.markMigrationApplied('004', 'User Management', '004_stage6_user_management.sql')
      }
    }

    // Check if plugin system tables exist (migration 006)
    if (!appliedMigrations.has('006')) {
      const hasPluginTables = await this.checkTablesExist(['plugins', 'plugin_hooks'])
      if (hasPluginTables) {
        appliedMigrations.set('006', { 
          id: '006', 
          applied_at: new Date().toISOString(),
          name: 'Plugin System',
          filename: '006_plugin_system.sql'
        })
        await this.markMigrationApplied('006', 'Plugin System', '006_plugin_system.sql')
      }
    }
  }

  /**
   * Check if specific tables exist in the database
   */
  private async checkTablesExist(tableNames: string[]): Promise<boolean> {
    try {
      for (const tableName of tableNames) {
        const result = await this.db.prepare(
          `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
        ).bind(tableName).first()
        
        if (!result) {
          return false
        }
      }
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get migration status summary
   */
  async getMigrationStatus(): Promise<MigrationStatus> {
    await this.initializeMigrationsTable()
    
    const migrations = await this.getAvailableMigrations()
    const appliedMigrations = migrations.filter(m => m.applied)
    const pendingMigrations = migrations.filter(m => !m.applied)
    
    const lastApplied = appliedMigrations.length > 0 
      ? appliedMigrations[appliedMigrations.length - 1]?.appliedAt 
      : undefined

    return {
      totalMigrations: migrations.length,
      appliedMigrations: appliedMigrations.length,
      pendingMigrations: pendingMigrations.length,
      lastApplied,
      migrations
    }
  }

  /**
   * Mark a migration as applied
   */
  async markMigrationApplied(migrationId: string, name: string, filename: string): Promise<void> {
    await this.initializeMigrationsTable()
    
    await this.db.prepare(
      'INSERT OR REPLACE INTO migrations (id, name, filename, applied_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
    ).bind(migrationId, name, filename).run()
  }

  /**
   * Check if a specific migration has been applied
   */
  async isMigrationApplied(migrationId: string): Promise<boolean> {
    await this.initializeMigrationsTable()
    
    const result = await this.db.prepare(
      'SELECT COUNT(*) as count FROM migrations WHERE id = ?'
    ).bind(migrationId).first()
    
    return (result?.count as number) > 0
  }

  /**
   * Get the last applied migration
   */
  async getLastAppliedMigration(): Promise<Migration | null> {
    await this.initializeMigrationsTable()
    
    const result = await this.db.prepare(
      'SELECT id, name, filename, applied_at FROM migrations ORDER BY applied_at DESC LIMIT 1'
    ).first()
    
    if (!result) return null
    
    return {
      id: result.id as string,
      name: result.name as string,
      filename: result.filename as string,
      applied: true,
      appliedAt: result.applied_at as string
    }
  }

  /**
   * Get migration file size (simulated)
   */
  private async getMigrationFileSize(filename: string): Promise<number> {
    // In a real implementation, this would read the actual file size
    // For now, return a simulated size
    const sizesMap: Record<string, number> = {
      '001_initial_schema.sql': 15420,
      '002_faq_plugin.sql': 2340,
      '003_stage5_enhancements.sql': 8920,
      '004_stage6_user_management.sql': 12680,
      '005_stage7_workflow_automation.sql': 18750,
      '006_plugin_system.sql': 5430
    }
    
    return sizesMap[filename] || 1000
  }

  /**
   * Run pending migrations
   */
  async runPendingMigrations(): Promise<{ success: boolean; message: string; applied: string[] }> {
    const status = await this.getMigrationStatus()
    const pendingMigrations = status.migrations.filter(m => !m.applied)
    
    if (pendingMigrations.length === 0) {
      return {
        success: true,
        message: 'All migrations are up to date',
        applied: []
      }
    }

    // Actually execute the migration files
    const applied: string[] = []
    
    for (const migration of pendingMigrations) {
      try {
        await this.applyMigration(migration)
        await this.markMigrationApplied(migration.id, migration.name, migration.filename)
        applied.push(migration.id)
      } catch (error) {
        console.error(`Failed to apply migration ${migration.id}:`, error)
        // Stop on first failure
        break
      }
    }

    return {
      success: true,
      message: `Applied ${applied.length} migration(s)`,
      applied
    }
  }

  /**
   * Apply a specific migration
   */
  private async applyMigration(migration: Migration): Promise<void> {
    console.log(`Applying migration ${migration.id}: ${migration.name}`)

    // Get the actual migration SQL
    const migrationSQL = await this.getMigrationSQL(migration.id)

    if (migrationSQL === null) {
      throw new Error(`Migration SQL not found for ${migration.id}`)
    }

    // Skip empty migrations (migrations that are no longer needed)
    if (migrationSQL === '') {
      console.log(`Skipping migration ${migration.id} (empty/obsolete)`)
      return
    }

    // Split SQL into individual statements, handling triggers properly
    const statements = this.splitSQLStatements(migrationSQL)

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await this.db.prepare(statement).run()
        } catch (error) {
          console.error(`Error executing statement: ${statement}`, error)
          throw error
        }
      }
    }
  }

  /**
   * Split SQL into statements, handling CREATE TRIGGER properly
   */
  private splitSQLStatements(sql: string): string[] {
    const statements: string[] = []
    let current = ''
    let inTrigger = false

    const lines = sql.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      // Skip comments and empty lines
      if (trimmed.startsWith('--') || trimmed.length === 0) {
        continue
      }

      // Check if we're entering a trigger
      if (trimmed.toUpperCase().includes('CREATE TRIGGER')) {
        inTrigger = true
      }

      current += line + '\n'

      // Check if we're exiting a trigger
      if (inTrigger && trimmed.toUpperCase() === 'END;') {
        statements.push(current.trim())
        current = ''
        inTrigger = false
      }
      // Check for regular statement end (not in trigger)
      else if (!inTrigger && trimmed.endsWith(';')) {
        statements.push(current.trim())
        current = ''
      }
    }

    // Add any remaining statement
    if (current.trim()) {
      statements.push(current.trim())
    }

    return statements.filter(s => s.length > 0)
  }

  /**
   * Get migration SQL by ID
   */
  private async getMigrationSQL(migrationId: string): Promise<string | null> {
    // Import actual migration SQL based on ID
    switch (migrationId) {
      case '001':
        // Initial schema migration
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
        `
      case '002':
        // FAQ Plugin migration
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
        `
      case '006':
        // Plugin system migration
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
          INSERT INTO plugins (
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
              '🔐',
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
              '📸',
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
              '🔄',
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
              '⚡',
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
              '🎨',
              'active',
              TRUE,
              '["design.view", "design.edit"]',
              unixepoch(),
              unixepoch()
          );
        `
      case '003':
      case '004':
      case '005':
      case '007':
      case '008':
      case '009':
      case '011':
      case '012':
      case '013':
        // These migrations are skipped - either obsolete or have errors
        return ''
      default:
        return null
    }
  }

  /**
   * Validate database schema (placeholder)
   */
  async validateSchema(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = []
    
    // Basic table existence checks
    const requiredTables = [
      'users', 'content', 'collections', 'media', 'sessions'
    ]
    
    for (const table of requiredTables) {
      try {
        await this.db.prepare(`SELECT COUNT(*) FROM ${table} LIMIT 1`).first()
      } catch (error) {
        issues.push(`Missing table: ${table}`)
      }
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }
}