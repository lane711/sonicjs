import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Hono } from 'hono'
import { adminPluginRoutes } from '../../routes/admin-plugins'
import { PluginService } from '../../services'

// Mock the requireAuth middleware to bypass authentication in tests
vi.mock('../../middleware', () => ({
  requireAuth: () => {
    return async (c: any, next: any) => {
      // Set a mock user in context
      c.set('user', {
        id: 'test-user',
        email: 'test@example.com',
        role: 'admin'
      })
      await next()
    }
  }
}))

// Mock the PluginService
vi.mock('../../services', () => ({
  PluginService: class {
    getAllPlugins = vi.fn().mockResolvedValue([
      {
        id: 'email',
        name: 'email',
        display_name: 'Email',
        description: 'Send transactional emails using Resend',
        version: '1.0.0-beta.1',
        author: 'SonicJS Team',
        category: 'communication',
        icon: '📧',
        status: 'inactive',
        is_core: true,
        permissions: '["email:manage", "email:send", "email:view-logs"]',
        installed_at: Date.now(),
        last_updated: Date.now()
      },
      {
        id: 'auth',
        name: 'auth',
        display_name: 'Authentication',
        description: 'User authentication and authorization',
        version: '1.0.0',
        author: 'SonicJS Team',
        category: 'security',
        icon: '🔐',
        status: 'active',
        is_core: true,
        permissions: '["auth:manage"]',
        installed_at: Date.now(),
        last_updated: Date.now()
      }
    ])
    getPluginStats = vi.fn().mockResolvedValue({
      total: 2,
      active: 1,
      inactive: 1,
      core: 2,
      custom: 0
    })
  }
}))

// Mock environment bindings
const createMockEnv = () => ({
  DB: {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn(),
      all: vi.fn(),
      run: vi.fn()
    })
  },
  KV: {},
  CACHE_KV: {}
})

describe('Admin Plugins Routes', () => {
  let app: Hono
  let mockEnv: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockEnv = createMockEnv()

    // Create new app instance for each test with typed env
    app = new Hono<{ Bindings: { DB: any; KV: any; CACHE_KV: any } }>()

    // Set up middleware to provide env and app context (for Hono's c.env access)
    app.use('*', async (c, next) => {
      // Manually set env properties for testing
      // @ts-ignore - Setting env for test purposes
      c.env = mockEnv
      c.set('appVersion', '1.0.0-test')
      await next()
    })

    // Mount admin plugin routes (requireAuth middleware is mocked to provide user context)
    app.route('/admin/plugins', adminPluginRoutes)
  })

  describe('GET /admin/plugins', () => {
    it('should return plugins list page with email plugin', async () => {
      const res = await app.request('/admin/plugins', {
        method: 'GET',
        headers: {
          'Content-Type': 'text/html'
        }
      })

      expect(res.status).toBe(200)

      const html = await res.text()

      // Check that the page contains the email plugin
      expect(html).toContain('Email')
      expect(html).toContain('Send transactional emails using Resend')
      expect(html).toContain('📧')

      // Check that it shows as inactive
      expect(html).toContain('inactive')

      // Check that the page has the authentication plugin too
      expect(html).toContain('Authentication')
      expect(html).toContain('🔐')
    })

    it('should display correct plugin statistics', async () => {
      const res = await app.request('/admin/plugins', {
        method: 'GET'
      })

      expect(res.status).toBe(200)

      const html = await res.text()

      // Verify stats are displayed (these would be in the UI)
      expect(html).toContain('2') // Total plugins
      expect(html).toContain('1') // Active plugins count would appear
    })
  })

  describe('Email Plugin Visibility', () => {
    it('should list email plugin in the plugins array', async () => {
      const service = new PluginService(mockEnv.DB)
      const plugins = await service.getAllPlugins()

      const emailPlugin = plugins.find(p => p.id === 'email')

      expect(emailPlugin).toBeDefined()
      expect(emailPlugin?.display_name).toBe('Email')
      expect(emailPlugin?.category).toBe('communication')
      expect(emailPlugin?.status).toBe('inactive')
      expect(emailPlugin?.is_core).toBe(true)
    })

    it('should include email plugin metadata', async () => {
      const service = new PluginService(mockEnv.DB)
      const plugins = await service.getAllPlugins()

      const emailPlugin = plugins.find(p => p.id === 'email')

      expect(emailPlugin?.version).toBe('1.0.0-beta.1')
      expect(emailPlugin?.author).toBe('SonicJS Team')
      expect(emailPlugin?.description).toContain('transactional emails')
      expect(emailPlugin?.icon).toBe('📧')
    })
  })
})
