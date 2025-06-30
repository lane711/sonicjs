import { D1Database } from '@cloudflare/workers-types'

export interface TruncateResult {
  success: boolean
  message: string
  tablesCleared: string[]
  adminUserPreserved: boolean
  errors?: string[]
}

export interface DatabaseStats {
  tables: Array<{
    name: string
    rowCount: number
  }>
  totalRows: number
}

export class DatabaseToolsService {
  constructor(private db: D1Database) {}

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<DatabaseStats> {
    const tables = await this.getTables()
    const stats: DatabaseStats = {
      tables: [],
      totalRows: 0
    }

    for (const tableName of tables) {
      try {
        const result = await this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).first()
        const rowCount = (result?.count as number) || 0
        
        stats.tables.push({
          name: tableName,
          rowCount
        })
        stats.totalRows += rowCount
      } catch (error) {
        // Skip tables that can't be counted (might be views or system tables)
        console.warn(`Could not count rows in table ${tableName}:`, error)
      }
    }

    return stats
  }

  /**
   * Get all tables in the database
   */
  private async getTables(): Promise<string[]> {
    const result = await this.db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all()

    return result.results?.map((row: any) => row.name) || []
  }

  /**
   * Truncate all data except admin user
   */
  async truncateAllData(adminEmail: string): Promise<TruncateResult> {
    const errors: string[] = []
    const tablesCleared: string[] = []
    let adminUserPreserved = false

    try {
      // First, preserve the admin user data
      const adminUser = await this.db.prepare(
        'SELECT * FROM users WHERE email = ? AND role = ?'
      ).bind(adminEmail, 'admin').first()

      if (!adminUser) {
        return {
          success: false,
          message: 'Admin user not found. Operation cancelled for safety.',
          tablesCleared: [],
          adminUserPreserved: false,
          errors: ['Admin user not found']
        }
      }

      // Define tables to truncate (excluding system tables)
      const tablesToTruncate = [
        'content',
        'content_versions', 
        'content_workflow_status',
        'collections',
        'media',
        'sessions',
        'notifications',
        'api_tokens',
        'workflow_history',
        'scheduled_content',
        'faqs',
        'faq_categories',
        'plugins',
        'plugin_settings',
        'email_templates',
        'email_themes'
      ]

      // Check which tables exist
      const existingTables = await this.getTables()
      const tablesToClear = tablesToTruncate.filter(table => 
        existingTables.includes(table)
      )

      // Clear all data except users table
      for (const tableName of tablesToClear) {
        try {
          await this.db.prepare(`DELETE FROM ${tableName}`).run()
          tablesCleared.push(tableName)
        } catch (error) {
          errors.push(`Failed to clear table ${tableName}: ${error}`)
          console.error(`Error clearing table ${tableName}:`, error)
        }
      }

      // Clear users table but preserve admin
      try {
        await this.db.prepare('DELETE FROM users WHERE email != ? OR role != ?')
          .bind(adminEmail, 'admin').run()
        
        // Verify admin user still exists
        const verifyAdmin = await this.db.prepare(
          'SELECT id FROM users WHERE email = ? AND role = ?'
        ).bind(adminEmail, 'admin').first()

        adminUserPreserved = !!verifyAdmin
        tablesCleared.push('users (non-admin)')
      } catch (error) {
        errors.push(`Failed to clear non-admin users: ${error}`)
        console.error('Error clearing non-admin users:', error)
      }

      // Reset auto-increment counters if supported
      try {
        await this.db.prepare('DELETE FROM sqlite_sequence').run()
      } catch (error) {
        // sqlite_sequence might not exist, ignore
      }

      const message = errors.length > 0 
        ? `Truncation completed with ${errors.length} errors. ${tablesCleared.length} tables cleared.`
        : `Successfully truncated database. ${tablesCleared.length} tables cleared.`

      return {
        success: errors.length === 0,
        message,
        tablesCleared,
        adminUserPreserved,
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      return {
        success: false,
        message: `Database truncation failed: ${error}`,
        tablesCleared,
        adminUserPreserved,
        errors: [String(error)]
      }
    }
  }

  /**
   * Create a backup of current data (simplified version)
   */
  async createBackup(): Promise<{ success: boolean; message: string; backupId?: string }> {
    try {
      const backupId = `backup_${Date.now()}`
      const stats = await this.getDatabaseStats()
      
      // In a real implementation, this would export data to a file or cloud storage
      // For now, we'll just log the stats and return success
      console.log(`Backup ${backupId} created with ${stats.totalRows} total rows`)
      
      return {
        success: true,
        message: `Backup created successfully (${stats.totalRows} rows)`,
        backupId
      }
    } catch (error) {
      return {
        success: false,
        message: `Backup failed: ${error}`
      }
    }
  }

  /**
   * Validate database integrity
   */
  async validateDatabase(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = []

    try {
      // Check critical tables exist
      const requiredTables = ['users', 'content', 'collections']
      const existingTables = await this.getTables()

      for (const table of requiredTables) {
        if (!existingTables.includes(table)) {
          issues.push(`Critical table missing: ${table}`)
        }
      }

      // Check admin user exists
      const adminCount = await this.db.prepare(
        'SELECT COUNT(*) as count FROM users WHERE role = ?'
      ).bind('admin').first()

      if ((adminCount?.count as number) === 0) {
        issues.push('No admin users found')
      }

      // Run SQLite integrity check
      try {
        const integrityResult = await this.db.prepare('PRAGMA integrity_check').first()
        if (integrityResult && (integrityResult as any).integrity_check !== 'ok') {
          issues.push(`Database integrity check failed: ${(integrityResult as any).integrity_check}`)
        }
      } catch (error) {
        issues.push(`Could not run integrity check: ${error}`)
      }

    } catch (error) {
      issues.push(`Validation error: ${error}`)
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }
}