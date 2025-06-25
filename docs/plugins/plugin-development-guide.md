# SonicJS Plugin Development Guide

This guide explains how to create plugins for SonicJS using the plugin framework and SDK.

## Table of Contents

1. [Plugin Architecture Overview](#plugin-architecture-overview)
2. [Getting Started](#getting-started)
3. [Plugin Builder SDK](#plugin-builder-sdk)
4. [Plugin Components](#plugin-components)
5. [Examples](#examples)
6. [Best Practices](#best-practices)
7. [Testing Plugins](#testing-plugins)
8. [Publishing Plugins](#publishing-plugins)

## Plugin Architecture Overview

SonicJS plugins are modular extensions that can add functionality to the core system. The plugin architecture is built around several key concepts:

- **Plugin Registry**: Manages plugin registration, activation, and lifecycle
- **Hook System**: Provides event-driven extensibility points
- **Plugin Manager**: Orchestrates plugin operations and dependencies
- **Plugin Builder SDK**: Provides a fluent API for creating plugins

### Plugin Lifecycle

1. **Install**: Plugin is registered and prepared for use
2. **Activate**: Plugin is loaded and its extensions are registered
3. **Configure**: Plugin configuration is applied
4. **Deactivate**: Plugin is stopped and extensions are removed
5. **Uninstall**: Plugin is completely removed from the system

## Getting Started

### Prerequisites

- TypeScript knowledge
- Understanding of Hono.js framework
- Familiarity with SonicJS architecture

### Creating Your First Plugin

```typescript
import { PluginBuilder } from '@/plugins/sdk/plugin-builder'

// Create a simple plugin
const myPlugin = PluginBuilder.create({
  name: 'my-first-plugin',
  version: '1.0.0',
  description: 'My first SonicJS plugin'
})
.metadata({
  author: { name: 'Your Name', email: 'you@example.com' },
  license: 'MIT'
})
.addRoute('/api/hello', new Hono().get('/', (c) => c.text('Hello from plugin!')))
.build()
```

### Plugin Structure

```
src/plugins/
├── my-plugin/
│   ├── index.ts          # Main plugin file
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── models/           # Database models
│   └── admin/            # Admin interface components
```

## Plugin Builder SDK

The Plugin Builder provides a fluent API for constructing plugins:

### Basic Plugin Creation

```typescript
const plugin = PluginBuilder.create({
  name: 'example-plugin',
  version: '1.0.0',
  description: 'Example plugin for demonstration'
})
```

### Adding Metadata

```typescript
plugin.metadata({
  author: {
    name: 'Plugin Author',
    email: 'author@example.com',
    url: 'https://example.com'
  },
  license: 'MIT',
  compatibility: '^0.1.0',
  dependencies: ['core-auth']
})
```

### Adding Routes

```typescript
import { Hono } from 'hono'

const apiRoutes = new Hono()
apiRoutes.get('/status', (c) => c.json({ status: 'ok' }))
apiRoutes.post('/action', async (c) => {
  const data = await c.req.json()
  return c.json({ result: 'processed', data })
})

plugin.addRoute('/api/my-plugin', apiRoutes, {
  description: 'Plugin API endpoints',
  requiresAuth: true,
  roles: ['admin']
})
```

### Adding Middleware

```typescript
plugin.addSingleMiddleware('request-logger', async (c, next) => {
  console.log(`${c.req.method} ${c.req.path}`)
  await next()
}, {
  description: 'Log all requests',
  global: true,
  priority: 5
})
```

### Adding Services

```typescript
plugin.addService('myService', {
  processData: (data: any) => {
    return { processed: true, data }
  },
  validateInput: (input: any) => {
    return input && typeof input === 'object'
  }
}, {
  description: 'Data processing service',
  singleton: true
})
```

### Adding Database Models

```typescript
import { z } from 'zod'
import { PluginHelpers } from '@/plugins/sdk/plugin-builder'

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  active: z.boolean().default(true)
})

const migration = PluginHelpers.createMigration('my_table', [
  { name: 'id', type: 'INTEGER', primaryKey: true },
  { name: 'name', type: 'TEXT', nullable: false },
  { name: 'email', type: 'TEXT', nullable: false, unique: true },
  { name: 'active', type: 'INTEGER', nullable: false, defaultValue: '1' }
])

plugin.addModel('MyModel', {
  tableName: 'my_table',
  schema,
  migrations: [migration]
})
```

### Adding Hooks

```typescript
plugin.addHook('my-plugin:data-process', async (data, context) => {
  console.log('Processing data:', data)
  return { ...data, processed: true }
}, {
  priority: 10,
  description: 'Process plugin data'
})

// Listen to system hooks
plugin.addHook('content:save', async (data, context) => {
  console.log('Content saved:', data.title)
  return data
})
```

### Adding Admin Interface

```typescript
plugin.addAdminPage('/my-plugin', 'My Plugin', 'MyPluginView', {
  description: 'Manage plugin settings',
  permissions: ['admin'],
  icon: 'cog'
})

plugin.addMenuItem('My Plugin', '/admin/my-plugin', {
  icon: 'puzzle',
  order: 50
})
```

## Plugin Components

### Routes

Routes define API endpoints that your plugin exposes:

```typescript
const routes = new Hono()

// GET endpoint
routes.get('/items', async (c) => {
  const items = await getItems()
  return c.json(items)
})

// POST endpoint with validation
routes.post('/items', async (c) => {
  const data = await c.req.json()
  const item = await createItem(data)
  return c.json(item, 201)
})

plugin.addRoute('/api/items', routes)
```

### Middleware

Middleware can be applied globally or to specific routes:

```typescript
// Global middleware
plugin.addSingleMiddleware('cors', async (c, next) => {
  await next()
  c.header('Access-Control-Allow-Origin', '*')
}, { global: true })

// Route-specific middleware
plugin.addSingleMiddleware('auth-check', async (c, next) => {
  const token = c.req.header('authorization')
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
}, { routes: ['/api/protected/*'] })
```

### Services

Services encapsulate business logic:

```typescript
class EmailService {
  async sendEmail(to: string, subject: string, body: string) {
    // Email sending logic
  }
  
  async validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}

plugin.addService('emailService', new EmailService(), {
  singleton: true
})
```

### Models

Models define database structures:

```typescript
import { PluginHelpers } from '@/plugins/sdk/plugin-builder'

const userSchema = PluginHelpers.createSchema([
  { name: 'email', type: 'string', validation: { email: true } },
  { name: 'firstName', type: 'string' },
  { name: 'lastName', type: 'string' },
  { name: 'active', type: 'boolean', optional: true }
])

plugin.addModel('PluginUser', {
  tableName: 'plugin_users',
  schema: userSchema,
  migrations: [migration]
})
```

### Hooks

Hooks provide event-driven extensibility:

```typescript
// Custom hook
plugin.addHook('user:register', async (userData, context) => {
  // Send welcome email
  await context.services.emailService.sendEmail(
    userData.email,
    'Welcome!',
    'Welcome to our platform!'
  )
  return userData
})

// System hook
plugin.addHook('request:start', async (data, context) => {
  // Track request start time
  data.startTime = Date.now()
  return data
})
```

## Examples

### Simple API Plugin

```typescript
import { PluginBuilder } from '@/plugins/sdk/plugin-builder'
import { Hono } from 'hono'

const weatherAPI = new Hono()
weatherAPI.get('/current', async (c) => {
  const city = c.req.query('city') || 'London'
  // Fetch weather data
  return c.json({ city, temperature: 22, condition: 'sunny' })
})

export const weatherPlugin = PluginBuilder.create({
  name: 'weather-plugin',
  version: '1.0.0',
  description: 'Weather information plugin'
})
.addRoute('/api/weather', weatherAPI)
.build()
```

### Content Type Plugin

```typescript
import { PluginTemplates } from '@/plugins/sdk/plugin-builder'

export const productPlugin = PluginTemplates.contentType('Product', [
  { name: 'name', type: 'string', label: 'Product Name', required: true },
  { name: 'price', type: 'number', label: 'Price', required: true },
  { name: 'description', type: 'string', label: 'Description' },
  { name: 'inStock', type: 'boolean', label: 'In Stock' }
])
```

### Analytics Plugin

```typescript
export const customAnalyticsPlugin = PluginTemplates.analytics('Custom', {
  endpoints: ['/api/products', '/api/orders'],
  dashboard: true
})
```

## Best Practices

### 1. Naming Conventions

- Use kebab-case for plugin names: `my-awesome-plugin`
- Prefix plugin-specific hooks: `my-plugin:event-name`
- Use descriptive service names: `emailService`, `paymentProcessor`

### 2. Error Handling

```typescript
plugin.addRoute('/api/risky', new Hono().post('/', async (c) => {
  try {
    const result = await riskyOperation()
    return c.json(result)
  } catch (error) {
    console.error('Plugin error:', error)
    return c.json({ error: 'Operation failed' }, 500)
  }
}))
```

### 3. Configuration

```typescript
plugin.lifecycle({
  configure: async (context, config) => {
    // Validate configuration
    if (!config.apiKey) {
      throw new Error('API key is required')
    }
    
    // Apply configuration
    context.config.apiKey = config.apiKey
  }
})
```

### 4. Dependencies

```typescript
plugin.metadata({
  dependencies: ['core-auth', 'core-media'],
  compatibility: '^0.1.0'
})
```

### 5. Security

- Always validate input data
- Use proper authentication checks
- Sanitize output data
- Follow principle of least privilege

## Testing Plugins

### Unit Testing

```typescript
import { describe, it, expect } from 'vitest'
import { myPlugin } from './my-plugin'

describe('MyPlugin', () => {
  it('should have correct metadata', () => {
    expect(myPlugin.name).toBe('my-plugin')
    expect(myPlugin.version).toBe('1.0.0')
  })
  
  it('should register routes', () => {
    expect(myPlugin.routes).toHaveLength(1)
    expect(myPlugin.routes[0].path).toBe('/api/my-plugin')
  })
})
```

### Integration Testing

```typescript
import { PluginManager } from '@/plugins/core/plugin-manager'
import { myPlugin } from './my-plugin'

describe('Plugin Integration', () => {
  let pluginManager: PluginManager
  
  beforeEach(() => {
    pluginManager = new PluginManager()
  })
  
  it('should install and activate plugin', async () => {
    await pluginManager.install(myPlugin)
    const status = pluginManager.getStatus('my-plugin')
    expect(status.installed).toBe(true)
  })
})
```

## Publishing Plugins

### 1. Prepare for Publishing

- Ensure all tests pass
- Update version in package.json
- Write comprehensive documentation
- Include example usage

### 2. Plugin Manifest

Create a `plugin.json` file:

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome plugin for SonicJS",
  "author": "Your Name",
  "license": "MIT",
  "compatibility": "^0.1.0",
  "keywords": ["sonicjs", "plugin", "awesome"],
  "repository": "https://github.com/you/my-awesome-plugin"
}
```

### 3. Distribution

Plugins can be distributed as:
- npm packages
- Git repositories
- Direct file uploads

### 4. Plugin Registry

Submit your plugin to the SonicJS plugin registry for easy discovery and installation.

## Troubleshooting

### Common Issues

1. **Plugin fails to load**: Check dependencies and compatibility
2. **Routes not working**: Verify route registration and middleware
3. **Database errors**: Check migration syntax and table names
4. **Permission denied**: Verify admin page permissions

### Debug Mode

Enable debug logging:

```typescript
plugin.lifecycle({
  activate: async (context) => {
    context.logger.debug('Plugin activated with config:', context.config)
  }
})
```

## Advanced Topics

### Custom Hook System

```typescript
// Register custom hooks
plugin.addHook('my-plugin:custom-event', async (data, context) => {
  // Custom logic
  return data
})

// Trigger hooks from your plugin
const result = await context.hooks.execute('my-plugin:custom-event', data)
```

### Plugin Communication

```typescript
// Listen to other plugin events
plugin.addHook('other-plugin:event', async (data, context) => {
  // React to other plugin events
  return data
})
```

### Resource Management

```typescript
plugin.lifecycle({
  activate: async (context) => {
    // Initialize resources
    context.resources = new Map()
  },
  
  deactivate: async (context) => {
    // Clean up resources
    context.resources?.clear()
  }
})
```

## Support

- [SonicJS Documentation](https://docs.sonicjs.com)
- [Plugin API Reference](https://docs.sonicjs.com/plugins/api)
- [Community Discord](https://discord.gg/sonicjs)
- [GitHub Issues](https://github.com/sonicjs/sonicjs/issues)