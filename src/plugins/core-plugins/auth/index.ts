/**
 * Core Auth Plugin
 * 
 * Provides authentication and authorization extensions
 */

import { Hono } from 'hono'
import { PluginBuilder } from '../../sdk/plugin-builder'
import { Plugin, HOOKS } from '../../types'

export function createAuthPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'core-auth',
    version: '1.0.0-beta.1',
    description: 'Core authentication and authorization plugin'
  })

  // Add auth metadata
  builder.metadata({
    author: {
      name: 'SonicJS Team',
      email: 'team@sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^0.1.0'
  })

  // Create auth API routes
  const authAPI = new Hono()

  // POST /auth/login - User login
  authAPI.post('/login', async (c) => {
    const { email } = await c.req.json()
    
    // Login logic would integrate with existing auth service
    return c.json({ 
      message: 'Login endpoint',
      data: { email }
    })
  })

  // POST /auth/logout - User logout
  authAPI.post('/logout', async (c) => {
    return c.json({ message: 'Logout successful' })
  })

  // GET /auth/me - Current user info
  authAPI.get('/me', async (c) => {
    return c.json({ 
      message: 'Current user info',
      user: { id: 1, email: 'user@example.com' }
    })
  })

  // POST /auth/refresh - Refresh token
  authAPI.post('/refresh', async (c) => {
    return c.json({ message: 'Token refreshed' })
  })

  builder.addRoute('/api/auth', authAPI, {
    description: 'Authentication API endpoints',
    priority: 1
  })

  // Add auth middleware
  builder.addSingleMiddleware('auth-session', async (c: any, next: any) => {
    // Session management middleware
    const sessionId = c.req.header('x-session-id')
    if (sessionId) {
      c.set('sessionId', sessionId)
    }
    await next()
  }, {
    description: 'Session management middleware',
    global: true,
    priority: 5
  })

  builder.addSingleMiddleware('auth-rate-limit', async (c: any, next: any) => {
    // Rate limiting for auth endpoints
    const path = c.req.path
    if (path.startsWith('/api/auth/')) {
      // Rate limiting logic would go here
      const clientIP = c.req.header('CF-Connecting-IP') || 'unknown'
      console.debug(`Auth rate limit check for IP: ${clientIP}`)
    }
    await next()
  }, {
    description: 'Rate limiting for authentication endpoints',
    routes: ['/api/auth/*'],
    priority: 3
  })

  // Add auth service
  builder.addService('authService', {
    validateToken: (_token: string) => {
      // Token validation logic
      return { valid: true, userId: 1 }
    },
    
    generateToken: (userId: number) => {
      // Token generation logic
      return `token-${userId}-${Date.now()}`
    },
    
    hashPassword: (password: string) => {
      // Password hashing logic
      return `hashed-${password}`
    },
    
    verifyPassword: (password: string, hash: string) => {
      // Password verification logic
      return hash === `hashed-${password}`
    }
  }, {
    description: 'Core authentication service',
    singleton: true
  })

  // Add auth hooks
  builder.addHook('auth:login', async (data: any) => {
    console.info(`User login attempt: ${data.email}`)
    return data
  }, {
    priority: 10,
    description: 'Handle user login events'
  })

  builder.addHook('auth:logout', async (data: any) => {
    console.info(`User logout: ${data.userId}`)
    return data
  }, {
    priority: 10,
    description: 'Handle user logout events'
  })

  builder.addHook(HOOKS.REQUEST_START, async (data: any) => {
    // Track authentication status on each request
    const authHeader = data.request?.headers?.authorization
    if (authHeader) {
      data.authenticated = true
    }
    return data
  }, {
    priority: 5,
    description: 'Track authentication status on requests'
  })

  // Add admin pages
  builder.addAdminPage(
    '/auth/sessions',
    'Active Sessions',
    'AuthSessionsView',
    {
      description: 'View and manage active user sessions',
      permissions: ['admin', 'auth:manage'],
      icon: 'users'
    }
  )

  builder.addAdminPage(
    '/auth/tokens',
    'API Tokens',
    'AuthTokensView',
    {
      description: 'Manage API tokens and access keys',
      permissions: ['admin', 'auth:manage'],
      icon: 'key'
    }
  )

  // Add menu items
  builder.addMenuItem('Authentication', '/admin/auth', {
    icon: 'shield',
    order: 20,
    permissions: ['admin', 'auth:manage']
  })

  builder.addMenuItem('Sessions', '/admin/auth/sessions', {
    icon: 'users',
    parent: 'Authentication',
    order: 1,
    permissions: ['admin', 'auth:manage']
  })

  builder.addMenuItem('API Tokens', '/admin/auth/tokens', {
    icon: 'key',
    parent: 'Authentication',
    order: 2,
    permissions: ['admin', 'auth:manage']
  })

  // Add lifecycle hooks
  builder.lifecycle({
    install: async () => {
      console.info('Installing auth plugin...')
      // Create auth-related database tables or configurations
    },

    activate: async () => {
      console.info('Activating auth plugin...')
      // Initialize auth services and middleware
    },

    deactivate: async () => {
      console.info('Deactivating auth plugin...')
      // Clean up auth resources
    },

    configure: async (config) => {
      console.info('Configuring auth plugin...', config)
      // Apply configuration changes
    }
  })

  return builder.build()
}

// Export the plugin instance
export const authPlugin = createAuthPlugin()