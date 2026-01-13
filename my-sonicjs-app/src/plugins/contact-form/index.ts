import { PluginBuilder } from '@sonicjs-cms/core' 
import type { Plugin, PluginContext } from '@sonicjs-cms/core'
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
    license: manifest.license,
    compatibility: '^2.0.0'
  })

  // Public routes
  builder.addRoute('/', publicRoutes, {
    description: 'Contact form public routes',
    requiresAuth: false,
    priority: 10
  })

  // Admin routes
  builder.addRoute('/admin/plugins/contact-form', adminRoutes, {
    description: 'Contact form admin routes',
    requiresAuth: true,
    priority: 100
  })

  // Add admin page
  builder.addAdminPage(
    '/contact-form/settings',
    'Contact Form Settings',
    'ContactFormSettings',
    {
      description: 'Configure contact form settings and Google Maps',
      icon: 'envelope',
      permissions: ['admin', 'contact_form.manage']
    }
  )

  // Add menu item
  builder.addMenuItem('Contact Form', '/admin/plugins/contact-form/settings', {
    icon: 'envelope',
    order: 90,
    permissions: ['admin', 'contact_form.manage']
  })

  // Register service
  let contactService: ContactService | null = null

  builder.addService('contactService', {
    implementation: ContactService,
    description: 'Contact form service for managing messages and settings',
    singleton: true
  })

  // Lifecycle
  builder.lifecycle({
    install: async (context: PluginContext) => {
      contactService = new ContactService(context.db)
      await contactService.install()
      console.log('Contact Form plugin installed successfully')
    },
    activate: async (context: PluginContext) => {
      contactService = new ContactService(context.db)
      await contactService.activate()
      console.log('Contact Form plugin activated')
    },
    deactivate: async (context: PluginContext) => {
      if (contactService) {
        await contactService.deactivate()
        contactService = null
      }
      console.log('Contact Form plugin deactivated')
    },
    uninstall: async (context: PluginContext) => {
      if (contactService) {
        await contactService.uninstall()
        contactService = null
      }
      console.log('Contact Form plugin uninstalled')
    },
    configure: async (config: any) => {
      if (contactService) {
        await contactService.saveSettings(config)
      }
      console.log('Contact Form plugin configured', config)
    }
  })

  return builder.build()
}

export default createContactPlugin()
