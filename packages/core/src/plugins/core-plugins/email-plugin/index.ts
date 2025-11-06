/**
 * Email Plugin
 *
 * Send transactional emails using Resend
 * Handles registration, verification, password reset, and one-time codes
 */

import { Hono } from 'hono'
import { html } from 'hono/html'
import { PluginBuilder } from '../../sdk/plugin-builder'
import type { Plugin } from '@sonicjs-cms/core'
import { adminLayoutV2 } from '../../../templates/layouts/admin-layout-v2.template'

export function createEmailPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'email',
    version: '1.0.0-beta.1',
    description: 'Send transactional emails using Resend'
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

  // Create the Email Settings route
  const emailRoutes = new Hono()

  emailRoutes.get('/settings', async (c: any) => {
    const user = c.get('user') as { email?: string; role?: string } | undefined
    const db = c.env.DB

    // Load current settings from database
    const plugin = await db.prepare(`
      SELECT settings FROM plugins WHERE id = 'email'
    `).first() as { settings: string | null } | null

    const settings = plugin?.settings ? JSON.parse(plugin.settings) : {}

    const contentHTML = html`
      <div class="p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">Email Settings</h1>
          <p class="text-zinc-600 dark:text-zinc-400">Configure Resend API for sending transactional emails</p>
        </div>

        <!-- Settings Form -->
        <div class="max-w-3xl">
          <!-- Main Settings Card -->
          <div class="backdrop-blur-md bg-black/20 border border-white/10 shadow-xl rounded-xl p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Resend Configuration</h2>

            <form id="emailSettingsForm" class="space-y-6">
              <!-- API Key -->
              <div>
                <label for="apiKey" class="block text-sm font-medium mb-2">
                  Resend API Key <span class="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value="${settings.apiKey || ''}"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="re_..."
                  required
                />
                <p class="text-xs text-zinc-500 mt-1">
                  Get your API key from <a href="https://resend.com/api-keys" target="_blank" class="text-blue-400 hover:underline">resend.com/api-keys</a>
                </p>
              </div>

              <!-- From Email -->
              <div>
                <label for="fromEmail" class="block text-sm font-medium mb-2">
                  From Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="fromEmail"
                  name="fromEmail"
                  value="${settings.fromEmail || ''}"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="noreply@yourdomain.com"
                  required
                />
                <p class="text-xs text-zinc-500 mt-1">
                  Must be a verified domain in Resend
                </p>
              </div>

              <!-- From Name -->
              <div>
                <label for="fromName" class="block text-sm font-medium mb-2">
                  From Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fromName"
                  name="fromName"
                  value="${settings.fromName || ''}"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="Your App Name"
                  required
                />
              </div>

              <!-- Reply To -->
              <div>
                <label for="replyTo" class="block text-sm font-medium mb-2">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  id="replyTo"
                  name="replyTo"
                  value="${settings.replyTo || ''}"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="support@yourdomain.com"
                />
              </div>

              <!-- Logo URL -->
              <div>
                <label for="logoUrl" class="block text-sm font-medium mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value="${settings.logoUrl || ''}"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="https://yourdomain.com/logo.png"
                />
                <p class="text-xs text-zinc-500 mt-1">
                  Logo to display in email templates
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4">
                <button
                  type="submit"
                  class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  id="testEmailBtn"
                  class="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                >
                  Send Test Email
                </button>
                <button
                  type="button"
                  id="resetBtn"
                  class="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-all"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <!-- Status Message -->
          <div id="statusMessage" class="hidden backdrop-blur-md bg-black/20 border border-white/10 rounded-xl p-4"></div>

          <!-- Info Card -->
          <div class="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 class="font-semibold text-blue-400 mb-3">
              📧 Email Templates Included
            </h3>
            <ul class="text-sm text-blue-200 space-y-2">
              <li>✓ Registration confirmation</li>
              <li>✓ Email verification</li>
              <li>✓ Password reset</li>
              <li>✓ One-time code (2FA)</li>
            </ul>
            <p class="text-xs text-blue-300 mt-4">
              Templates are code-based and can be customized by editing the plugin files.
            </p>
          </div>
        </div>
      </div>

      <script>
        // Form submission handler
        document.getElementById('emailSettingsForm').addEventListener('submit', async (e) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          const data = Object.fromEntries(formData.entries())

          const statusEl = document.getElementById('statusMessage')

          try {
            const response = await fetch('/admin/plugins/email/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })

            if (response.ok) {
              statusEl.className = 'backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6'
              statusEl.innerHTML = '✅ Settings saved successfully!'
              statusEl.classList.remove('hidden')
              setTimeout(() => statusEl.classList.add('hidden'), 3000)
            } else {
              throw new Error('Failed to save settings')
            }
          } catch (error) {
            statusEl.className = 'backdrop-blur-md bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6'
            statusEl.innerHTML = '❌ Failed to save settings. Please try again.'
            statusEl.classList.remove('hidden')
          }
        })

        // Test email handler
        document.getElementById('testEmailBtn').addEventListener('click', async () => {
          // Prompt for destination email
          const toEmail = prompt('Enter destination email address for test:')
          if (!toEmail) return

          // Basic email validation
          if (!toEmail.match(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/)) {
            alert('Please enter a valid email address')
            return
          }

          const statusEl = document.getElementById('statusMessage')

          statusEl.className = 'backdrop-blur-md bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6'
          statusEl.innerHTML = \`📧 Sending test email to \${toEmail}...\`
          statusEl.classList.remove('hidden')

          try {
            const response = await fetch('/admin/plugins/email/test', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ toEmail })
            })

            const data = await response.json()

            if (response.ok) {
              statusEl.className = 'backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6'
              statusEl.innerHTML = \`✅ \${data.message || 'Test email sent! Check your inbox.'}\`
            } else {
              statusEl.className = 'backdrop-blur-md bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6'
              statusEl.innerHTML = \`❌ \${data.error || 'Failed to send test email. Check your settings.'}\`
            }
          } catch (error) {
            statusEl.className = 'backdrop-blur-md bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6'
            statusEl.innerHTML = '❌ Network error. Please try again.'
          }
        })

        // Reset button handler
        document.getElementById('resetBtn').addEventListener('click', () => {
          document.getElementById('emailSettingsForm').reset()
        })
      </script>
    `

    return c.html(
      adminLayoutV2({
        title: 'Email Settings',
        content: contentHTML,
        user,
        currentPath: '/admin/plugins/email/settings'
      })
    )
  })

  // POST endpoint for saving settings
  emailRoutes.post('/settings', async (c: any) => {
    try {
      const body = await c.req.json()
      const db = c.env.DB

      // Update plugin settings in database
      await db.prepare(`
        UPDATE plugins
        SET settings = ?,
            updated_at = unixepoch()
        WHERE id = 'email'
      `).bind(JSON.stringify(body)).run()

      return c.json({ success: true })
    } catch (error) {
      console.error('Error saving email settings:', error)
      return c.json({ success: false, error: 'Failed to save settings' }, 500)
    }
  })

  // POST endpoint for test email
  emailRoutes.post('/test', async (c: any) => {
    try {
      const db = c.env.DB
      const body = await c.req.json()

      // Load settings from database
      const plugin = await db.prepare(`
        SELECT settings FROM plugins WHERE id = 'email'
      `).first() as { settings: string | null } | null

      if (!plugin?.settings) {
        return c.json({
          success: false,
          error: 'Email settings not configured. Please save your settings first.'
        }, 400)
      }

      const settings = JSON.parse(plugin.settings)

      // Validate required settings
      if (!settings.apiKey || !settings.fromEmail || !settings.fromName) {
        return c.json({
          success: false,
          error: 'Missing required settings. Please configure API Key, From Email, and From Name.'
        }, 400)
      }

      // Use provided email or fallback to fromEmail
      const toEmail = body.toEmail || settings.fromEmail

      // Validate email format
      if (!toEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return c.json({
          success: false,
          error: 'Invalid email address format'
        }, 400)
      }

      // Send test email via Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${settings.fromName} <${settings.fromEmail}>`,
          to: [toEmail],
          subject: 'Test Email from SonicJS',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #667eea;">Test Email Successful! 🎉</h1>
              <p>This is a test email from your SonicJS Email plugin.</p>
              <p><strong>Configuration:</strong></p>
              <ul>
                <li>From: ${settings.fromName} &lt;${settings.fromEmail}&gt;</li>
                <li>Reply-To: ${settings.replyTo || 'Not set'}</li>
                <li>Sent at: ${new Date().toISOString()}</li>
              </ul>
              <p>Your email settings are working correctly!</p>
            </div>
          `,
          reply_to: settings.replyTo || settings.fromEmail
        })
      })

      const data = await response.json() as any

      if (!response.ok) {
        console.error('Resend API error:', data)
        return c.json({
          success: false,
          error: data.message || 'Failed to send test email. Check your API key and domain verification.'
        }, response.status)
      }

      return c.json({
        success: true,
        message: `Test email sent successfully to ${toEmail}`,
        emailId: data.id
      })

    } catch (error: any) {
      console.error('Test email error:', error)
      return c.json({
        success: false,
        error: error.message || 'An error occurred while sending test email'
      }, 500)
    }
  })

  // Register the route
  builder.addRoute('/admin/plugins/email', emailRoutes, {
    description: 'Email plugin settings',
    requiresAuth: true,
    priority: 80
  })

  // Add menu item
  builder.addMenuItem('Email', '/admin/plugins/email/settings', {
    icon: 'envelope',
    order: 80,
    permissions: ['email:manage']
  })

  // Add lifecycle hooks
  builder.lifecycle({
    activate: async () => {
      console.info('✅ Email plugin activated')
    },

    deactivate: async () => {
      console.info('❌ Email plugin deactivated')
    }
  })

  return builder.build() as Plugin
}

// Export the plugin instance
export const emailPlugin = createEmailPlugin()
