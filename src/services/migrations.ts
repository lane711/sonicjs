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
    
    if (!migrationSQL) {
      throw new Error(`Migration SQL not found for ${migration.id}`)
    }

    // Split SQL into individual statements and execute
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
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
   * Get migration SQL by ID
   */
  private async getMigrationSQL(migrationId: string): Promise<string | null> {
    // Import actual migration SQL based on ID
    switch (migrationId) {
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
      case '005':
        // Import workflow migration
        const { workflowMigration } = await import('../plugins/core-plugins/workflow-plugin/migrations')
        return workflowMigration
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
          );
        `
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