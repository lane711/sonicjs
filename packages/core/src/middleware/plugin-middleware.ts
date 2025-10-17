import { Context, Next } from 'hono'
import { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
}

/**
 * Middleware to check if a plugin is active before allowing access to its routes
 */
export function requireActivePlugin(pluginName: string) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    try {
      const db = c.env.DB
      
      // Check if plugin exists and is active
      const plugin = await db.prepare(
        'SELECT status FROM plugins WHERE name = ? AND status = ?'
      ).bind(pluginName, 'active').first()

      if (!plugin) {
        // Plugin is not active, return 404 or redirect
        return c.html(`
          <div class="min-h-screen flex items-center justify-center bg-gray-900">
            <div class="text-center">
              <h1 class="text-4xl font-bold text-white mb-4">Feature Not Available</h1>
              <p class="text-gray-300 mb-6">The ${pluginName} plugin is not currently active.</p>
              <a href="/admin" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                Return to Admin Dashboard
              </a>
            </div>
          </div>
        `, 404)
      }

      // Plugin is active, continue to the route
      return await next()
    } catch (error) {
      console.error(`Error checking plugin status for ${pluginName}:`, error)
      // On error, allow access (fail open for stability)
      return await next()
    }
  }
}

/**
 * Check if multiple plugins are active
 */
export function requireActivePlugins(pluginNames: string[]) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    try {
      const db = c.env.DB
      
      // Check if all required plugins are active
      for (const pluginName of pluginNames) {
        const plugin = await db.prepare(
          'SELECT status FROM plugins WHERE name = ? AND status = ?'
        ).bind(pluginName, 'active').first()

        if (!plugin) {
          return c.html(`
            <div class="min-h-screen flex items-center justify-center bg-gray-900">
              <div class="text-center">
                <h1 class="text-4xl font-bold text-white mb-4">Feature Not Available</h1>
                <p class="text-gray-300 mb-6">Required plugin "${pluginName}" is not currently active.</p>
                <a href="/admin" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                  Return to Admin Dashboard
                </a>
              </div>
            </div>
          `, 404)
        }
      }

      return await next()
    } catch (error) {
      console.error(`Error checking plugin status for plugins:`, pluginNames, error)
      // On error, allow access (fail open for stability)
      return await next()
    }
  }
}

/**
 * Get list of active plugins for menu generation
 */
export async function getActivePlugins(db: D1Database): Promise<Array<{
  name: string
  display_name: string
  icon?: string
  settings?: any
}>> {
  try {
    const result = await db.prepare(
      'SELECT name, display_name, icon, settings FROM plugins WHERE status = ? ORDER BY display_name'
    ).bind('active').all()

    return result.results?.map((row: any) => ({
      name: row.name,
      display_name: row.display_name,
      icon: row.icon,
      settings: row.settings ? JSON.parse(row.settings) : null
    })) || []
  } catch (error) {
    console.error('Error fetching active plugins:', error)
    return []
  }
}

/**
 * Check if a specific plugin is active
 */
export async function isPluginActive(db: D1Database, pluginName: string): Promise<boolean> {
  try {
    const result = await db.prepare(
      'SELECT id FROM plugins WHERE name = ? AND status = ?'
    ).bind(pluginName, 'active').first()
    
    return !!result
  } catch (error) {
    console.error(`Error checking if plugin ${pluginName} is active:`, error)
    return false
  }
}