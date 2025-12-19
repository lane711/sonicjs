import { PluginBuilder } from '@sonicjs-cms/core' 
import type { Plugin } from '@sonicjs-cms/core'
import manifest from './manifest.json'
import { ContactService } from './services/contact'
import adminRoutes from './routes/admin'
import publicRoutes from './routes/public'

export function createContactPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: manifest.id,
    version: manifest.version,
    description: manifest.description
  })

  builder.metadata({
    author: { name: manifest.author },
    license: manifest.license
  })

  // Routes
  builder.addRoute('/admin/plugins/contact-form', adminRoutes, { requiresAuth: true, priority: 100 })
  builder.addRoute('/', publicRoutes)

  // Lifecycle
  builder.lifecycle({
    activate: async (context: any) => {
      await new ContactService(context.env.DB).activate()
    },
    deactivate: async (context: any) => {
      await new ContactService(context.env.DB).deactivate()
    },
    uninstall: async (context: any) => {
      await new ContactService(context.env.DB).uninstall()
    }
  })

  return builder.build()
}

export default createContactPlugin()
