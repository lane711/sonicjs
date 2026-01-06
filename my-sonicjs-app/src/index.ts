/**
 * My SonicJS Application
 *
 * Entry point for your SonicJS headless CMS application
 */

import { createSonicJSApp, registerCollections } from '@sonicjs-cms/core'
import type { SonicJSConfig } from '@sonicjs-cms/core'

// Import custom collections
import blogPostsCollection from './collections/blog-posts.collection'
import pageBlocksCollection from './collections/page-blocks.collection'

// Register all custom collections
registerCollections([
  blogPostsCollection,
  pageBlocksCollection
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
  }
}

// Create and export the application
export default createSonicJSApp(config)
