import type { D1Database } from '@cloudflare/workers-types'
import { Plugin, PluginStatus } from '../plugins/types'

export interface PluginData {
  id: string
  name: string
  display_name: string
  description: string
  version: string
  author: string
  category: string
  icon: string
  status: 'active' | 'inactive' | 'error'
  is_core: boolean
  settings?: any
  permissions?: string[]
  dependencies?: string[]
  download_count: number
  rating: number
  installed_at: number
  activated_at?: number
  last_updated: number
  error_message?: string
}

export interface PluginStats {
  total: number
  active: number
  inactive: number
  errors: number
}

export class PluginService {
  constructor(private db: D1Database) {}

  async getAllPlugins(): Promise<PluginData[]> {
    // Ensure core plugins exist (auto-install if missing)
    await this.ensureCorePluginsExist()

    const stmt = this.db.prepare(`
      SELECT * FROM plugins
      ORDER BY is_core DESC, display_name ASC
    `)

    const { results } = await stmt.all()
    return (results || []).map(this.mapPluginFromDb)
  }

  private async ensureCorePluginsExist(): Promise<void> {
    try {
      // Check if any core plugins exist
      const checkStmt = this.db.prepare('SELECT COUNT(*) as count FROM plugins WHERE is_core = TRUE')
      const result = await checkStmt.first() as any

      if (result && result.count > 0) {
        // Core plugins already exist
        return
      }

      // Install core plugins
      const corePlugins = [
        {
          id: 'core-auth',
          name: 'core-auth',
          display_name: 'Authentication System',
          description: 'Core authentication and user management system',
          version: '1.0.0',
          author: 'SonicJS Team',
          category: 'security',
          icon: '🔐',
          is_core: true,
          permissions: ['manage:users', 'manage:roles', 'manage:permissions']
        },
        {
          id: 'core-media',
          name: 'core-media',
          display_name: 'Media Manager',
          description: 'Core media upload and management system',
          version: '1.0.0',
          author: 'SonicJS Team',
          category: 'media',
          icon: '📸',
          is_core: true,
          permissions: ['manage:media', 'upload:files']
        },
        {
          id: 'core-workflow',
          name: 'core-workflow',
          display_name: 'Workflow Engine',
          description: 'Content workflow and approval system',
          version: '1.0.0',
          author: 'SonicJS Team',
          category: 'content',
          icon: '🔄',
          is_core: true,
          permissions: ['manage:workflows', 'approve:content']
        },
        {
          id: 'core-cache',
          name: 'core-cache',
          display_name: 'Cache System',
          description: 'Three-tiered caching system with memory, KV, and database layers',
          version: '1.0.0',
          author: 'SonicJS Team',
          category: 'performance',
          icon: '⚡',
          is_core: true,
          permissions: ['manage:cache', 'view:stats']
        },
        {
          id: 'design',
          name: 'design-plugin',
          display_name: 'Design System',
          description: 'Design system management including themes, components, and UI customization',
          version: '1.0.0',
          author: 'SonicJS',
          category: 'ui',
          icon: '🎨',
          is_core: true,
          permissions: ['design.view', 'design.edit']
        }
      ]

      for (const plugin of corePlugins) {
        await this.installPlugin(plugin)
      }
    } catch (error) {
      console.error('Error ensuring core plugins exist:', error)
      // Don't throw - just log the error and continue
    }
  }

  async getPlugin(pluginId: string): Promise<PluginData | null> {
    const stmt = this.db.prepare('SELECT * FROM plugins WHERE id = ?')
    const plugin = await stmt.bind(pluginId).first()
    
    if (!plugin) return null
    return this.mapPluginFromDb(plugin)
  }

  async getPluginByName(name: string): Promise<PluginData | null> {
    const stmt = this.db.prepare('SELECT * FROM plugins WHERE name = ?')
    const plugin = await stmt.bind(name).first()
    
    if (!plugin) return null
    return this.mapPluginFromDb(plugin)
  }

  async getPluginStats(): Promise<PluginStats> {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as errors
      FROM plugins
    `)
    
    const stats = await stmt.first() as any
    return {
      total: stats.total || 0,
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      errors: stats.errors || 0
    }
  }

  async installPlugin(pluginData: Partial<PluginData>): Promise<PluginData> {
    const id = pluginData.id || `plugin-${Date.now()}`
    const now = Math.floor(Date.now() / 1000)
    
    const stmt = this.db.prepare(`
      INSERT INTO plugins (
        id, name, display_name, description, version, author, category, icon,
        status, is_core, settings, permissions, dependencies, download_count, 
        rating, installed_at, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(
      id,
      pluginData.name || id,
      pluginData.display_name || 'Unnamed Plugin',
      pluginData.description || '',
      pluginData.version || '1.0.0',
      pluginData.author || 'Unknown',
      pluginData.category || 'utilities',
      pluginData.icon || '🔌',
      'inactive',
      pluginData.is_core || false,
      JSON.stringify(pluginData.settings || {}),
      JSON.stringify(pluginData.permissions || []),
      JSON.stringify(pluginData.dependencies || []),
      pluginData.download_count || 0,
      pluginData.rating || 0,
      now,
      now
    ).run()
    
    // Log the installation
    await this.logActivity(id, 'installed', null, { version: pluginData.version })
    
    const installed = await this.getPlugin(id)
    if (!installed) throw new Error('Failed to install plugin')
    
    return installed
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) throw new Error('Plugin not found')
    if (plugin.is_core) throw new Error('Cannot uninstall core plugins')
    
    // First deactivate if active
    if (plugin.status === 'active') {
      await this.deactivatePlugin(pluginId)
    }
    
    // Delete the plugin
    const stmt = this.db.prepare('DELETE FROM plugins WHERE id = ?')
    await stmt.bind(pluginId).run()
    
    // Log the uninstallation
    await this.logActivity(pluginId, 'uninstalled', null, { name: plugin.name })
  }

  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) throw new Error('Plugin not found')
    
    // Check dependencies
    if (plugin.dependencies && plugin.dependencies.length > 0) {
      await this.checkDependencies(plugin.dependencies)
    }
    
    const now = Math.floor(Date.now() / 1000)
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET status = 'active', activated_at = ?, error_message = NULL 
      WHERE id = ?
    `)
    
    await stmt.bind(now, pluginId).run()
    
    // Log the activation
    await this.logActivity(pluginId, 'activated', null)
  }

  async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) throw new Error('Plugin not found')
    
    // Check if other plugins depend on this one
    await this.checkDependents(plugin.name)
    
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET status = 'inactive', activated_at = NULL 
      WHERE id = ?
    `)
    
    await stmt.bind(pluginId).run()
    
    // Log the deactivation
    await this.logActivity(pluginId, 'deactivated', null)
  }

  async updatePluginSettings(pluginId: string, settings: any): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) throw new Error('Plugin not found')
    
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET settings = ?, updated_at = unixepoch() 
      WHERE id = ?
    `)
    
    await stmt.bind(JSON.stringify(settings), pluginId).run()
    
    // Log the settings update
    await this.logActivity(pluginId, 'settings_updated', null)
  }

  async setPluginError(pluginId: string, error: string): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET status = 'error', error_message = ? 
      WHERE id = ?
    `)
    
    await stmt.bind(error, pluginId).run()
    
    // Log the error
    await this.logActivity(pluginId, 'error', null, { error })
  }

  async getPluginActivity(pluginId: string, limit: number = 10): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM plugin_activity_log 
      WHERE plugin_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `)
    
    const { results } = await stmt.bind(pluginId, limit).all()
    return (results || []).map((row: any) => ({
      id: row.id,
      action: row.action,
      userId: row.user_id,
      details: row.details ? JSON.parse(row.details) : null,
      timestamp: row.timestamp
    }))
  }

  async registerHook(pluginId: string, hookName: string, handlerName: string, priority: number = 10): Promise<void> {
    const id = `hook-${Date.now()}`
    const stmt = this.db.prepare(`
      INSERT INTO plugin_hooks (id, plugin_id, hook_name, handler_name, priority)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(id, pluginId, hookName, handlerName, priority).run()
  }

  async registerRoute(pluginId: string, path: string, method: string, handlerName: string, middleware?: any[]): Promise<void> {
    const id = `route-${Date.now()}`
    const stmt = this.db.prepare(`
      INSERT INTO plugin_routes (id, plugin_id, path, method, handler_name, middleware)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(
      id, 
      pluginId, 
      path, 
      method, 
      handlerName, 
      JSON.stringify(middleware || [])
    ).run()
  }

  async getPluginHooks(pluginId: string): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM plugin_hooks 
      WHERE plugin_id = ? AND is_active = TRUE
      ORDER BY priority ASC
    `)
    
    const { results } = await stmt.bind(pluginId).all()
    return results || []
  }

  async getPluginRoutes(pluginId: string): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM plugin_routes 
      WHERE plugin_id = ? AND is_active = TRUE
    `)
    
    const { results } = await stmt.bind(pluginId).all()
    return results || []
  }

  private async checkDependencies(dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      const plugin = await this.getPluginByName(dep)
      if (!plugin || plugin.status !== 'active') {
        throw new Error(`Required dependency '${dep}' is not active`)
      }
    }
  }

  private async checkDependents(pluginName: string): Promise<void> {
    const stmt = this.db.prepare(`
      SELECT id, display_name FROM plugins 
      WHERE status = 'active' 
      AND dependencies LIKE ?
    `)
    
    const { results } = await stmt.bind(`%"${pluginName}"%`).all()
    if (results && results.length > 0) {
      const names = results.map((p: any) => p.display_name).join(', ')
      throw new Error(`Cannot deactivate. The following plugins depend on this one: ${names}`)
    }
  }

  private async logActivity(pluginId: string, action: string, userId: string | null, details?: any): Promise<void> {
    const id = `activity-${Date.now()}`
    const stmt = this.db.prepare(`
      INSERT INTO plugin_activity_log (id, plugin_id, action, user_id, details)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(
      id,
      pluginId,
      action,
      userId,
      details ? JSON.stringify(details) : null
    ).run()
  }

  private mapPluginFromDb(row: any): PluginData {
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
      settings: row.settings ? JSON.parse(row.settings) : undefined,
      permissions: row.permissions ? JSON.parse(row.permissions) : undefined,
      dependencies: row.dependencies ? JSON.parse(row.dependencies) : undefined,
      download_count: row.download_count || 0,
      rating: row.rating || 0,
      installed_at: row.installed_at,
      activated_at: row.activated_at,
      last_updated: row.last_updated,
      error_message: row.error_message
    }
  }
}