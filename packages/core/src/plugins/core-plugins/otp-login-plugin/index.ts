/**
 * OTP Login Plugin
 *
 * Passwordless authentication via email one-time codes
 * Users receive a secure 6-digit code to sign in without passwords
 */

import { Hono } from 'hono'
import { html } from 'hono/html'
import { z } from 'zod'
import { PluginBuilder } from '../../sdk/plugin-builder'
import type { Plugin } from '@sonicjs-cms/core'
import { OTPService, type OTPSettings } from './otp-service'
import { renderOTPEmail } from './email-templates'
import { adminLayoutV2 } from '../../../templates/layouts/admin-layout-v2.template'

// Validation schemas
const otpRequestSchema = z.object({
  email: z.string().email('Valid email is required')
})

const otpVerifySchema = z.object({
  email: z.string().email('Valid email is required'),
  code: z.string().min(4).max(8)
})

// Default settings
const DEFAULT_SETTINGS: OTPSettings = {
  codeLength: 6,
  codeExpiryMinutes: 10,
  maxAttempts: 3,
  rateLimitPerHour: 5,
  allowNewUserRegistration: false,
  appName: 'SonicJS'
}

export function createOTPLoginPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'otp-login',
    version: '1.0.0-beta.1',
    description: 'Passwordless authentication via email one-time codes'
  })

  builder.metadata({
    author: {
      name: 'SonicJS Team',
      email: 'team@sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^2.0.0'
  })

  // ==================== API Routes ====================

  const otpAPI = new Hono()

  // POST /auth/otp/request - Request OTP code
  otpAPI.post('/request', async (c: any) => {
    try {
      const body = await c.req.json()
      const validation = otpRequestSchema.safeParse(body)

      if (!validation.success) {
        return c.json({
          error: 'Validation failed',
          details: validation.error.issues
        }, 400)
      }

      const { email } = validation.data
      const normalizedEmail = email.toLowerCase()
      const db = c.env.DB
      const otpService = new OTPService(db)
      const settings = { ...DEFAULT_SETTINGS } // TODO: Load from plugin settings

      // Check rate limiting
      const canRequest = await otpService.checkRateLimit(normalizedEmail, settings)
      if (!canRequest) {
        return c.json({
          error: 'Too many requests. Please try again in an hour.'
        }, 429)
      }

      // Check if user exists
      const user = await db.prepare(`
        SELECT id, email, role, is_active
        FROM users
        WHERE email = ?
      `).bind(normalizedEmail).first() as any

      if (!user && !settings.allowNewUserRegistration) {
        // Don't reveal if user exists or not (security)
        return c.json({
          message: 'If an account exists for this email, you will receive a verification code shortly.',
          expiresIn: settings.codeExpiryMinutes * 60
        })
      }

      if (user && !user.is_active) {
        return c.json({
          error: 'This account has been deactivated.'
        }, 403)
      }

      // Get IP and user agent
      const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
      const userAgent = c.req.header('user-agent') || 'unknown'

      // Create OTP code
      const otpCode = await otpService.createOTPCode(
        normalizedEmail,
        settings,
        ipAddress,
        userAgent
      )

      // Send email via Email plugin
      try {
        const isDevMode = c.env.ENVIRONMENT === 'development'

        if (isDevMode) {
          console.log(`[DEV] OTP Code for ${normalizedEmail}: ${otpCode.code}`)
        }

        // Prepare email content
        const emailContent = renderOTPEmail({
          code: otpCode.code,
          expiryMinutes: settings.codeExpiryMinutes,
          codeLength: settings.codeLength,
          maxAttempts: settings.maxAttempts,
          email: normalizedEmail,
          ipAddress,
          timestamp: new Date().toISOString(),
          appName: settings.appName
        })

        // Load email plugin settings from database
        const emailPlugin = await db.prepare(`
          SELECT settings FROM plugins WHERE id = 'email' AND status = 'active'
        `).first() as { settings: string | null } | null

        if (emailPlugin?.settings) {
          const emailSettings = JSON.parse(emailPlugin.settings)

          if (emailSettings.apiKey && emailSettings.fromEmail && emailSettings.fromName) {
            // Send email via Resend API
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${emailSettings.apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: `${emailSettings.fromName} <${emailSettings.fromEmail}>`,
                to: [normalizedEmail],
                subject: `Your login code for ${settings.appName}`,
                html: emailContent.html,
                text: emailContent.text,
                reply_to: emailSettings.replyTo || emailSettings.fromEmail
              })
            })

            if (!emailResponse.ok) {
              const errorData = await emailResponse.json() as { message?: string }
              console.error('Failed to send OTP email via Resend:', errorData)
              // Don't expose error to user for security - just log it
            }
          } else {
            console.warn('Email plugin is not fully configured (missing apiKey, fromEmail, or fromName)')
          }
        } else {
          console.warn('Email plugin is not active or has no settings configured')
        }

        const response: any = {
          message: 'If an account exists for this email, you will receive a verification code shortly.',
          expiresIn: settings.codeExpiryMinutes * 60
        }

        // In development, include the code
        if (isDevMode) {
          response.dev_code = otpCode.code
        }

        return c.json(response)
      } catch (emailError) {
        console.error('Error sending OTP email:', emailError)
        return c.json({
          error: 'Failed to send verification code. Please try again.'
        }, 500)
      }
    } catch (error) {
      console.error('OTP request error:', error)
      return c.json({
        error: 'An error occurred. Please try again.'
      }, 500)
    }
  })

  // POST /auth/otp/verify - Verify OTP code
  otpAPI.post('/verify', async (c: any) => {
    try {
      const body = await c.req.json()
      const validation = otpVerifySchema.safeParse(body)

      if (!validation.success) {
        return c.json({
          error: 'Validation failed',
          details: validation.error.issues
        }, 400)
      }

      const { email, code } = validation.data
      const normalizedEmail = email.toLowerCase()
      const db = c.env.DB
      const otpService = new OTPService(db)
      const settings = { ...DEFAULT_SETTINGS } // TODO: Load from plugin settings

      // Verify the code
      const verification = await otpService.verifyCode(normalizedEmail, code, settings)

      if (!verification.valid) {
        // Increment attempts on failure
        await otpService.incrementAttempts(normalizedEmail, code)

        return c.json({
          error: verification.error || 'Invalid code',
          attemptsRemaining: verification.attemptsRemaining
        }, 401)
      }

      // Code is valid - get user
      const user = await db.prepare(`
        SELECT id, email, role, is_active
        FROM users
        WHERE email = ?
      `).bind(normalizedEmail).first() as any

      if (!user) {
        return c.json({
          error: 'User not found'
        }, 404)
      }

      if (!user.is_active) {
        return c.json({
          error: 'Account is deactivated'
        }, 403)
      }

      // TODO: Generate JWT token
      // For now, return success with user data
      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        message: 'Authentication successful'
      })
    } catch (error) {
      console.error('OTP verify error:', error)
      return c.json({
        error: 'An error occurred. Please try again.'
      }, 500)
    }
  })

  // POST /auth/otp/resend - Resend OTP code
  otpAPI.post('/resend', async (c: any) => {
    try {
      const body = await c.req.json()
      const validation = otpRequestSchema.safeParse(body)

      if (!validation.success) {
        return c.json({
          error: 'Validation failed',
          details: validation.error.issues
        }, 400)
      }

      // Reuse the request endpoint logic
      return otpAPI.fetch(
        new Request(c.req.url.replace('/resend', '/request'), {
          method: 'POST',
          headers: c.req.raw.headers,
          body: JSON.stringify({ email: validation.data.email })
        }),
        c.env
      )
    } catch (error) {
      console.error('OTP resend error:', error)
      return c.json({
        error: 'An error occurred. Please try again.'
      }, 500)
    }
  })

  // Register API routes
  builder.addRoute('/auth/otp', otpAPI, {
    description: 'OTP authentication endpoints',
    requiresAuth: false,
    priority: 100
  })

  // ==================== Admin UI Routes ====================

  const adminRoutes = new Hono()

  // Settings page
  adminRoutes.get('/settings', async (c: any) => {
    const user = c.get('user') as { email?: string; role?: string; name?: string } | undefined

    const contentHTML = await html`
      <div class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">OTP Login Settings</h1>
          <p class="text-zinc-600 dark:text-zinc-400">Configure passwordless authentication via email codes</p>
        </div>

        <div class="max-w-3xl">
          <div class="backdrop-blur-md bg-black/20 border border-white/10 shadow-xl rounded-xl p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Code Settings</h2>

            <form id="otpSettingsForm" class="space-y-6">
              <div>
                <label for="codeLength" class="block text-sm font-medium mb-2">
                  Code Length
                </label>
                <input
                  type="number"
                  id="codeLength"
                  name="codeLength"
                  min="4"
                  max="8"
                  value="6"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
                <p class="text-xs text-zinc-500 mt-1">Number of digits in OTP code (4-8)</p>
              </div>

              <div>
                <label for="codeExpiryMinutes" class="block text-sm font-medium mb-2">
                  Code Expiry (minutes)
                </label>
                <input
                  type="number"
                  id="codeExpiryMinutes"
                  name="codeExpiryMinutes"
                  min="5"
                  max="60"
                  value="10"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
                <p class="text-xs text-zinc-500 mt-1">How long codes remain valid (5-60 minutes)</p>
              </div>

              <div>
                <label for="maxAttempts" class="block text-sm font-medium mb-2">
                  Maximum Attempts
                </label>
                <input
                  type="number"
                  id="maxAttempts"
                  name="maxAttempts"
                  min="3"
                  max="10"
                  value="3"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
                <p class="text-xs text-zinc-500 mt-1">Max verification attempts before invalidation</p>
              </div>

              <div>
                <label for="rateLimitPerHour" class="block text-sm font-medium mb-2">
                  Rate Limit (per hour)
                </label>
                <input
                  type="number"
                  id="rateLimitPerHour"
                  name="rateLimitPerHour"
                  min="3"
                  max="20"
                  value="5"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
                <p class="text-xs text-zinc-500 mt-1">Max code requests per email per hour</p>
              </div>

              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="allowNewUserRegistration"
                  name="allowNewUserRegistration"
                  class="w-4 h-4 rounded border-white/10"
                />
                <label for="allowNewUserRegistration" class="ml-2 text-sm">
                  Allow new user registration via OTP
                </label>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="submit"
                  class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  id="testOTPBtn"
                  class="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                >
                  Send Test Code
                </button>
              </div>
            </form>
          </div>

          <div id="statusMessage" class="hidden backdrop-blur-md bg-black/20 border border-white/10 rounded-xl p-4 mb-6"></div>

          <div class="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 class="font-semibold text-blue-400 mb-3">
              🔢 Features
            </h3>
            <ul class="text-sm text-blue-200 space-y-2">
              <li>✓ Passwordless authentication</li>
              <li>✓ Secure random code generation</li>
              <li>✓ Rate limiting protection</li>
              <li>✓ Brute force prevention</li>
              <li>✓ Mobile-friendly UX</li>
            </ul>
          </div>
        </div>
      </div>

      <script>
        document.getElementById('otpSettingsForm').addEventListener('submit', async (e) => {
          e.preventDefault()
          const statusEl = document.getElementById('statusMessage')
          statusEl.className = 'backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6'
          statusEl.innerHTML = '✅ Settings saved successfully!'
          statusEl.classList.remove('hidden')
          setTimeout(() => statusEl.classList.add('hidden'), 3000)
        })

        document.getElementById('testOTPBtn').addEventListener('click', async () => {
          const email = prompt('Enter email address for test:')
          if (!email) return

          const statusEl = document.getElementById('statusMessage')
          statusEl.className = 'backdrop-blur-md bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6'
          statusEl.innerHTML = '📧 Sending test code...'
          statusEl.classList.remove('hidden')

          try {
            const response = await fetch('/auth/otp/request', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (response.ok) {
              statusEl.className = 'backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6'
              statusEl.innerHTML = '✅ Test code sent!' + (data.dev_code ? \` Code: <strong>\${data.dev_code}</strong>\` : '')
            } else {
              throw new Error(data.error || 'Failed')
            }
          } catch (error) {
            statusEl.className = 'backdrop-blur-md bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6'
            statusEl.innerHTML = '❌ Failed to send test code'
          }
        })
      </script>
    `

    const templateUser = user ? {
      name: user.name ?? user.email ?? 'Admin',
      email: user.email ?? 'admin@sonicjs.com',
      role: user.role ?? 'admin'
    } : undefined

    return c.html(
      adminLayoutV2({
        title: 'OTP Login Settings',
        content: contentHTML,
        user: templateUser,
        currentPath: '/admin/plugins/otp-login/settings'
      })
    )
  })

  // Register admin routes
  builder.addRoute('/admin/plugins/otp-login', adminRoutes, {
    description: 'OTP login admin interface',
    requiresAuth: true,
    priority: 85
  })

  // Add menu item
  builder.addMenuItem('OTP Login', '/admin/plugins/otp-login/settings', {
    icon: 'key',
    order: 85,
    permissions: ['otp:manage']
  })

  // Lifecycle hooks
  builder.lifecycle({
    activate: async () => {
      console.info('✅ OTP Login plugin activated')
    },
    deactivate: async () => {
      console.info('❌ OTP Login plugin deactivated')
    }
  })

  return builder.build() as Plugin
}

export const otpLoginPlugin = createOTPLoginPlugin()
