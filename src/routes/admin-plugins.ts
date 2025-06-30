import { Hono } from 'hono'
import type { D1Database, KVNamespace } from '@cloudflare/workers-types'
import { renderPluginsListPage, PluginsListPageData, Plugin } from '../templates/pages/admin-plugins-list.template'
import { PluginService } from '../services/plugin-service'
import { PermissionManager } from '../middleware/permissions'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

type Variables = {
  user?: {
    userId: string
    email: string
    role: string
    exp: number
    iat: number
  }
}

export const adminPluginRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Plugin list page
adminPluginRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    
    // Temporarily skip permission check for admin users
    // TODO: Fix permission system
    if (user?.role !== 'admin') {
      return c.text('Access denied', 403)
    }
    
    const pluginService = new PluginService(db)
    
    // Get all plugins with error handling
    let plugins: any[] = []
    let stats = { total: 0, active: 0, inactive: 0, errors: 0 }
    
    try {
      plugins = await pluginService.getAllPlugins()
      stats = await pluginService.getPluginStats()
    } catch (error) {
      console.error('Error loading plugins:', error)
      // Continue with empty data
    }
    
    // Map to template format
    const templatePlugins: Plugin[] = plugins.map(p => ({
      id: p.id,
      name: p.name,
      displayName: p.display_name,
      description: p.description,
      version: p.version,
      author: p.author,
      status: p.status,
      category: p.category,
      icon: p.icon,
      downloadCount: p.download_count,
      rating: p.rating,
      lastUpdated: formatLastUpdated(p.last_updated),
      dependencies: p.dependencies,
      permissions: p.permissions,
      isCore: p.is_core
    }))
    
    const pageData: PluginsListPageData = {
      plugins: templatePlugins,
      stats,
      user: {
        name: user?.email || 'User',
        email: user?.email || '',
        role: user?.role || 'user'
      }
    }
    
    return c.html(renderPluginsListPage(pageData))
  } catch (error) {
    console.error('Error loading plugins page:', error)
    return c.text('Internal server error', 500)
  }
})

// Get plugin details
adminPluginRoutes.get('/:id', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    const pluginId = c.req.param('id')
    
    const pluginService = new PluginService(db)
    const plugin = await pluginService.getPlugin(pluginId)
    
    if (!plugin) {
      return c.json({ error: 'Plugin not found' }, 404)
    }
    
    // Get activity log
    const activity = await pluginService.getPluginActivity(pluginId, 20)
    
    return c.json({
      plugin,
      activity
    })
  } catch (error) {
    console.error('Error getting plugin details:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Activate plugin
adminPluginRoutes.post('/:id/activate', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    const pluginId = c.req.param('id')
    
    // Temporarily skip permission check for admin users
    if (user?.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const pluginService = new PluginService(db)
    await pluginService.activatePlugin(pluginId)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error activating plugin:', error)
    const message = error instanceof Error ? error.message : 'Failed to activate plugin'
    return c.json({ error: message }, 400)
  }
})

// Deactivate plugin
adminPluginRoutes.post('/:id/deactivate', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    const pluginId = c.req.param('id')
    
    // Temporarily skip permission check for admin users
    if (user?.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const pluginService = new PluginService(db)
    await pluginService.deactivatePlugin(pluginId)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error deactivating plugin:', error)
    const message = error instanceof Error ? error.message : 'Failed to deactivate plugin'
    return c.json({ error: message }, 400)
  }
})

// Install plugin
adminPluginRoutes.post('/install', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    
    // Temporarily skip permission check for admin users
    if (user?.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const body = await c.req.json()
    
    const pluginService = new PluginService(db)
    
    // Handle FAQ plugin installation
    if (body.name === 'faq-plugin') {
      const faqPlugin = await pluginService.installPlugin({
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
      })
      
      return c.json({ success: true, plugin: faqPlugin })
    }
    
    // Handle Demo Login plugin installation
    if (body.name === 'demo-login-plugin') {
      const demoPlugin = await pluginService.installPlugin({
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
      })
      
      return c.json({ success: true, plugin: demoPlugin })
    }
    
    return c.json({ error: 'Plugin not found in registry' }, 404)
  } catch (error) {
    console.error('Error installing plugin:', error)
    const message = error instanceof Error ? error.message : 'Failed to install plugin'
    return c.json({ error: message }, 400)
  }
})

// Uninstall plugin
adminPluginRoutes.post('/:id/uninstall', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    const pluginId = c.req.param('id')
    
    // Temporarily skip permission check for admin users
    if (user?.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const pluginService = new PluginService(db)
    await pluginService.uninstallPlugin(pluginId)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error uninstalling plugin:', error)
    const message = error instanceof Error ? error.message : 'Failed to uninstall plugin'
    return c.json({ error: message }, 400)
  }
})

// Update plugin settings
adminPluginRoutes.post('/:id/settings', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    const pluginId = c.req.param('id')
    
    // Temporarily skip permission check for admin users
    if (user?.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const settings = await c.req.json()
    
    const pluginService = new PluginService(db)
    await pluginService.updatePluginSettings(pluginId, settings)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error updating plugin settings:', error)
    const message = error instanceof Error ? error.message : 'Failed to update settings'
    return c.json({ error: message }, 400)
  }
})

// Helper function to format last updated time
function formatLastUpdated(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp
  
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`
  return `${Math.floor(diff / 2592000)} months ago`
}