import { PluginBuilder } from '../../sdk/plugin-builder'
import { Plugin } from '../../types'
import { createDatabaseToolsAdminRoutes } from './admin-routes'
import { DatabaseToolsService } from './services/database-service'

export function createDatabaseToolsPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'database-tools',
    version: '1.0.0',
    description: 'Database management tools including truncate, backup, and validation'
  })

  builder.metadata({
    author: { name: 'SonicJS', email: 'admin@sonicjs.com' },
    license: 'MIT',
    compatibility: '^1.0.0',
    dependencies: []
  })

  // Add admin page
  builder.addAdminPage('/database-tools', 'Database Tools', 'DatabaseTools', {
    description: 'Manage database operations and maintenance',
    icon: 'database',
    permissions: ['admin']
  })

  // Add menu item to admin sidebar
  builder.addMenuItem('Database Tools', '/admin/database-tools', {
    icon: 'database',
    order: 60,
    permissions: ['admin']
  })

  // Add service
  builder.addService('databaseTools', {
    implementation: DatabaseToolsService,
    description: 'Database management and maintenance service',
    singleton: true
  })

  return builder.build()
}

export const databaseToolsPlugin = createDatabaseToolsPlugin()
export { DatabaseToolsService } from './services/database-service'