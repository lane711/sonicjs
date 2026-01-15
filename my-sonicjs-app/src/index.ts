/**
 * My SonicJS Application
 *
 * Entry point for your SonicJS headless CMS application
 */

import { createSonicJSApp, registerCollections } from '@sonicjs-cms/core'
import type { SonicJSConfig } from '@sonicjs-cms/core'

// Import custom collections
import blogPostsCollection from './collections/blog-posts.collection'

// Import custom routes
import profileRoutes from './routes/profile'

// Register all custom collections
registerCollections([
  blogPostsCollection
])

// Application configuration
const config: SonicJSConfig = {
  collections: {
    autoSync: true
  },
  plugins: {
    directory: './src/plugins',
    autoLoad: false,  // Set to true to auto-load custom plugins
    disableAll: false,  // Enable plugins
    enabled: ['email']  // Enable specific plugins
  },
  // Custom routes for app-specific functionality
  routes: [
    { path: '/api/profile', handler: profileRoutes }
  ]
}

// Create and export the application
export default createSonicJSApp(config)
