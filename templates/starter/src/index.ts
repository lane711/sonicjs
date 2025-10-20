/**
 * My SonicJS Application
 *
 * Entry point for your SonicJS headless CMS application
 */

import { createSonicJSApp } from '@sonicjs-cms/core'
import type { SonicJSConfig } from '@sonicjs-cms/core'

// Application configuration
const config: SonicJSConfig = {
  collections: {
    directory: './src/collections',
    autoSync: true
  },
  plugins: {
    enabled: [] // Add plugin names here to enable them
  }
}

// Create and export the application
export default createSonicJSApp(config)
