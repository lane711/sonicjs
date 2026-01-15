import { Hono } from 'hono'
import { createSonicJSApp, registerCollections } from '@sonicjs-cms/core'

// 1. IMPORT COLLECTIONS
import blogPostsCollection from './collections/blog-posts.collection'
import contactMessagesCollection from './collections/contact-messages.collection'
// import servicesCollection from './collections/services.collection' // TODO: Create this collection

// 2. USER PLUGINS
// NOTE: Full plugin auto-loading isn't implemented yet in SonicJS
// For now, manually import and mount plugin routes
import contactFormPlugin from './plugins/contact-form/index'

// Import custom routes
import profileRoutes from './routes/profile'

console.log("🔥 DEBUG: src/index.ts is running! 🔥")

// --- 1. CORE & COLLECTIONS ---
console.log("➡️ Step 1: Creating Core App...")
const coreApp = createSonicJSApp()

console.log("➡️ Step 2: Registering Collections...")
registerCollections([
  blogPostsCollection,
  contactMessagesCollection
  // servicesCollection // TODO: Add when created
])

// --- 2. MAIN APP & PLUGIN LOADER ---
const app = new Hono()

// Mount user plugin routes
function mountPluginRoutes(app: Hono, plugin: any) {
  if (!plugin || !plugin.routes) return

  plugin.routes.forEach((routeDef: any) => {
    if (routeDef.path && routeDef.handler) {
      console.log(`   └─ Mounting plugin route: ${routeDef.path}`)
      app.route(routeDef.path, routeDef.handler)
    }
  })
}

// --- 3. EXECUTION ---

// 1. Mount user plugin routes
console.log("➡️ Step 4: Mounting Contact Form Plugin Routes...")
mountPluginRoutes(app, contactFormPlugin)

// 2. Mount profile routes
console.log("➡️ Step 5: Mounting Profile Routes...")
app.route('/api/profile', profileRoutes)

// 3. Mount Core (Admin, API, etc.)
console.log("➡️ Step 6: Mounting Core App...")
app.route('/', coreApp)

// 4. Mount Website (Custom Homepage) - TODO: Create website routes
// app.route('/', website)

console.log("✅ DEBUG: Initialization Complete. Starting Server...")

// --- DEBUG ROUTE (Delete after use) ---
app.get('/debug-db', async (c) => {
  try {
    // This command asks SQLite to list all columns in the 'plugins' table
    const result = await c.env.DB.prepare("PRAGMA table_info(plugins);").all();
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message });
  }
})

export default app
