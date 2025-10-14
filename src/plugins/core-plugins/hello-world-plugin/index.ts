/**
 * Hello World Plugin
 *
 * A simple demonstration plugin that shows "Hello World" on a page
 */

import { Hono } from 'hono'
import { html } from 'hono/html'
import { PluginBuilder } from '../../sdk/plugin-builder'
import type { Plugin } from '../../types'

export function createHelloWorldPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'hello-world',
    version: '1.0.0-beta.1',
    description: 'A simple Hello World plugin demonstration'
  })

  // Add plugin metadata
  builder.metadata({
    author: {
      name: 'SonicJS Team',
      email: 'team@sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^2.0.0'
  })

  // Create the Hello World route
  const helloWorldRoutes = new Hono()

  helloWorldRoutes.get('/', async (c: any) => {
    const user = c.get('user') as { email?: string; role?: string } | undefined

    return c.html(html`
      <!DOCTYPE html>
      <html lang="en" class="dark">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, 1.0">
          <title>Hello World - SonicJS</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              darkMode: 'class',
            }
          </script>
        </head>
        <body class="bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white min-h-screen">
          <div class="flex h-screen">
            <!-- Sidebar -->
            <aside class="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
              <div class="p-4">
                <h2 class="text-xl font-bold mb-4">SonicJS</h2>
                <nav>
                  <a href="/admin/dashboard" class="block px-4 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 mb-1">
                    Dashboard
                  </a>
                  <a href="/admin/hello-world" class="block px-4 py-2 rounded bg-zinc-100 dark:bg-zinc-800 font-medium">
                    👋 Hello World
                  </a>
                </nav>
              </div>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 overflow-y-auto">
              <div class="p-8">
                <!-- Header -->
                <div class="mb-8">
                  <h1 class="text-3xl font-bold mb-2">Hello World</h1>
                  <p class="text-zinc-600 dark:text-zinc-400">Welcome to the Hello World plugin!</p>
                </div>

                <!-- Content Card -->
                <div class="max-w-2xl">
                  <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div class="p-8 text-center">
                      <div class="mb-6">
                        <span class="text-6xl">👋</span>
                      </div>
                      <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Hello World!
                      </h2>
                      <p class="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
                        This is a simple demonstration plugin for SonicJS.
                      </p>
                      <div class="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 text-left">
                        <h3 class="font-semibold mb-2">Plugin Information:</h3>
                        <ul class="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                          <li><strong>Plugin ID:</strong> hello-world</li>
                          <li><strong>Version:</strong> 1.0.0-beta.1</li>
                          <li><strong>User:</strong> ${user?.email || 'Not logged in'}</li>
                          <li><strong>Role:</strong> ${user?.role || 'N/A'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Additional Info Card -->
                  <div class="mt-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      📚 How this plugin works
                    </h3>
                    <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                      <li>✓ Automatically discovered from manifest.json</li>
                      <li>✓ Registered in the plugin registry at build time</li>
                      <li>✓ Added to left navigation via adminMenu config</li>
                      <li>✓ Route handler defined using PluginBuilder</li>
                      <li>✓ Fully integrated with SonicJS plugin system</li>
                    </ul>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </body>
      </html>
    `)
  })

  // Register the route
  builder.addRoute('/admin/hello-world', helloWorldRoutes, {
    description: 'Hello World page',
    requiresAuth: true,
    priority: 90
  })

  // Add menu item (this will appear in the left navigation)
  builder.addMenuItem('Hello World', '/admin/hello-world', {
    icon: 'hand-raised',
    order: 90,
    permissions: ['hello-world:view']
  })

  // Add lifecycle hooks
  builder.lifecycle({
    activate: async () => {
      console.info('✅ Hello World plugin activated')
    },

    deactivate: async () => {
      console.info('❌ Hello World plugin deactivated')
    }
  })

  return builder.build()
}

// Export the plugin instance
export const helloWorldPlugin = createHelloWorldPlugin()
