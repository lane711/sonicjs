import type { D1Database } from '@cloudflare/workers-types'
import { PluginService, PluginData } from './plugin-service'

export interface CorePlugin {
  id: string
  name: string
  display_name: string
  description: string
  version: string
  author: string
  category: string
  icon: string
  permissions: string[]
  dependencies: string[]
  settings?: any
}

export class PluginBootstrapService {
  private pluginService: PluginService

  constructor(private db: D1Database) {
    this.pluginService = new PluginService(db)
  }

  /**
   * Core plugins that should always be available in the system
   */
  private readonly CORE_PLUGINS: CorePlugin[] = [
    {
      id: 'core-auth',
      name: 'core-auth',
      display_name: 'Authentication System',
      description: 'Core authentication and user management system',
      version: '1.0.0',
      author: 'SonicJS Team',
      category: 'security',
      icon: '🔐',
      permissions: ['manage:users', 'manage:roles', 'manage:permissions'],
      dependencies: [],
      settings: {}
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
      permissions: ['manage:media', 'upload:files'],
      dependencies: [],
      settings: {}
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
      permissions: ['manage:workflows', 'approve:content'],
      dependencies: [],
      settings: {}
    },
    {
      id: 'database-tools',
      name: 'database-tools',
      display_name: 'Database Tools',
      description: 'Database management tools including truncate, backup, and validation',
      version: '1.0.0',
      author: 'SonicJS Team',
      category: 'system',
      icon: '🗄️',
      permissions: ['manage:database', 'admin'],
      dependencies: [],
      settings: {
        enableTruncate: true,
        enableBackup: true,
        enableValidation: true,
        requireConfirmation: true
      }
    }
  ]

  /**
   * Bootstrap all core plugins - install them if they don't exist
   */
  async bootstrapCorePlugins(): Promise<void> {
    console.log('[PluginBootstrap] Starting core plugin bootstrap process...')
    
    try {
      // Check each core plugin
      for (const corePlugin of this.CORE_PLUGINS) {
        await this.ensurePluginInstalled(corePlugin)
      }
      
      console.log('[PluginBootstrap] Core plugin bootstrap completed successfully')
    } catch (error) {
      console.error('[PluginBootstrap] Error during plugin bootstrap:', error)
      throw error
    }
  }

  /**
   * Ensure a specific plugin is installed
   */
  private async ensurePluginInstalled(plugin: CorePlugin): Promise<void> {
    try {
      // Check if plugin already exists
      const existingPlugin = await this.pluginService.getPlugin(plugin.id)
      
      if (existingPlugin) {
        console.log(`[PluginBootstrap] Plugin already installed: ${plugin.display_name}`)
        
        // Update plugin if version changed
        if (existingPlugin.version !== plugin.version) {
          console.log(`[PluginBootstrap] Updating plugin version: ${plugin.display_name} from ${existingPlugin.version} to ${plugin.version}`)
          await this.updatePlugin(plugin)
        }
        
        // Activate core plugins by default
        if (plugin.name.startsWith('core-') && existingPlugin.status !== 'active') {
          console.log(`[PluginBootstrap] Activating core plugin: ${plugin.display_name}`)
          await this.pluginService.activatePlugin(plugin.id)
        }
      } else {
        // Install the plugin
        console.log(`[PluginBootstrap] Installing plugin: ${plugin.display_name}`)
        const installedPlugin = await this.pluginService.installPlugin({
          ...plugin,
          is_core: plugin.name.startsWith('core-')
        })
        
        // Activate core plugins immediately after installation
        if (plugin.name.startsWith('core-')) {
          console.log(`[PluginBootstrap] Activating newly installed core plugin: ${plugin.display_name}`)
          await this.pluginService.activatePlugin(plugin.id)
        }
      }
    } catch (error) {
      console.error(`[PluginBootstrap] Error ensuring plugin ${plugin.display_name}:`, error)
      // Don't throw - continue with other plugins
    }
  }

  /**
   * Update an existing plugin
   */
  private async updatePlugin(plugin: CorePlugin): Promise<void> {
    const now = Math.floor(Date.now() / 1000)
    
    const stmt = this.db.prepare(`
      UPDATE plugins 
      SET 
        version = ?,
        description = ?,
        permissions = ?,
        settings = ?,
        last_updated = ?
      WHERE id = ?
    `)
    
    await stmt.bind(
      plugin.version,
      plugin.description,
      JSON.stringify(plugin.permissions),
      JSON.stringify(plugin.settings || {}),
      now,
      plugin.id
    ).run()
  }

  /**
   * Check if bootstrap is needed (first run detection)
   */
  async isBootstrapNeeded(): Promise<boolean> {
    try {
      // Check if any core plugins are missing
      for (const corePlugin of this.CORE_PLUGINS.filter(p => p.name.startsWith('core-'))) {
        const exists = await this.pluginService.getPlugin(corePlugin.id)
        if (!exists) {
          return true
        }
      }
      return false
    } catch (error) {
      // If there's an error (like table doesn't exist), we need bootstrap
      console.error('[PluginBootstrap] Error checking bootstrap status:', error)
      return true
    }
  }

  /**
   * Install demo/example plugins (optional)
   */
  async installDemoPlugins(): Promise<void> {
    const demoPlugins: CorePlugin[] = [
      {
        id: 'third-party-faq',
        name: 'faq-plugin',
        display_name: 'FAQ System',
        description: 'Frequently Asked Questions management system with categories, search, and custom styling',
        version: '2.0.0',
        author: 'Community Developer',
        category: 'content',
        icon: '❓',
        permissions: ['manage:faqs'],
        dependencies: [],
        settings: {
          enableSearch: true,
          enableCategories: true,
          questionsPerPage: 10
        }
      },
      {
        id: 'demo-login-prefill',
        name: 'demo-login-plugin',
        display_name: 'Demo Login Prefill',
        description: 'Prefills login form with demo credentials (admin@sonicjs.com/admin123) for easy site demonstration',
        version: '1.0.0',
        author: 'SonicJS',
        category: 'demo',
        icon: '🎯',
        permissions: [],
        dependencies: [],
        settings: {
          enableNotice: true,
          demoEmail: 'admin@sonicjs.com',
          demoPassword: 'admin123'
        }
      }
    ]

    for (const demoPlugin of demoPlugins) {
      try {
        const exists = await this.pluginService.getPlugin(demoPlugin.id)
        if (!exists) {
          console.log(`[PluginBootstrap] Installing demo plugin: ${demoPlugin.display_name}`)
          await this.pluginService.installPlugin({
            ...demoPlugin,
            is_core: false
          })
        }
      } catch (error) {
        console.error(`[PluginBootstrap] Error installing demo plugin ${demoPlugin.display_name}:`, error)
      }
    }
  }
}