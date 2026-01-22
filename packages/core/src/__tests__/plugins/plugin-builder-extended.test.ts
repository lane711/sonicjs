/**
 * Extended Plugin Builder Tests
 *
 * Tests for PluginBuilder class, PluginHelpers methods, and PluginTemplates
 */

import { describe, it, expect } from 'vitest'
import { PluginBuilder, PluginHelpers, PluginTemplates } from '../../plugins/sdk/plugin-builder'
import { Hono } from 'hono'
import { z } from 'zod'

describe('PluginBuilder', () => {
  describe('create and build', () => {
    it('creates a plugin builder with required options', () => {
      const builder = PluginBuilder.create({
        name: 'test-plugin',
        version: '1.0.0'
      })

      expect(builder).toBeInstanceOf(PluginBuilder)
    })

    it('builds a minimal plugin with name and version', () => {
      const plugin = PluginBuilder.create({
        name: 'minimal-plugin',
        version: '1.0.0'
      }).build()

      expect(plugin.name).toBe('minimal-plugin')
      expect(plugin.version).toBe('1.0.0')
      expect(plugin.routes).toEqual([])
      expect(plugin.middleware).toEqual([])
      expect(plugin.models).toEqual([])
      expect(plugin.services).toEqual([])
      expect(plugin.adminPages).toEqual([])
      expect(plugin.adminComponents).toEqual([])
      expect(plugin.menuItems).toEqual([])
      expect(plugin.hooks).toEqual([])
    })

    it('includes description and author when provided', () => {
      const plugin = PluginBuilder.create({
        name: 'full-plugin',
        version: '2.0.0',
        description: 'A test plugin',
        author: { name: 'Test Author', email: 'test@example.com' }
      }).build()

      expect(plugin.description).toBe('A test plugin')
      expect(plugin.author).toEqual({ name: 'Test Author', email: 'test@example.com' })
    })

    it('includes dependencies when provided', () => {
      const plugin = PluginBuilder.create({
        name: 'dep-plugin',
        version: '1.0.0',
        dependencies: ['plugin-a', 'plugin-b']
      }).build()

      expect(plugin.dependencies).toEqual(['plugin-a', 'plugin-b'])
    })

    it('throws error when name is missing', () => {
      expect(() => {
        PluginBuilder.create({
          name: '',
          version: '1.0.0'
        }).build()
      }).toThrow('Plugin name and version are required')
    })

    it('throws error when version is missing', () => {
      expect(() => {
        PluginBuilder.create({
          name: 'test',
          version: ''
        }).build()
      }).toThrow('Plugin name and version are required')
    })
  })

  describe('metadata', () => {
    it('adds metadata to plugin', () => {
      const plugin = PluginBuilder.create({
        name: 'meta-plugin',
        version: '1.0.0'
      })
        .metadata({
          description: 'Updated description',
          license: 'MIT',
          compatibility: '^2.0.0'
        })
        .build()

      expect(plugin.description).toBe('Updated description')
    })

    it('metadata method returns builder for chaining', () => {
      const builder = PluginBuilder.create({
        name: 'test',
        version: '1.0.0'
      })

      const result = builder.metadata({ description: 'Test' })
      expect(result).toBe(builder)
    })
  })

  describe('addRoutes and addRoute', () => {
    it('adds multiple routes with addRoutes', () => {
      const app1 = new Hono()
      const app2 = new Hono()

      const plugin = PluginBuilder.create({
        name: 'routes-plugin',
        version: '1.0.0'
      })
        .addRoutes([
          { path: '/api/route1', handler: app1 },
          { path: '/api/route2', handler: app2 }
        ])
        .build()

      expect(plugin.routes).toHaveLength(2)
      expect(plugin.routes![0].path).toBe('/api/route1')
      expect(plugin.routes![1].path).toBe('/api/route2')
    })

    it('adds single route with addRoute', () => {
      const app = new Hono()

      const plugin = PluginBuilder.create({
        name: 'single-route-plugin',
        version: '1.0.0'
      })
        .addRoute('/api/test', app)
        .build()

      expect(plugin.routes).toHaveLength(1)
      expect(plugin.routes![0].path).toBe('/api/test')
      expect(plugin.routes![0].handler).toBe(app)
    })

    it('adds route with options', () => {
      const app = new Hono()

      const plugin = PluginBuilder.create({
        name: 'route-options-plugin',
        version: '1.0.0'
      })
        .addRoute('/api/secure', app, {
          description: 'Secure endpoint',
          requiresAuth: true,
          roles: ['admin'],
          priority: 10
        })
        .build()

      expect(plugin.routes![0].description).toBe('Secure endpoint')
      expect(plugin.routes![0].requiresAuth).toBe(true)
      expect(plugin.routes![0].roles).toEqual(['admin'])
      expect(plugin.routes![0].priority).toBe(10)
    })

    it('accumulates routes from multiple calls', () => {
      const app = new Hono()

      const plugin = PluginBuilder.create({
        name: 'multi-route-plugin',
        version: '1.0.0'
      })
        .addRoute('/api/route1', app)
        .addRoute('/api/route2', app)
        .addRoute('/api/route3', app)
        .build()

      expect(plugin.routes).toHaveLength(3)
    })
  })

  describe('addMiddleware and addSingleMiddleware', () => {
    it('adds multiple middleware with addMiddleware', () => {
      const handler1 = async () => {}
      const handler2 = async () => {}

      const plugin = PluginBuilder.create({
        name: 'middleware-plugin',
        version: '1.0.0'
      })
        .addMiddleware([
          { name: 'mw1', handler: handler1 },
          { name: 'mw2', handler: handler2 }
        ])
        .build()

      expect(plugin.middleware).toHaveLength(2)
    })

    it('adds single middleware with addSingleMiddleware', () => {
      const handler = async () => {}

      const plugin = PluginBuilder.create({
        name: 'single-mw-plugin',
        version: '1.0.0'
      })
        .addSingleMiddleware('auth-check', handler)
        .build()

      expect(plugin.middleware).toHaveLength(1)
      expect(plugin.middleware![0].name).toBe('auth-check')
      expect(plugin.middleware![0].handler).toBe(handler)
    })

    it('adds middleware with options', () => {
      const handler = async () => {}

      const plugin = PluginBuilder.create({
        name: 'mw-options-plugin',
        version: '1.0.0'
      })
        .addSingleMiddleware('global-auth', handler, {
          description: 'Global auth middleware',
          priority: 1,
          routes: ['/api/*'],
          global: true
        })
        .build()

      expect(plugin.middleware![0].description).toBe('Global auth middleware')
      expect(plugin.middleware![0].priority).toBe(1)
      expect(plugin.middleware![0].routes).toEqual(['/api/*'])
      expect(plugin.middleware![0].global).toBe(true)
    })
  })

  describe('addModels and addModel', () => {
    it('adds multiple models with addModels', () => {
      const plugin = PluginBuilder.create({
        name: 'models-plugin',
        version: '1.0.0'
      })
        .addModels([
          { name: 'User', tableName: 'users', schema: z.object({}), migrations: [] },
          { name: 'Post', tableName: 'posts', schema: z.object({}), migrations: [] }
        ])
        .build()

      expect(plugin.models).toHaveLength(2)
    })

    it('adds single model with addModel', () => {
      const schema = z.object({ title: z.string() })

      const plugin = PluginBuilder.create({
        name: 'single-model-plugin',
        version: '1.0.0'
      })
        .addModel('Article', {
          tableName: 'articles',
          schema,
          migrations: ['CREATE TABLE articles (id TEXT PRIMARY KEY)']
        })
        .build()

      expect(plugin.models).toHaveLength(1)
      expect(plugin.models![0].name).toBe('Article')
      expect(plugin.models![0].tableName).toBe('articles')
    })

    it('adds model with relationships and extendsContent', () => {
      const plugin = PluginBuilder.create({
        name: 'rel-model-plugin',
        version: '1.0.0'
      })
        .addModel('Comment', {
          tableName: 'comments',
          schema: z.object({}),
          migrations: [],
          relationships: [{ type: 'belongsTo', model: 'Post', foreignKey: 'post_id' }],
          extendsContent: true
        })
        .build()

      expect(plugin.models![0].relationships).toEqual([
        { type: 'belongsTo', model: 'Post', foreignKey: 'post_id' }
      ])
      expect(plugin.models![0].extendsContent).toBe(true)
    })
  })

  describe('addServices and addService', () => {
    it('adds multiple services with addServices', () => {
      const impl1 = { doSomething: () => {} }
      const impl2 = { doOther: () => {} }

      const plugin = PluginBuilder.create({
        name: 'services-plugin',
        version: '1.0.0'
      })
        .addServices([
          { name: 'service1', implementation: impl1 },
          { name: 'service2', implementation: impl2 }
        ])
        .build()

      expect(plugin.services).toHaveLength(2)
    })

    it('adds single service with addService', () => {
      const impl = { process: () => 'result' }

      const plugin = PluginBuilder.create({
        name: 'single-service-plugin',
        version: '1.0.0'
      })
        .addService('processor', impl)
        .build()

      expect(plugin.services).toHaveLength(1)
      expect(plugin.services![0].name).toBe('processor')
    })

    it('adds service with options', () => {
      const impl = {}

      const plugin = PluginBuilder.create({
        name: 'service-options-plugin',
        version: '1.0.0'
      })
        .addService('cache', impl, {
          description: 'Cache service',
          dependencies: ['db'],
          singleton: true
        })
        .build()

      expect(plugin.services![0].description).toBe('Cache service')
      expect(plugin.services![0].dependencies).toEqual(['db'])
      expect(plugin.services![0].singleton).toBe(true)
    })
  })

  describe('addAdminPages and addAdminPage', () => {
    it('adds multiple admin pages with addAdminPages', () => {
      const plugin = PluginBuilder.create({
        name: 'admin-pages-plugin',
        version: '1.0.0'
      })
        .addAdminPages([
          { path: '/admin/page1', title: 'Page 1', component: 'Page1' },
          { path: '/admin/page2', title: 'Page 2', component: 'Page2' }
        ])
        .build()

      expect(plugin.adminPages).toHaveLength(2)
    })

    it('adds single admin page with addAdminPage', () => {
      const plugin = PluginBuilder.create({
        name: 'single-admin-page-plugin',
        version: '1.0.0'
      })
        .addAdminPage('/admin/settings', 'Settings', 'SettingsPage')
        .build()

      expect(plugin.adminPages).toHaveLength(1)
      expect(plugin.adminPages![0].path).toBe('/admin/settings')
      expect(plugin.adminPages![0].title).toBe('Settings')
      expect(plugin.adminPages![0].component).toBe('SettingsPage')
    })

    it('adds admin page with options', () => {
      const plugin = PluginBuilder.create({
        name: 'admin-page-options-plugin',
        version: '1.0.0'
      })
        .addAdminPage('/admin/users', 'User Management', 'UsersPage', {
          description: 'Manage users',
          permissions: ['admin', 'superadmin'],
          icon: 'users'
        })
        .build()

      expect(plugin.adminPages![0].description).toBe('Manage users')
      expect(plugin.adminPages![0].permissions).toEqual(['admin', 'superadmin'])
      expect(plugin.adminPages![0].icon).toBe('users')
    })
  })

  describe('addComponents and addComponent', () => {
    it('adds multiple components with addComponents', () => {
      const template1 = () => '<div>1</div>'
      const template2 = () => '<div>2</div>'

      const plugin = PluginBuilder.create({
        name: 'components-plugin',
        version: '1.0.0'
      })
        .addComponents([
          { name: 'Comp1', template: template1 },
          { name: 'Comp2', template: template2 }
        ])
        .build()

      expect(plugin.adminComponents).toHaveLength(2)
    })

    it('adds single component with addComponent', () => {
      const template = (props: { name: string }) => `<span>${props.name}</span>`

      const plugin = PluginBuilder.create({
        name: 'single-component-plugin',
        version: '1.0.0'
      })
        .addComponent('Greeting', template)
        .build()

      expect(plugin.adminComponents).toHaveLength(1)
      expect(plugin.adminComponents![0].name).toBe('Greeting')
    })

    it('adds component with options', () => {
      const template = () => '<div></div>'

      const plugin = PluginBuilder.create({
        name: 'comp-options-plugin',
        version: '1.0.0'
      })
        .addComponent('Form', template, {
          description: 'A form component',
          propsSchema: z.object({ title: z.string() })
        })
        .build()

      expect(plugin.adminComponents![0].description).toBe('A form component')
    })
  })

  describe('addMenuItems and addMenuItem', () => {
    it('adds multiple menu items with addMenuItems', () => {
      const plugin = PluginBuilder.create({
        name: 'menu-items-plugin',
        version: '1.0.0'
      })
        .addMenuItems([
          { label: 'Home', path: '/admin' },
          { label: 'Settings', path: '/admin/settings' }
        ])
        .build()

      expect(plugin.menuItems).toHaveLength(2)
    })

    it('adds single menu item with addMenuItem', () => {
      const plugin = PluginBuilder.create({
        name: 'single-menu-item-plugin',
        version: '1.0.0'
      })
        .addMenuItem('Dashboard', '/admin/dashboard')
        .build()

      expect(plugin.menuItems).toHaveLength(1)
      expect(plugin.menuItems![0].label).toBe('Dashboard')
      expect(plugin.menuItems![0].path).toBe('/admin/dashboard')
    })

    it('adds menu item with options', () => {
      const plugin = PluginBuilder.create({
        name: 'menu-item-options-plugin',
        version: '1.0.0'
      })
        .addMenuItem('Reports', '/admin/reports', {
          icon: 'chart',
          order: 5,
          parent: 'analytics',
          permissions: ['admin']
        })
        .build()

      expect(plugin.menuItems![0].icon).toBe('chart')
      expect(plugin.menuItems![0].order).toBe(5)
      expect(plugin.menuItems![0].parent).toBe('analytics')
      expect(plugin.menuItems![0].permissions).toEqual(['admin'])
    })
  })

  describe('addHooks and addHook', () => {
    it('adds multiple hooks with addHooks', () => {
      const handler1 = async () => {}
      const handler2 = async () => {}

      const plugin = PluginBuilder.create({
        name: 'hooks-plugin',
        version: '1.0.0'
      })
        .addHooks([
          { name: 'content:create', handler: handler1 },
          { name: 'content:update', handler: handler2 }
        ])
        .build()

      expect(plugin.hooks).toHaveLength(2)
    })

    it('adds single hook with addHook', () => {
      const handler = async () => {}

      const plugin = PluginBuilder.create({
        name: 'single-hook-plugin',
        version: '1.0.0'
      })
        .addHook('content:save', handler)
        .build()

      expect(plugin.hooks).toHaveLength(1)
      expect(plugin.hooks![0].name).toBe('content:save')
    })

    it('adds hook with options', () => {
      const handler = async () => {}

      const plugin = PluginBuilder.create({
        name: 'hook-options-plugin',
        version: '1.0.0'
      })
        .addHook('content:publish', handler, {
          priority: 100,
          description: 'Run before publish'
        })
        .build()

      expect(plugin.hooks![0].priority).toBe(100)
      expect(plugin.hooks![0].description).toBe('Run before publish')
    })
  })

  describe('lifecycle', () => {
    it('adds lifecycle hooks', () => {
      const install = async () => {}
      const activate = async () => {}
      const deactivate = async () => {}
      const uninstall = async () => {}
      const configure = async () => ({})

      const plugin = PluginBuilder.create({
        name: 'lifecycle-plugin',
        version: '1.0.0'
      })
        .lifecycle({
          install,
          activate,
          deactivate,
          uninstall,
          configure
        })
        .build()

      expect(plugin.install).toBe(install)
      expect(plugin.activate).toBe(activate)
      expect(plugin.deactivate).toBe(deactivate)
      expect(plugin.uninstall).toBe(uninstall)
      expect(plugin.configure).toBe(configure)
    })

    it('adds partial lifecycle hooks', () => {
      const activate = async () => {}

      const plugin = PluginBuilder.create({
        name: 'partial-lifecycle-plugin',
        version: '1.0.0'
      })
        .lifecycle({ activate })
        .build()

      expect(plugin.activate).toBe(activate)
      expect(plugin.install).toBeUndefined()
      expect(plugin.deactivate).toBeUndefined()
    })
  })

  describe('chaining', () => {
    it('supports full method chaining', () => {
      const app = new Hono()
      const handler = async () => {}

      const plugin = PluginBuilder.create({
        name: 'chained-plugin',
        version: '1.0.0'
      })
        .metadata({ description: 'A chained plugin' })
        .addRoute('/api/test', app)
        .addSingleMiddleware('mw', handler)
        .addService('svc', {})
        .addAdminPage('/admin/test', 'Test', 'TestPage')
        .addMenuItem('Test', '/admin/test')
        .addHook('test:hook', handler)
        .lifecycle({ activate: async () => {} })
        .build()

      expect(plugin.name).toBe('chained-plugin')
      expect(plugin.routes).toHaveLength(1)
      expect(plugin.middleware).toHaveLength(1)
      expect(plugin.services).toHaveLength(1)
      expect(plugin.adminPages).toHaveLength(1)
      expect(plugin.menuItems).toHaveLength(1)
      expect(plugin.hooks).toHaveLength(1)
    })
  })
})

describe('PluginHelpers.createModelAPI', () => {
  it('creates a Hono app with REST endpoints', () => {
    const api = PluginHelpers.createModelAPI('User')

    expect(api).toBeInstanceOf(Hono)
  })

  it('uses custom base path when provided', () => {
    const api = PluginHelpers.createModelAPI('Post', {
      basePath: '/custom/posts'
    })

    expect(api).toBeInstanceOf(Hono)
  })

  it('handles GET list request', async () => {
    const api = PluginHelpers.createModelAPI('Article')

    const res = await api.request('/')
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.message).toBe('List Article items')
  })

  it('handles GET by ID request', async () => {
    const api = PluginHelpers.createModelAPI('Article')

    const res = await api.request('/123')
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.message).toBe('Get Article with ID: 123')
  })

  it('handles POST create request', async () => {
    const api = PluginHelpers.createModelAPI('Article')

    const res = await api.request('/', { method: 'POST' })
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.message).toBe('Create new Article')
  })

  it('handles PUT update request', async () => {
    const api = PluginHelpers.createModelAPI('Article')

    const res = await api.request('/456', { method: 'PUT' })
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.message).toBe('Update Article with ID: 456')
  })

  it('handles DELETE request', async () => {
    const api = PluginHelpers.createModelAPI('Article')

    const res = await api.request('/789', { method: 'DELETE' })
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.message).toBe('Delete Article with ID: 789')
  })
})

describe('PluginHelpers.createAdminInterface', () => {
  it('creates pages and menu items for a model', () => {
    const result = PluginHelpers.createAdminInterface('Product')

    expect(result.pages).toHaveLength(3)
    expect(result.menuItems).toHaveLength(1)
  })

  it('creates list page with correct path', () => {
    const result = PluginHelpers.createAdminInterface('Product')

    const listPage = result.pages.find(p => p.path === '/admin/product')
    expect(listPage).toBeDefined()
    expect(listPage!.title).toBe('Product List')
    expect(listPage!.component).toBe('ProductList')
  })

  it('creates new item page with correct path', () => {
    const result = PluginHelpers.createAdminInterface('Product')

    const newPage = result.pages.find(p => p.path === '/admin/product/new')
    expect(newPage).toBeDefined()
    expect(newPage!.title).toBe('New Product')
    expect(newPage!.component).toBe('ProductForm')
  })

  it('creates edit page with ID parameter', () => {
    const result = PluginHelpers.createAdminInterface('Product')

    const editPage = result.pages.find(p => p.path === '/admin/product/:id')
    expect(editPage).toBeDefined()
    expect(editPage!.title).toBe('Edit Product')
    expect(editPage!.component).toBe('ProductForm')
  })

  it('creates menu item with correct properties', () => {
    const result = PluginHelpers.createAdminInterface('Product')

    expect(result.menuItems[0].label).toBe('Product')
    expect(result.menuItems[0].path).toBe('/admin/product')
  })

  it('applies icon to pages and menu items', () => {
    const result = PluginHelpers.createAdminInterface('Product', {
      icon: 'shopping-cart'
    })

    expect(result.pages[0].icon).toBe('shopping-cart')
    expect(result.menuItems[0].icon).toBe('shopping-cart')
  })

  it('applies permissions to pages and menu items', () => {
    const result = PluginHelpers.createAdminInterface('Product', {
      permissions: ['admin', 'editor']
    })

    expect(result.pages[0].permissions).toEqual(['admin', 'editor'])
    expect(result.menuItems[0].permissions).toEqual(['admin', 'editor'])
  })

  it('capitalizes model name for display', () => {
    const result = PluginHelpers.createAdminInterface('category')

    expect(result.pages[0].title).toBe('Category List')
    expect(result.menuItems[0].label).toBe('Category')
  })
})

describe('PluginHelpers.createMigration', () => {
  it('creates basic table migration', () => {
    const migration = PluginHelpers.createMigration('users', [
      { name: 'id', type: 'TEXT', primaryKey: true },
      { name: 'name', type: 'TEXT' }
    ])

    expect(migration).toContain('CREATE TABLE IF NOT EXISTS users')
    expect(migration).toContain('id TEXT PRIMARY KEY')
    expect(migration).toContain('name TEXT NOT NULL')
    expect(migration).toContain('created_at INTEGER')
    expect(migration).toContain('updated_at INTEGER')
  })

  it('creates column with NOT NULL constraint', () => {
    const migration = PluginHelpers.createMigration('posts', [
      { name: 'id', type: 'TEXT', primaryKey: true },
      { name: 'title', type: 'TEXT' }
    ])

    expect(migration).toContain('title TEXT NOT NULL')
  })

  it('creates nullable column', () => {
    const migration = PluginHelpers.createMigration('posts', [
      { name: 'id', type: 'TEXT', primaryKey: true },
      { name: 'subtitle', type: 'TEXT', nullable: true }
    ])

    expect(migration).toContain('subtitle TEXT')
    expect(migration).not.toContain('subtitle TEXT NOT NULL')
  })

  it('creates column with UNIQUE constraint', () => {
    const migration = PluginHelpers.createMigration('users', [
      { name: 'id', type: 'TEXT', primaryKey: true },
      { name: 'email', type: 'TEXT', unique: true }
    ])

    expect(migration).toContain('email TEXT UNIQUE NOT NULL')
  })

  it('creates column with DEFAULT value', () => {
    const migration = PluginHelpers.createMigration('posts', [
      { name: 'id', type: 'TEXT', primaryKey: true },
      { name: 'status', type: 'TEXT', defaultValue: "'draft'" }
    ])

    expect(migration).toContain("status TEXT NOT NULL DEFAULT 'draft'")
  })

  it('creates INTEGER column', () => {
    const migration = PluginHelpers.createMigration('posts', [
      { name: 'id', type: 'TEXT', primaryKey: true },
      { name: 'view_count', type: 'INTEGER', defaultValue: '0' }
    ])

    expect(migration).toContain('view_count INTEGER NOT NULL DEFAULT 0')
  })

  it('creates REAL column', () => {
    const migration = PluginHelpers.createMigration('products', [
      { name: 'id', type: 'TEXT', primaryKey: true },
      { name: 'price', type: 'REAL' }
    ])

    expect(migration).toContain('price REAL NOT NULL')
  })

  it('creates BLOB column', () => {
    const migration = PluginHelpers.createMigration('files', [
      { name: 'id', type: 'TEXT', primaryKey: true },
      { name: 'data', type: 'BLOB', nullable: true }
    ])

    expect(migration).toContain('data BLOB')
  })

  it('creates updated_at trigger', () => {
    const migration = PluginHelpers.createMigration('posts', [
      { name: 'id', type: 'TEXT', primaryKey: true }
    ])

    expect(migration).toContain('CREATE TRIGGER IF NOT EXISTS posts_updated_at')
    expect(migration).toContain('AFTER UPDATE ON posts')
    expect(migration).toContain('updated_at = strftime')
  })
})

describe('PluginTemplates.contentType', () => {
  it('creates a content type plugin', () => {
    const plugin = PluginTemplates.contentType('BlogPost', [
      { name: 'title', type: 'string', label: 'Title', required: true },
      { name: 'content', type: 'string', label: 'Content' }
    ])

    expect(plugin.name).toBe('BlogPost-content-type')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.description).toBe('BlogPost content type plugin')
  })

  it('creates model with schema', () => {
    const plugin = PluginTemplates.contentType('Article', [
      { name: 'title', type: 'string', label: 'Title', required: true }
    ])

    expect(plugin.models).toHaveLength(1)
    expect(plugin.models![0].name).toBe('Article')
    expect(plugin.models![0].tableName).toBe('article')
    expect(plugin.models![0].extendsContent).toBe(true)
  })

  it('creates API routes', () => {
    const plugin = PluginTemplates.contentType('Product', [
      { name: 'name', type: 'string', label: 'Name' }
    ])

    expect(plugin.routes).toHaveLength(1)
    expect(plugin.routes![0].path).toBe('/api/product')
  })

  it('creates admin pages', () => {
    const plugin = PluginTemplates.contentType('Event', [
      { name: 'title', type: 'string', label: 'Title' }
    ])

    expect(plugin.adminPages).toHaveLength(3)
    expect(plugin.menuItems).toHaveLength(1)
  })
})

describe('PluginTemplates.analytics', () => {
  it('creates an analytics plugin', () => {
    const plugin = PluginTemplates.analytics('site')

    expect(plugin.name).toBe('site-analytics')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.description).toBe('site analytics plugin')
  })

  it('adds tracking middleware', () => {
    const plugin = PluginTemplates.analytics('app')

    expect(plugin.middleware).toHaveLength(1)
    expect(plugin.middleware![0].name).toBe('analytics-tracker')
    expect(plugin.middleware![0].global).toBe(true)
    expect(plugin.middleware![0].priority).toBe(1)
  })

  it('adds analytics API route', () => {
    const plugin = PluginTemplates.analytics('web')

    expect(plugin.routes).toHaveLength(1)
    expect(plugin.routes![0].path).toBe('/api/analytics')
  })

  it('adds dashboard when requested', () => {
    const plugin = PluginTemplates.analytics('site', {
      dashboard: true
    })

    expect(plugin.adminPages).toHaveLength(1)
    expect(plugin.adminPages![0].path).toBe('/analytics')
    expect(plugin.adminPages![0].title).toBe('Analytics Dashboard')
    expect(plugin.menuItems).toHaveLength(1)
    expect(plugin.menuItems![0].label).toBe('Analytics')
  })

  it('does not add dashboard when not requested', () => {
    const plugin = PluginTemplates.analytics('site')

    expect(plugin.adminPages).toHaveLength(0)
    expect(plugin.menuItems).toHaveLength(0)
  })

  it('does not add dashboard when dashboard is false', () => {
    const plugin = PluginTemplates.analytics('site', {
      dashboard: false
    })

    expect(plugin.adminPages).toHaveLength(0)
    expect(plugin.menuItems).toHaveLength(0)
  })
})
