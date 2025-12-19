import { Hono } from 'hono'
import { createSonicJSApp, registerCollections } from '@sonicjs-cms/core'

// 1. IMPORT COLLECTIONS
import blogPostsCollection from './collections/blog-posts.collection'
import servicesCollection from './collections/services.collection'

// 2. IMPORT WEBSITE & YOUR PLUGIN
import website from './routes/website'
import contactFormPlugin from './plugins/contact-form/index' 

console.log("🔥 DEBUG: src/index.ts is running! 🔥")

// --- 1. CORE & COLLECTIONS ---
console.log("➡️ Step 1: Creating Core App...")
const coreApp = createSonicJSApp()

console.log("➡️ Step 2: Registering Collections...")
registerCollections([
  blogPostsCollection,
  servicesCollection
])

// --- 2. MAIN APP & PLUGIN LOADER ---
const app = new Hono()

// ROBUST PLUGIN LOADER
// Checks multiple locations for 'setup' and 'routes' to ensure compatibility
async function registerLocalPlugin(mainApp: Hono, plugin: any) {
  console.log("➡️ Step 3: Inside registerLocalPlugin function...")
  
  if (!plugin) {
    console.error("❌ ERROR: Plugin object is UNDEFINED. Check import!")
    return
  }
  
  console.log(`🔌 Loading Plugin: ${plugin.name}`)

  // A. FIND SETUP FUNCTION (The Fix!)
  // Builder might put it on the root OR inside lifecycle
  const setupFn = plugin.setup || (plugin.lifecycle && plugin.lifecycle.setup)

  if (setupFn) {
    try {
      console.log(`   └─ Running Setup (DB Registration)...`)
      await setupFn(mainApp)
    } catch (err) {
      console.error(`   ❌ Setup failed:`, err)
    }
  } else {
    console.log("   ⚠️ No setup function found! (Plugin will NOT appear in Admin List)")
    console.log("   🔍 Available keys:", Object.keys(plugin))
  }

  // B. MOUNT ROUTES
  const routes = plugin.routes
  if (Array.isArray(routes)) {
    // Standard Builder Format (Array)
    routes.forEach((routeDef: any) => {
      const routeApp = routeDef.app || routeDef.handler || routeDef.route
      const path = routeDef.path
      
      if (path && routeApp) {
         console.log(`   └─ Mounting Route: ${path}`)
         mainApp.route(path, routeApp)
      }
    })
  } else if (routes instanceof Map) {
    // Legacy Format (Map)
    routes.forEach((routeApp: Hono, path: string) => {
      console.log(`   └─ Mounting Route (Map): ${path}`)
      mainApp.route(path, routeApp)
    })
  } else if (routes) {
    console.log("   ⚠️ Routes found but format unreadable:", typeof routes)
  }
}

// --- 3. EXECUTION ---

// 1. Global Middleware
app.use('*', async (c, next) => {
  await next()
})

// 2. Register Plugin (Execute Loader)
console.log("➡️ Step 4: Calling registerLocalPlugin...")
registerLocalPlugin(app, contactFormPlugin)

// 3. Mount Website (Custom Homepage)
console.log("➡️ Step 5: Mounting Apps...")
app.route('/', website)

// 4. Mount Core (Admin, API, etc.)
app.route('/', coreApp)

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
