/**
 * SonicJS Stats Collector
 *
 * Self-hosted telemetry collection using SonicJS
 * Tracks anonymous installation metrics
 */

import { createSonicJSApp, registerCollections } from '@sonicjs-cms/core'
import type { SonicJSConfig } from '@sonicjs-cms/core'

// Import collections
import installsCollection from './collections/installs.collection'
import eventsCollection from './collections/events.collection'

// Import custom routes
import telemetryRoutes from './routes/telemetry'

// Register collections
registerCollections([
  installsCollection,
  eventsCollection,
])

// Application configuration
const config: SonicJSConfig = {
  collections: {
    autoSync: true
  },
  plugins: {
    autoLoad: false,
    disableAll: true  // No plugins needed for stats collector
  },
  routes: [
    {
      path: '/v1',
      handler: telemetryRoutes as any  // Type cast needed due to Bindings mismatch
    }
  ]
}

// Create and export the application
export default createSonicJSApp(config)
