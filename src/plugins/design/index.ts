import { Plugin } from '../types'
import { designRoutes } from './routes'

export const designPlugin: Plugin = {
  id: 'design',
  name: 'Design System',
  version: '1.0.0',
  description: 'Design system management including themes, components, and UI customization',

  async activate(context) {
    console.log('Design plugin activated')

    // Register routes
    if (context.app) {
      context.app.route('/admin/design', designRoutes)
    }

    return true
  },

  async deactivate(context) {
    console.log('Design plugin deactivated')
    return true
  },

  getRoutes() {
    return designRoutes
  }
}

export default designPlugin
