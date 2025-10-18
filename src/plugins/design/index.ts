import { Plugin } from '@sonicjs-cms/core'
import { designRoutes } from './routes'

export const designPlugin: Plugin = {
  name: 'design',
  version: '1.0.0',
  description: 'Design system management including themes, components, and UI customization',

  async activate(context) {
    console.log('Design plugin activated')
  },

  async deactivate(context) {
    console.log('Design plugin deactivated')
  }
}

export default designPlugin
