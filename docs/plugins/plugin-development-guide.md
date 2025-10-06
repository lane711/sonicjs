# SonicJS Plugin Development Guide

This comprehensive guide explains how to create plugins for SonicJS using the plugin framework and SDK. Learn from real-world examples including the complete Cache plugin implementation.

## Table of Contents

1. [Plugin System Architecture](#plugin-system-architecture)
2. [Core Concepts](#core-concepts)
3. [Getting Started](#getting-started)
4. [Plugin Manifest](#plugin-manifest)
5. [Creating Custom Plugins](#creating-custom-plugins)
6. [Plugin Lifecycle Hooks](#plugin-lifecycle-hooks)
7. [Hook System](#hook-system)
8. [Route Registration](#route-registration)
9. [Middleware Registration](#middleware-registration)
10. [Service Registration](#service-registration)
11. [Database Models](#database-models)
12. [Admin Interface](#admin-interface)
13. [Real-World Example: Cache Plugin](#real-world-example-cache-plugin)
14. [Testing Plugins](#testing-plugins)
15. [Best Practices](#best-practices)
16. [Advanced Topics](#advanced-topics)

## Plugin System Architecture

The SonicJS plugin system is built on several core components that work together to provide a robust, extensible architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Plugin Manager                        │
│  - Orchestrates plugin lifecycle                        │
│  - Manages dependencies                                 │
│  - Coordinates initialization                           │
└──────────────┬──────────────────────────────────────────┘
               │
        ┌──────┴──────┬──────────────┬──────────────┐
        │             │              │              │
┌───────▼────┐ ┌──────▼────┐ ┌──────▼────┐ ┌──────▼────┐
│  Plugin    │ │   Hook    │ │  Plugin   │ │ Plugin    │
│  Registry  │ │  System   │ │ Validator │ │  Context  │
└────────────┘ └───────────┘ └───────────┘ └───────────┘
```

### Core Components

#### 1. Plugin Manager
Located at `/src/plugins/core/plugin-manager.ts`

The Plugin Manager is the central orchestrator:
- Manages plugin installation, activation, and deactivation
- Resolves plugin dependencies
- Provides plugin context
- Registers plugin routes, middleware, and hooks
- Handles plugin lifecycle events

```typescript
export class PluginManager implements IPluginManager {
  public readonly registry: PluginRegistry
  public readonly hooks: HookSystem
  private validator: PluginValidator
  private context?: PluginContext
  private scopedHooks: Map<string, ScopedHookSystem> = new Map()
  private pluginRoutes: Map<string, Hono> = new Map()

  async install(plugin: Plugin, config?: PluginConfig): Promise<void>
  async uninstall(name: string): Promise<void>
  async initialize(context: PluginContext): Promise<void>
  async loadPlugins(configs: PluginConfig[]): Promise<void>
}
```

#### 2. Plugin Registry
Located at `/src/plugins/core/plugin-registry.ts`

Manages plugin registration and status:
- Tracks installed plugins
- Manages plugin configuration
- Handles plugin activation/deactivation
- Resolves dependency order
- Validates plugin requirements

```typescript
export class PluginRegistryImpl implements PluginRegistry {
  async register(plugin: Plugin): Promise<void>
  async unregister(name: string): Promise<void>
  async activate(name: string): Promise<void>
  async deactivate(name: string): Promise<void>
  resolveLoadOrder(): string[]
  getDependencyGraph(): Map<string, string[]>
}
```

#### 3. Hook System
Located at `/src/plugins/core/hook-system.ts`

Provides event-driven extensibility:
- Registers hook handlers
- Executes hooks with priority ordering
- Supports hook cancellation
- Prevents infinite recursion
- Provides scoped hooks per plugin

```typescript
export class HookSystemImpl implements HookSystem {
  register(hookName: string, handler: HookHandler, priority?: number): void
  async execute(hookName: string, data: any, context?: any): Promise<any>
  unregister(hookName: string, handler: HookHandler): void
  getHooks(hookName: string): PluginHook[]
  createScope(pluginName: string): ScopedHookSystem
}
```

#### 4. Plugin Validator
Located at `/src/plugins/core/plugin-validator.ts`

Ensures plugin integrity:
- Validates plugin structure
- Checks dependencies
- Verifies compatibility
- Reports validation errors and warnings

## Core Concepts

### Plugin Interface

Every plugin implements the `Plugin` interface defined in `/src/plugins/types.ts`:

```typescript
export interface Plugin {
  // Metadata
  name: string
  version: string
  description?: string
  author?: {
    name: string
    email?: string
    url?: string
  }
  dependencies?: string[]
  compatibility?: string
  license?: string

  // Extension Points
  routes?: PluginRoutes[]
  middleware?: PluginMiddleware[]
  models?: PluginModel[]
  services?: PluginService[]
  adminPages?: PluginAdminPage[]
  adminComponents?: PluginComponent[]
  menuItems?: PluginMenuItem[]
  hooks?: PluginHook[]

  // Lifecycle Hooks
  install?: (context: PluginContext) => Promise<void>
  uninstall?: (context: PluginContext) => Promise<void>
  activate?: (context: PluginContext) => Promise<void>
  deactivate?: (context: PluginContext) => Promise<void>
  configure?: (config: PluginConfig) => Promise<void>
}
```

### Plugin Context

The `PluginContext` provides plugins access to core SonicJS APIs:

```typescript
export interface PluginContext {
  db: D1Database          // Database instance
  kv: KVNamespace         // Key-value storage
  r2?: R2Bucket           // R2 storage bucket
  config: PluginConfig    // Plugin configuration
  services: {
    auth: AuthService
    content: ContentService
    media: MediaService
  }
  hooks: HookSystem       // Hook system for events
  logger: PluginLogger    // Logging utilities
}
```

### Standard Hooks

SonicJS defines standard hooks for common events:

```typescript
export const HOOKS = {
  // Application lifecycle
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_SHUTDOWN: 'app:shutdown',

  // Request lifecycle
  REQUEST_START: 'request:start',
  REQUEST_END: 'request:end',
  REQUEST_ERROR: 'request:error',

  // Authentication
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_REGISTER: 'auth:register',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',

  // Content lifecycle
  CONTENT_CREATE: 'content:create',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_SAVE: 'content:save',

  // Media lifecycle
  MEDIA_UPLOAD: 'media:upload',
  MEDIA_DELETE: 'media:delete',
  MEDIA_TRANSFORM: 'media:transform',

  // Plugin lifecycle
  PLUGIN_INSTALL: 'plugin:install',
  PLUGIN_UNINSTALL: 'plugin:uninstall',
  PLUGIN_ACTIVATE: 'plugin:activate',
  PLUGIN_DEACTIVATE: 'plugin:deactivate',

  // Admin interface
  ADMIN_MENU_RENDER: 'admin:menu:render',
  ADMIN_PAGE_RENDER: 'admin:page:render',

  // Database
  DB_MIGRATE: 'db:migrate',
  DB_SEED: 'db:seed',
} as const
```

## Getting Started

### Prerequisites

- TypeScript knowledge
- Understanding of Hono.js framework
- Familiarity with SonicJS architecture
- Node.js and npm installed

### Plugin Directory Structure

```
src/plugins/
├── your-plugin/
│   ├── index.ts              # Main plugin file
│   ├── manifest.json         # Plugin manifest
│   ├── routes.ts             # API routes
│   ├── services/             # Business logic
│   │   ├── service-a.ts
│   │   └── service-b.ts
│   ├── middleware/           # Custom middleware
│   ├── models/               # Database models
│   ├── migrations/           # Database migrations
│   ├── tests/                # Plugin tests
│   │   └── plugin.test.ts
│   └── README.md             # Plugin documentation
```

### Creating Your First Plugin

Create a new directory in `/src/plugins/` and add an `index.ts` file:

```typescript
import { PluginBuilder } from '../sdk/plugin-builder'
import { Hono } from 'hono'

// Create plugin using builder pattern
const plugin = PluginBuilder.create({
  name: 'my-first-plugin',
  version: '1.0.0',
  description: 'My first SonicJS plugin'
})

// Add metadata
plugin.metadata({
  author: {
    name: 'Your Name',
    email: 'you@example.com',
    url: 'https://yourwebsite.com'
  },
  license: 'MIT',
  compatibility: '^0.1.0'
})

// Add a simple route
const routes = new Hono()
routes.get('/hello', (c) => c.json({
  message: 'Hello from my plugin!'
}))

plugin.addRoute('/api/my-plugin', routes, {
  description: 'My plugin API endpoints'
})

// Add lifecycle hooks
plugin.lifecycle({
  activate: async (context) => {
    context.logger.info('Plugin activated!')
  },

  deactivate: async (context) => {
    context.logger.info('Plugin deactivated!')
  }
})

// Build and export
export default plugin.build()
```

## Plugin Manifest

The `manifest.json` file defines plugin metadata and configuration. Here's a complete example from the Cache plugin (`/src/plugins/cache/manifest.json`):

```json
{
  "id": "cache",
  "name": "Cache System",
  "version": "1.0.0-alpha.1",
  "description": "Three-tiered caching system with in-memory and KV storage. Provides automatic caching for content, users, media, and API responses with configurable TTL and invalidation patterns.",
  "author": "SonicJS",
  "homepage": "https://sonicjs.com/plugins/cache",
  "repository": "https://github.com/lane711/sonicjs-ai/tree/main/src/plugins/cache",
  "license": "MIT",
  "category": "performance",
  "tags": ["cache", "performance", "optimization", "kv", "memory"],
  "dependencies": [],
  "settings": {
    "memoryEnabled": {
      "type": "boolean",
      "label": "Enable In-Memory Cache",
      "description": "Fast tier-1 caching in memory (region-specific)",
      "default": true
    },
    "kvEnabled": {
      "type": "boolean",
      "label": "Enable KV Cache",
      "description": "Tier-2 caching in Cloudflare KV (global, persistent)",
      "default": false
    },
    "defaultTTL": {
      "type": "number",
      "label": "Default TTL (seconds)",
      "description": "Default time-to-live for cache entries",
      "default": 3600
    },
    "maxMemorySize": {
      "type": "number",
      "label": "Max Memory Size (MB)",
      "description": "Maximum size of in-memory cache in megabytes",
      "default": 50
    }
  },
  "hooks": {
    "onActivate": "activate",
    "onDeactivate": "deactivate",
    "onConfigure": "configure"
  },
  "routes": [
    {
      "path": "/admin/cache/stats",
      "method": "GET",
      "handler": "getStats",
      "description": "Get cache statistics"
    },
    {
      "path": "/admin/cache/clear",
      "method": "POST",
      "handler": "clearCache",
      "description": "Clear all cache entries"
    },
    {
      "path": "/admin/cache/invalidate",
      "method": "POST",
      "handler": "invalidatePattern",
      "description": "Invalidate cache entries matching pattern"
    }
  ],
  "permissions": {
    "cache.view": "View cache statistics",
    "cache.clear": "Clear cache entries",
    "cache.invalidate": "Invalidate cache patterns"
  }
}
```

### Manifest Schema

```typescript
interface PluginManifest {
  id: string                    // Unique plugin identifier
  name: string                  // Display name
  version: string               // Semantic version
  description: string           // Detailed description
  author: string                // Author name or organization
  homepage?: string             // Plugin homepage URL
  repository?: string           // Source repository URL
  license: string               // License identifier
  category?: string             // Plugin category
  tags?: string[]               // Searchable tags
  dependencies?: string[]       // Required plugin dependencies
  settings?: {                  // Plugin settings schema
    [key: string]: {
      type: 'boolean' | 'number' | 'string' | 'object'
      label: string
      description: string
      default: any
    }
  }
  hooks?: {                     // Lifecycle hook mapping
    [key: string]: string
  }
  routes?: Array<{              // Route definitions
    path: string
    method: string
    handler: string
    description: string
  }>
  permissions?: {               // Permission definitions
    [key: string]: string
  }
}
```

## Creating Custom Plugins

### Step-by-Step Example: Weather Plugin

Let's create a complete weather plugin from scratch:

#### Step 1: Create Plugin Structure

```bash
mkdir -p src/plugins/weather/{services,routes,tests}
```

#### Step 2: Create Manifest

File: `/src/plugins/weather/manifest.json`

```json
{
  "id": "weather",
  "name": "Weather Service",
  "version": "1.0.0",
  "description": "Provides weather information and forecasts",
  "author": "Your Name",
  "license": "MIT",
  "category": "utility",
  "tags": ["weather", "api", "forecast"],
  "dependencies": [],
  "settings": {
    "apiKey": {
      "type": "string",
      "label": "Weather API Key",
      "description": "API key for weather service",
      "default": ""
    },
    "defaultCity": {
      "type": "string",
      "label": "Default City",
      "description": "Default city for weather queries",
      "default": "London"
    },
    "cacheEnabled": {
      "type": "boolean",
      "label": "Enable Caching",
      "description": "Cache weather data to reduce API calls",
      "default": true
    },
    "cacheTTL": {
      "type": "number",
      "label": "Cache TTL (seconds)",
      "description": "How long to cache weather data",
      "default": 300
    }
  }
}
```

#### Step 3: Create Weather Service

File: `/src/plugins/weather/services/weather-service.ts`

```typescript
/**
 * Weather Service
 * Fetches and caches weather data
 */

export interface WeatherData {
  city: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  forecast: Array<{
    date: string
    high: number
    low: number
    condition: string
  }>
}

export class WeatherService {
  private apiKey: string
  private cache?: any

  constructor(apiKey: string, cache?: any) {
    this.apiKey = apiKey
    this.cache = cache
  }

  /**
   * Get current weather for a city
   */
  async getCurrentWeather(city: string): Promise<WeatherData> {
    // Check cache first
    if (this.cache) {
      const cacheKey = `weather:current:${city}`
      const cached = await this.cache.get(cacheKey)
      if (cached) {
        console.log(`Cache hit for ${city}`)
        return cached
      }
    }

    // Fetch from API (simulated)
    const weather: WeatherData = {
      city,
      temperature: 22,
      condition: 'Partly cloudy',
      humidity: 65,
      windSpeed: 12,
      forecast: [
        { date: '2025-01-07', high: 24, low: 18, condition: 'Sunny' },
        { date: '2025-01-08', high: 23, low: 17, condition: 'Cloudy' },
        { date: '2025-01-09', high: 25, low: 19, condition: 'Sunny' }
      ]
    }

    // Store in cache
    if (this.cache) {
      const cacheKey = `weather:current:${city}`
      await this.cache.set(cacheKey, weather)
    }

    return weather
  }

  /**
   * Get weather forecast
   */
  async getForecast(city: string, days: number = 7): Promise<WeatherData['forecast']> {
    const weather = await this.getCurrentWeather(city)
    return weather.forecast.slice(0, days)
  }

  /**
   * Search cities
   */
  async searchCities(query: string): Promise<string[]> {
    // Simulated city search
    const cities = ['London', 'Paris', 'New York', 'Tokyo', 'Sydney']
    return cities.filter(city =>
      city.toLowerCase().includes(query.toLowerCase())
    )
  }
}
```

#### Step 4: Create Routes

File: `/src/plugins/weather/routes.ts`

```typescript
import { Hono } from 'hono'
import type { Context } from 'hono'
import { WeatherService } from './services/weather-service.js'

const app = new Hono()

// Middleware to inject weather service
app.use('*', async (c, next) => {
  // Get service from plugin context (would be set during plugin activation)
  const weatherService = c.get('weatherService')
  if (!weatherService) {
    return c.json({ error: 'Weather service not initialized' }, 500)
  }
  await next()
})

/**
 * GET /api/weather/current?city=London
 * Get current weather for a city
 */
app.get('/current', async (c: Context) => {
  const city = c.req.query('city')

  if (!city) {
    return c.json({
      success: false,
      error: 'City parameter is required'
    }, 400)
  }

  try {
    const weatherService = c.get('weatherService') as WeatherService
    const weather = await weatherService.getCurrentWeather(city)

    return c.json({
      success: true,
      data: weather,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch weather data'
    }, 500)
  }
})

/**
 * GET /api/weather/forecast?city=London&days=7
 * Get weather forecast
 */
app.get('/forecast', async (c: Context) => {
  const city = c.req.query('city')
  const days = parseInt(c.req.query('days') || '7')

  if (!city) {
    return c.json({
      success: false,
      error: 'City parameter is required'
    }, 400)
  }

  try {
    const weatherService = c.get('weatherService') as WeatherService
    const forecast = await weatherService.getForecast(city, days)

    return c.json({
      success: true,
      data: {
        city,
        forecast
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Forecast API error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch forecast data'
    }, 500)
  }
})

/**
 * GET /api/weather/search?q=Lon
 * Search for cities
 */
app.get('/search', async (c: Context) => {
  const query = c.req.query('q')

  if (!query || query.length < 2) {
    return c.json({
      success: false,
      error: 'Query must be at least 2 characters'
    }, 400)
  }

  try {
    const weatherService = c.get('weatherService') as WeatherService
    const cities = await weatherService.searchCities(query)

    return c.json({
      success: true,
      data: cities,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('City search error:', error)
    return c.json({
      success: false,
      error: 'Failed to search cities'
    }, 500)
  }
})

export default app
```

#### Step 5: Create Main Plugin File

File: `/src/plugins/weather/index.ts`

```typescript
import { PluginBuilder } from '../sdk/plugin-builder'
import { PluginContext } from '../types'
import weatherRoutes from './routes.js'
import { WeatherService } from './services/weather-service.js'
import { getCacheService } from '../cache/index.js'

// Create plugin
const plugin = PluginBuilder.create({
  name: 'weather',
  version: '1.0.0',
  description: 'Weather information and forecast plugin'
})

// Add metadata
plugin.metadata({
  author: {
    name: 'Your Name',
    email: 'you@example.com'
  },
  license: 'MIT',
  compatibility: '^0.1.0',
  dependencies: [] // Optional: add 'cache' if using cache plugin
})

// Store service instance
let weatherService: WeatherService | null = null

// Add routes
plugin.addRoute('/api/weather', weatherRoutes, {
  description: 'Weather API endpoints',
  priority: 5
})

// Add admin page
plugin.addAdminPage(
  '/weather',
  'Weather',
  'WeatherDashboard',
  {
    description: 'View weather information',
    permissions: ['admin'],
    icon: 'cloud'
  }
)

// Add menu item
plugin.addMenuItem('Weather', '/admin/weather', {
  icon: 'cloud',
  order: 50
})

// Add lifecycle hooks
plugin.lifecycle({
  activate: async (context: PluginContext) => {
    console.log('Activating weather plugin...')

    const { apiKey, cacheEnabled } = context.config

    // Validate API key
    if (!apiKey) {
      throw new Error('Weather API key is required')
    }

    // Get cache service if enabled
    let cache = null
    if (cacheEnabled) {
      try {
        cache = getCacheService({
          namespace: 'weather',
          ttl: context.config.cacheTTL || 300,
          memoryEnabled: true,
          kvEnabled: false,
          invalidateOn: [],
          version: 'v1'
        })
      } catch (error) {
        console.warn('Cache service not available, proceeding without cache')
      }
    }

    // Initialize weather service
    weatherService = new WeatherService(apiKey, cache)

    console.log('Weather plugin activated successfully')
  },

  deactivate: async (context: PluginContext) => {
    console.log('Deactivating weather plugin...')
    weatherService = null
    console.log('Weather plugin deactivated')
  },

  configure: async (config: any) => {
    console.log('Configuring weather plugin...', config)

    // Reconfigure service if active
    if (weatherService && config.apiKey) {
      const cache = config.cacheEnabled ? getCacheService({
        namespace: 'weather',
        ttl: config.cacheTTL || 300,
        memoryEnabled: true,
        kvEnabled: false,
        invalidateOn: [],
        version: 'v1'
      }) : null

      weatherService = new WeatherService(config.apiKey, cache)
    }
  }
})

// Add hook to inject service into request context
plugin.addHook('request:start', async (data, context) => {
  if (weatherService) {
    data.context.set('weatherService', weatherService)
  }
  return data
}, {
  priority: 5,
  description: 'Inject weather service into request context'
})

// Export plugin
export default plugin.build()
```

## Plugin Lifecycle Hooks

Plugins have five lifecycle stages with corresponding hooks:

### 1. Install

Called when the plugin is first installed. Use this to:
- Create database tables
- Initialize default configuration
- Set up initial data

```typescript
plugin.lifecycle({
  install: async (context: PluginContext) => {
    console.log('Installing plugin...')

    // Create database tables
    await context.db.exec(`
      CREATE TABLE IF NOT EXISTS plugin_data (
        id INTEGER PRIMARY KEY,
        key TEXT NOT NULL,
        value TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `)

    // Initialize configuration
    await context.db.exec(`
      INSERT INTO plugin_data (key, value) VALUES
      ('version', '1.0.0'),
      ('installed_at', ${Date.now()})
    `)

    console.log('Plugin installed successfully')
  }
})
```

### 2. Activate

Called when the plugin is activated. Use this to:
- Initialize services
- Register event listeners
- Start background tasks

```typescript
plugin.lifecycle({
  activate: async (context: PluginContext) => {
    console.log('Activating plugin...')

    // Initialize services
    const config = context.config
    const service = new MyService(config)

    // Store in context for later use
    context.services.myService = service

    // Register event listeners
    context.hooks.register('content:save', async (data) => {
      await service.handleContentSave(data)
      return data
    })

    console.log('Plugin activated')
  }
})
```

### 3. Configure

Called when plugin configuration changes. Use this to:
- Update service settings
- Reconfigure connections
- Apply new settings

```typescript
plugin.lifecycle({
  configure: async (config: PluginConfig) => {
    console.log('Configuring plugin...', config)

    // Validate configuration
    if (config.apiKey && config.apiKey.length < 10) {
      throw new Error('Invalid API key')
    }

    // Apply configuration changes
    if (myService) {
      myService.updateConfig(config)
    }

    console.log('Plugin configured')
  }
})
```

### 4. Deactivate

Called when the plugin is deactivated. Use this to:
- Stop background tasks
- Unregister event listeners
- Clean up resources

```typescript
plugin.lifecycle({
  deactivate: async (context: PluginContext) => {
    console.log('Deactivating plugin...')

    // Stop background tasks
    if (backgroundTask) {
      backgroundTask.stop()
    }

    // Clean up resources
    if (context.services.myService) {
      await context.services.myService.cleanup()
      delete context.services.myService
    }

    console.log('Plugin deactivated')
  }
})
```

### 5. Uninstall

Called when the plugin is removed. Use this to:
- Remove database tables
- Delete plugin data
- Clean up all traces

```typescript
plugin.lifecycle({
  uninstall: async (context: PluginContext) => {
    console.log('Uninstalling plugin...')

    // Remove database tables
    await context.db.exec('DROP TABLE IF EXISTS plugin_data')

    // Delete plugin files/configuration
    await context.kv.delete('plugin:config')

    console.log('Plugin uninstalled')
  }
})
```

### Complete Lifecycle Example

Here's a complete example from the Cache plugin:

```typescript
export class CachePlugin {
  async activate(context: PluginContext): Promise<void> {
    const settings = context.config || {}

    console.log('Cache plugin activated', {
      memoryEnabled: settings.memoryEnabled ?? true,
      kvEnabled: settings.kvEnabled ?? false,
      defaultTTL: settings.defaultTTL ?? 3600
    })

    // Initialize default cache services
    for (const [namespace, config] of Object.entries(CACHE_CONFIGS)) {
      getCacheService({
        ...config,
        memoryEnabled: settings.memoryEnabled ?? config.memoryEnabled,
        kvEnabled: settings.kvEnabled ?? config.kvEnabled,
        ttl: settings.defaultTTL ?? config.ttl
      })
    }

    // Setup event-based cache invalidation
    setupCacheInvalidation()
  }

  async deactivate(): Promise<void> {
    console.log('Cache plugin deactivated - clearing all caches')
    await clearAllCaches()
  }

  async configure(settings: Record<string, any>): Promise<void> {
    console.log('Cache plugin configured', settings)

    // Reconfigure all cache instances with new settings
    for (const [namespace, config] of Object.entries(CACHE_CONFIGS)) {
      getCacheService({
        ...config,
        memoryEnabled: settings.memoryEnabled ?? config.memoryEnabled,
        kvEnabled: settings.kvEnabled ?? config.kvEnabled,
        ttl: settings.defaultTTL ?? config.ttl
      })
    }
  }
}
```

## Hook System

The hook system (`/src/plugins/core/hook-system.ts`) provides event-driven extensibility. Plugins can register hooks to listen for events and modify data flow.

### Hook Priority

Hooks execute in priority order (lower number = earlier execution):
- Priority 1-5: Critical hooks that must run first
- Priority 6-10: Normal hooks (default is 10)
- Priority 11+: Lower priority hooks

### Registering Hooks

```typescript
// Register a hook with default priority (10)
plugin.addHook('content:save', async (data, context) => {
  console.log('Content being saved:', data.title)

  // Modify the data
  data.processedAt = Date.now()

  // Return modified data
  return data
})

// Register a hook with custom priority
plugin.addHook('content:save', async (data, context) => {
  // This runs before the above hook
  data.validated = true
  return data
}, {
  priority: 5,
  description: 'Validate content before saving'
})
```

### Hook Context

Hooks receive a context object:

```typescript
export interface HookContext {
  plugin: string              // Plugin that triggered the hook
  context: PluginContext      // Full plugin context
  cancel?: () => void         // Cancel further hook execution
}

plugin.addHook('content:delete', async (data, context) => {
  // Check if content can be deleted
  if (data.protected) {
    console.warn('Cannot delete protected content')
    context.cancel?.()  // Cancel further hooks and operation
  }
  return data
})
```

### Executing Hooks

Plugins can trigger their own hooks:

```typescript
// From hook-system.ts
async execute(hookName: string, data: any, context?: any): Promise<any> {
  const hooks = this.hooks.get(hookName)
  if (!hooks || hooks.length === 0) {
    return data
  }

  // Prevent infinite recursion
  if (this.executing.has(hookName)) {
    console.warn(`Hook recursion detected for: ${hookName}`)
    return data
  }

  this.executing.add(hookName)

  try {
    let result = data
    let cancelled = false

    const hookContext: HookContext = {
      plugin: '',
      context: context || {},
      cancel: () => { cancelled = true }
    }

    for (const hook of hooks) {
      if (cancelled) {
        console.debug(`Hook execution cancelled: ${hookName}`)
        break
      }

      try {
        console.debug(`Executing hook: ${hookName} (priority: ${hook.priority})`)
        result = await hook.handler(result, hookContext)
      } catch (error) {
        console.error(`Hook execution failed: ${hookName}`, error)
        // Continue executing other hooks unless critical error
        if (error instanceof Error && error.message.includes('CRITICAL')) {
          throw error
        }
      }
    }

    return result
  } finally {
    this.executing.delete(hookName)
  }
}
```

### Scoped Hooks

Each plugin gets its own scoped hook system:

```typescript
// From hook-system.ts
export class ScopedHookSystem {
  private registeredHooks: { hookName: string; handler: HookHandler }[] = []

  constructor(
    private parent: HookSystemImpl,
    private pluginName: string
  ) {}

  register(hookName: string, handler: HookHandler, priority?: number): void {
    this.parent.register(hookName, handler, priority)
    this.registeredHooks.push({ hookName, handler })
  }

  async execute(hookName: string, data: any, context?: any): Promise<any> {
    return this.parent.execute(hookName, data, context)
  }

  unregisterAll(): void {
    for (const { hookName, handler } of this.registeredHooks) {
      this.parent.unregister(hookName, handler)
    }
    this.registeredHooks.length = 0
  }
}
```

### Hook Utilities

The hook system provides utility functions:

```typescript
// Create namespaced hook name
const hookName = HookUtils.createHookName('my-plugin', 'data-processed')
// Result: 'my-plugin:data-processed'

// Parse hook name
const { namespace, event } = HookUtils.parseHookName('my-plugin:data-processed')
// namespace: 'my-plugin', event: 'data-processed'

// Create debounced hook handler
const debouncedHandler = HookUtils.debounce(
  async (data, context) => {
    console.log('Processing data:', data)
    return data
  },
  1000 // 1 second delay
)

// Create throttled hook handler
const throttledHandler = HookUtils.throttle(
  async (data, context) => {
    console.log('Processing data:', data)
    return data
  },
  5000 // Maximum once per 5 seconds
)
```

### Real-World Hook Examples

From the Auth plugin (`/src/plugins/core-plugins/auth-plugin.ts`):

```typescript
// Track user login
builder.addHook('auth:login', async (data: any) => {
  console.info(`User login attempt: ${data.email}`)
  return data
}, {
  priority: 10,
  description: 'Handle user login events'
})

// Track authentication status
builder.addHook(HOOKS.REQUEST_START, async (data: any) => {
  const authHeader = data.request?.headers?.authorization
  if (authHeader) {
    data.authenticated = true
  }
  return data
}, {
  priority: 5,
  description: 'Track authentication status on requests'
})
```

From the Media plugin (`/src/plugins/core-plugins/media-plugin.ts`):

```typescript
// Auto-generate thumbnails
builder.addHook('media:upload', async (data: any, context: any) => {
  console.info(`Media upload event: ${data.filename}`)

  if (data.mimeType?.startsWith('image/')) {
    data.generateThumbnail = true
  }

  return data
}, {
  priority: 10,
  description: 'Handle media upload events'
})

// Track media usage in content
builder.addHook(HOOKS.CONTENT_SAVE, async (data: any, context: any) => {
  const content = data.content || ''
  const mediaReferences = content.match(/\/media\/[a-zA-Z0-9-]+/g) || []

  if (mediaReferences.length > 0) {
    data.mediaReferences = mediaReferences
    console.debug(`Content references ${mediaReferences.length} media files`)
  }

  return data
}, {
  priority: 8,
  description: 'Track media usage in content'
})
```

## Route Registration

Routes define API endpoints that your plugin exposes. SonicJS uses Hono.js for routing.

### Basic Route Registration

```typescript
import { Hono } from 'hono'

// Create a Hono app for your routes
const routes = new Hono()

// GET endpoint
routes.get('/items', async (c) => {
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ]
  return c.json({
    success: true,
    data: items
  })
})

// POST endpoint
routes.post('/items', async (c) => {
  const body = await c.req.json()

  // Validate input
  if (!body.name) {
    return c.json({
      success: false,
      error: 'Name is required'
    }, 400)
  }

  const item = {
    id: Date.now(),
    name: body.name,
    createdAt: new Date().toISOString()
  }

  return c.json({
    success: true,
    data: item
  }, 201)
})

// Register routes with your plugin
plugin.addRoute('/api/my-plugin', routes, {
  description: 'My plugin API endpoints',
  requiresAuth: false,
  priority: 10
})
```

### Advanced Route Examples

From the Cache plugin routes (`/src/plugins/cache/routes.ts`):

```typescript
import { Hono } from 'hono'
import type { Context } from 'hono'
import { getAllCacheStats, clearAllCaches, getCacheService } from './services/cache.js'
import { CACHE_CONFIGS } from './services/cache-config.js'

const app = new Hono()

/**
 * GET /admin/cache/stats
 * Detailed statistics for all namespaces
 */
app.get('/stats', async (c: Context) => {
  const stats = getAllCacheStats()

  return c.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /admin/cache/stats/:namespace
 * Statistics for a specific namespace
 */
app.get('/stats/:namespace', async (c: Context) => {
  const namespace = c.req.param('namespace')
  const config = CACHE_CONFIGS[namespace]

  if (!config) {
    return c.json({
      success: false,
      error: `Unknown namespace: ${namespace}`
    }, 404)
  }

  const cache = getCacheService(config)
  const stats = cache.getStats()

  return c.json({
    success: true,
    data: {
      namespace,
      config,
      stats
    },
    timestamp: new Date().toISOString()
  })
})

/**
 * POST /admin/cache/clear
 * Clear all cache entries
 */
app.post('/clear', async (c: Context) => {
  await clearAllCaches()

  return c.json({
    success: true,
    message: 'All cache entries cleared',
    timestamp: new Date().toISOString()
  })
})

/**
 * POST /admin/cache/invalidate
 * Invalidate cache entries matching a pattern
 */
app.post('/invalidate', async (c: Context) => {
  const body = await c.req.json()
  const { pattern, namespace } = body

  if (!pattern) {
    return c.json({
      success: false,
      error: 'Pattern is required'
    }, 400)
  }

  let totalInvalidated = 0

  if (namespace) {
    const config = CACHE_CONFIGS[namespace]
    if (!config) {
      return c.json({
        success: false,
        error: `Unknown namespace: ${namespace}`
      }, 404)
    }

    const cache = getCacheService(config)
    totalInvalidated = await cache.invalidate(pattern)
  } else {
    // Invalidate from all namespaces
    for (const config of Object.values(CACHE_CONFIGS)) {
      const cache = getCacheService(config)
      totalInvalidated += await cache.invalidate(pattern)
    }
  }

  return c.json({
    success: true,
    invalidated: totalInvalidated,
    pattern,
    namespace: namespace || 'all',
    timestamp: new Date().toISOString()
  })
})

export default app
```

### Route Groups

Organize related routes:

```typescript
const api = new Hono()

// User routes
const users = new Hono()
users.get('/', async (c) => c.json({ users: [] }))
users.post('/', async (c) => c.json({ created: true }))
users.get('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ user: { id } })
})

// Mount user routes
api.route('/users', users)

// Posts routes
const posts = new Hono()
posts.get('/', async (c) => c.json({ posts: [] }))
posts.post('/', async (c) => c.json({ created: true }))

// Mount posts routes
api.route('/posts', posts)

// Register with plugin
plugin.addRoute('/api/my-plugin', api)
```

### Query Parameters

```typescript
routes.get('/search', async (c) => {
  const query = c.req.query('q')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const sortBy = c.req.query('sort') || 'name'

  // Validate
  if (!query || query.length < 2) {
    return c.json({
      error: 'Query must be at least 2 characters'
    }, 400)
  }

  const results = await searchItems(query, { page, limit, sortBy })

  return c.json({
    success: true,
    data: results,
    pagination: {
      page,
      limit,
      total: results.length
    }
  })
})
```

### Request Body Validation

```typescript
import { z } from 'zod'

// Define schema
const createItemSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  tags: z.array(z.string()).optional()
})

routes.post('/items', async (c) => {
  try {
    const body = await c.req.json()

    // Validate
    const validated = createItemSchema.parse(body)

    // Create item
    const item = {
      id: Date.now(),
      ...validated,
      createdAt: new Date().toISOString()
    }

    return c.json({
      success: true,
      data: item
    }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, 400)
    }

    throw error
  }
})
```

## Middleware Registration

Middleware allows you to intercept and modify requests and responses.

### Single Middleware

```typescript
// Global middleware (runs on all requests)
plugin.addSingleMiddleware('request-logger', async (c, next) => {
  const start = Date.now()
  const path = c.req.path

  await next()

  const duration = Date.now() - start
  console.log(`${c.req.method} ${path} - ${duration}ms`)
}, {
  description: 'Log all requests with duration',
  global: true,
  priority: 1
})

// Route-specific middleware
plugin.addSingleMiddleware('auth-check', async (c, next) => {
  const token = c.req.header('authorization')

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // Verify token
  const user = await verifyToken(token)
  if (!user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  // Add user to context
  c.set('user', user)

  await next()
}, {
  description: 'Verify authentication token',
  routes: ['/api/protected/*'],
  priority: 5
})
```

### Middleware Examples from Auth Plugin

```typescript
// Session management middleware
builder.addSingleMiddleware('auth-session', async (c: any, next: any) => {
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

// Rate limiting middleware
builder.addSingleMiddleware('auth-rate-limit', async (c: any, next: any) => {
  const path = c.req.path
  if (path.startsWith('/api/auth/')) {
    const clientIP = c.req.header('CF-Connecting-IP') || 'unknown'
    console.debug(`Auth rate limit check for IP: ${clientIP}`)
    // Rate limiting logic would go here
  }
  await next()
}, {
  description: 'Rate limiting for authentication endpoints',
  routes: ['/api/auth/*'],
  priority: 3
})
```

### Error Handling Middleware

```typescript
plugin.addSingleMiddleware('error-handler', async (c, next) => {
  try {
    await next()
  } catch (error) {
    console.error('Request error:', error)

    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = error.status || 500

    return c.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, status)
  }
}, {
  description: 'Handle errors from route handlers',
  global: true,
  priority: 0  // Run first
})
```

### CORS Middleware

```typescript
plugin.addSingleMiddleware('cors', async (c, next) => {
  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    })
  }

  await next()

  // Add CORS headers to response
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}, {
  description: 'Enable CORS for API endpoints',
  global: true,
  priority: 2
})
```

## Service Registration

Services encapsulate business logic and can be shared across your plugin.

### Basic Service

```typescript
// Define service
class EmailService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`Sending email to ${to}: ${subject}`)
    // Email sending logic here
    return true
  }

  async validateEmail(email: string): Promise<boolean> {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }
}

// Register service
plugin.addService('emailService', new EmailService('api-key-here'), {
  description: 'Email sending and validation service',
  singleton: true
})
```

### Service with Dependencies

```typescript
class NotificationService {
  constructor(
    private emailService: EmailService,
    private smsService: SMSService
  ) {}

  async notify(userId: string, message: string, channels: string[]): Promise<void> {
    for (const channel of channels) {
      if (channel === 'email') {
        const user = await getUser(userId)
        await this.emailService.sendEmail(user.email, 'Notification', message)
      } else if (channel === 'sms') {
        const user = await getUser(userId)
        await this.smsService.sendSMS(user.phone, message)
      }
    }
  }
}

plugin.addService('notificationService', new NotificationService(
  emailService,
  smsService
), {
  description: 'Multi-channel notification service',
  dependencies: ['emailService', 'smsService'],
  singleton: true
})
```

### Service Examples from Plugins

From the Auth plugin:

```typescript
builder.addService('authService', {
  validateToken: (_token: string) => {
    return { valid: true, userId: 1 }
  },

  generateToken: (userId: number) => {
    return `token-${userId}-${Date.now()}`
  },

  hashPassword: (password: string) => {
    return `hashed-${password}`
  },

  verifyPassword: (password: string, hash: string) => {
    return hash === `hashed-${password}`
  }
}, {
  description: 'Core authentication service',
  singleton: true
})
```

From the Media plugin:

```typescript
builder.addService('mediaService', {
  uploadFile: async (file: File, options?: any) => {
    return {
      id: `media-${Date.now()}`,
      url: `/media/${file.name}`,
      size: file.size,
      type: file.type
    }
  },

  deleteFile: async (id: string) => {
    console.info(`Deleting media file: ${id}`)
    return true
  },

  processImage: async (id: string, operations: any[]) => {
    console.info(`Processing image ${id} with operations:`, operations)
    return { jobId: `job-${id}-${Date.now()}` }
  },

  getMetadata: async (id: string) => {
    return {
      width: 1920,
      height: 1080,
      format: 'JPEG',
      size: 1024000
    }
  }
}, {
  description: 'Core media processing service',
  singleton: true
})
```

## Database Models

Define database structures for your plugin using Zod schemas and migrations.

### Basic Model

```typescript
import { z } from 'zod'
import { PluginHelpers } from '../sdk/plugin-builder'

// Define Zod schema
const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  active: z.boolean().default(true),
  metadata: z.record(z.any()).optional()
})

// Create migration
const userMigration = PluginHelpers.createMigration('plugin_users', [
  { name: 'id', type: 'INTEGER', primaryKey: true },
  { name: 'email', type: 'TEXT', nullable: false, unique: true },
  { name: 'first_name', type: 'TEXT', nullable: false },
  { name: 'last_name', type: 'TEXT', nullable: false },
  { name: 'active', type: 'INTEGER', nullable: false, defaultValue: '1' },
  { name: 'metadata', type: 'TEXT', nullable: true },
  { name: 'created_at', type: 'INTEGER', nullable: false, defaultValue: "(strftime('%s', 'now'))" },
  { name: 'updated_at', type: 'INTEGER', nullable: true }
])

// Register model
plugin.addModel('PluginUser', {
  tableName: 'plugin_users',
  schema: userSchema,
  migrations: [userMigration]
})
```

### Model with Relationships

```typescript
// Product model
const productSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.number(),
  tags: z.array(z.string()).optional()
})

const productMigration = PluginHelpers.createMigration('products', [
  { name: 'id', type: 'INTEGER', primaryKey: true },
  { name: 'name', type: 'TEXT', nullable: false },
  { name: 'description', type: 'TEXT', nullable: true },
  { name: 'price', type: 'REAL', nullable: false },
  { name: 'category_id', type: 'INTEGER', nullable: false },
  { name: 'tags', type: 'TEXT', nullable: true },
  { name: 'created_at', type: 'INTEGER', nullable: false }
])

plugin.addModel('Product', {
  tableName: 'products',
  schema: productSchema,
  migrations: [productMigration],
  relationships: [
    {
      type: 'oneToMany',
      target: 'Category',
      foreignKey: 'category_id'
    }
  ]
})
```

### Real-World Model Example

From the Media plugin:

```typescript
const mediaSchema = PluginHelpers.createSchema([
  { name: 'filename', type: 'string', optional: false },
  { name: 'originalName', type: 'string', optional: false },
  { name: 'mimeType', type: 'string', optional: false },
  { name: 'size', type: 'number', optional: false },
  { name: 'url', type: 'string', optional: false },
  { name: 'thumbnailUrl', type: 'string', optional: true },
  { name: 'metadata', type: 'object', optional: true },
  { name: 'uploadedBy', type: 'number', optional: true },
  { name: 'tags', type: 'array', optional: true }
])

const mediaMigration = PluginHelpers.createMigration('media_files', [
  { name: 'id', type: 'INTEGER', primaryKey: true },
  { name: 'filename', type: 'TEXT', nullable: false },
  { name: 'original_name', type: 'TEXT', nullable: false },
  { name: 'mime_type', type: 'TEXT', nullable: false },
  { name: 'size', type: 'INTEGER', nullable: false },
  { name: 'url', type: 'TEXT', nullable: false },
  { name: 'thumbnail_url', type: 'TEXT', nullable: true },
  { name: 'metadata', type: 'TEXT', nullable: true },
  { name: 'uploaded_by', type: 'INTEGER', nullable: true },
  { name: 'tags', type: 'TEXT', nullable: true }
])

builder.addModel('MediaFile', {
  tableName: 'media_files',
  schema: mediaSchema,
  migrations: [mediaMigration],
  relationships: [
    {
      type: 'oneToMany',
      target: 'User',
      foreignKey: 'uploaded_by'
    }
  ]
})
```

## Admin Interface

Add admin pages and menu items to the SonicJS admin interface.

### Admin Pages

```typescript
// Add admin page
plugin.addAdminPage(
  '/my-plugin',
  'My Plugin',
  'MyPluginView',
  {
    description: 'Manage my plugin settings and data',
    permissions: ['admin', 'plugin:manage'],
    icon: 'cog'
  }
)

// Add sub-page
plugin.addAdminPage(
  '/my-plugin/settings',
  'Plugin Settings',
  'MyPluginSettingsView',
  {
    description: 'Configure plugin settings',
    permissions: ['admin', 'plugin:configure'],
    icon: 'settings'
  }
)
```

### Menu Items

```typescript
// Add top-level menu item
plugin.addMenuItem('My Plugin', '/admin/my-plugin', {
  icon: 'puzzle',
  order: 50,
  permissions: ['admin', 'plugin:manage']
})

// Add sub-menu items
plugin.addMenuItem('Dashboard', '/admin/my-plugin', {
  icon: 'home',
  parent: 'My Plugin',
  order: 1
})

plugin.addMenuItem('Settings', '/admin/my-plugin/settings', {
  icon: 'cog',
  parent: 'My Plugin',
  order: 2,
  permissions: ['admin', 'plugin:configure']
})
```

### Real-World Examples

From the Auth plugin:

```typescript
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
```

From the Media plugin:

```typescript
builder.addAdminPage(
  '/media',
  'Media Library',
  'MediaLibraryView',
  {
    description: 'Browse and manage media files',
    permissions: ['admin', 'media:manage'],
    icon: 'photo'
  }
)

builder.addMenuItem('Media', '/admin/media', {
  icon: 'photo',
  order: 30,
  permissions: ['admin', 'media:manage']
})

builder.addMenuItem('Library', '/admin/media', {
  icon: 'photo',
  parent: 'Media',
  order: 1,
  permissions: ['admin', 'media:manage']
})

builder.addMenuItem('Upload', '/admin/media/upload', {
  icon: 'upload',
  parent: 'Media',
  order: 2,
  permissions: ['admin', 'media:upload']
})
```

## Real-World Example: Cache Plugin

The Cache plugin (`/src/plugins/cache/`) is a complete, production-ready example that demonstrates all aspects of plugin development.

### Plugin Architecture

```
src/plugins/cache/
├── index.ts                      # Main plugin class
├── manifest.json                 # Plugin manifest
├── routes.ts                     # Admin routes
├── services/
│   ├── cache.ts                  # Core cache service
│   ├── cache-config.ts           # Cache configuration
│   ├── cache-invalidation.ts    # Event-based invalidation
│   ├── cache-warming.ts          # Cache preloading
│   └── event-bus.ts              # Event system
└── tests/
    └── cache.test.ts             # Unit tests
```

### Main Plugin Implementation

From `/src/plugins/cache/index.ts`:

```typescript
export class CachePlugin {
  private context: PluginContext | null = null

  /**
   * Get plugin routes
   */
  getRoutes() {
    return cacheRoutes
  }

  /**
   * Activate the cache plugin
   */
  async activate(context: PluginContext): Promise<void> {
    this.context = context

    const settings = context.config || {}

    console.log('Cache plugin activated', {
      memoryEnabled: settings.memoryEnabled ?? true,
      kvEnabled: settings.kvEnabled ?? false,
      defaultTTL: settings.defaultTTL ?? 3600
    })

    // Initialize default cache services
    for (const [namespace, config] of Object.entries(CACHE_CONFIGS)) {
      getCacheService({
        ...config,
        memoryEnabled: settings.memoryEnabled ?? config.memoryEnabled,
        kvEnabled: settings.kvEnabled ?? config.kvEnabled,
        ttl: settings.defaultTTL ?? config.ttl
      })
    }

    // Setup event-based cache invalidation
    setupCacheInvalidation()
  }

  /**
   * Deactivate the cache plugin
   */
  async deactivate(): Promise<void> {
    console.log('Cache plugin deactivated - clearing all caches')
    await clearAllCaches()
    this.context = null
  }

  /**
   * Configure the cache plugin
   */
  async configure(settings: Record<string, any>): Promise<void> {
    console.log('Cache plugin configured', settings)

    // Reconfigure all cache instances with new settings
    for (const [namespace, config] of Object.entries(CACHE_CONFIGS)) {
      getCacheService({
        ...config,
        memoryEnabled: settings.memoryEnabled ?? config.memoryEnabled,
        kvEnabled: settings.kvEnabled ?? config.kvEnabled,
        ttl: settings.defaultTTL ?? config.ttl
      })
    }
  }
}
```

### Cache Service Implementation

The Cache plugin implements a sophisticated three-tier caching system:

```typescript
export class CacheService {
  private memoryCache: MemoryCache
  private config: CacheConfig
  private stats: CacheStats
  private kvNamespace?: KVNamespace

  constructor(config: CacheConfig, kvNamespace?: KVNamespace) {
    this.memoryCache = new MemoryCache()
    this.config = config
    this.kvNamespace = kvNamespace
    this.stats = {
      memoryHits: 0,
      memoryMisses: 0,
      kvHits: 0,
      kvMisses: 0,
      dbHits: 0,
      totalRequests: 0,
      hitRate: 0,
      memorySize: 0,
      entryCount: 0
    }
  }

  /**
   * Get value from cache (tries memory first, then KV)
   */
  async get<T>(key: string): Promise<T | null> {
    this.stats.totalRequests++

    // Try memory cache first (Tier 1)
    if (this.config.memoryEnabled) {
      const memoryValue = this.memoryCache.get<T>(key)
      if (memoryValue !== null) {
        this.stats.memoryHits++
        this.updateHitRate()
        return memoryValue
      }
      this.stats.memoryMisses++
    }

    // Try KV cache (Tier 2)
    if (this.config.kvEnabled && this.kvNamespace) {
      try {
        const kvValue = await this.kvNamespace.get(key, 'json')
        if (kvValue !== null) {
          this.stats.kvHits++

          // Populate memory cache for faster subsequent access
          if (this.config.memoryEnabled) {
            this.memoryCache.set(key, kvValue as T, this.config.ttl, this.config.version)
          }

          this.updateHitRate()
          return kvValue as T
        }
        this.stats.kvMisses++
      } catch (error) {
        console.error('KV cache read error:', error)
        this.stats.kvMisses++
      }
    }

    this.updateHitRate()
    return null
  }

  /**
   * Set value in cache (stores in both memory and KV)
   */
  async set<T>(
    key: string,
    value: T,
    customConfig?: Partial<CacheConfig>
  ): Promise<void> {
    const config = { ...this.config, ...customConfig }

    // Store in memory cache (Tier 1)
    if (config.memoryEnabled) {
      this.memoryCache.set(key, value, config.ttl, config.version)
    }

    // Store in KV cache (Tier 2)
    if (config.kvEnabled && this.kvNamespace) {
      try {
        await this.kvNamespace.put(key, JSON.stringify(value), {
          expirationTtl: config.ttl
        })
      } catch (error) {
        console.error('KV cache write error:', error)
      }
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute if not found
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    customConfig?: Partial<CacheConfig>
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch from source
    const value = await fetcher()

    // Store in cache
    await this.set(key, value, customConfig)

    return value
  }
}
```

### Cache Configuration

From `/src/plugins/cache/services/cache-config.ts`:

```typescript
export interface CacheConfig {
  ttl: number              // Time-to-live in seconds
  kvEnabled: boolean       // Use KV cache tier
  memoryEnabled: boolean   // Use in-memory cache tier
  namespace: string        // Cache namespace/prefix
  invalidateOn: string[]   // Events that invalidate this cache
  version?: string         // Cache version for busting
}

/**
 * Default cache configurations by entity type
 */
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Content (high read, low write)
  content: {
    ttl: 3600,              // 1 hour
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'content',
    invalidateOn: ['content.update', 'content.delete', 'content.publish'],
    version: 'v1'
  },

  // User data (medium read, medium write)
  user: {
    ttl: 900,               // 15 minutes
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'user',
    invalidateOn: ['user.update', 'user.delete', 'auth.login'],
    version: 'v1'
  },

  // API responses (very high read, low write)
  api: {
    ttl: 300,               // 5 minutes
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'api',
    invalidateOn: ['content.update', 'content.publish'],
    version: 'v1'
  }
}

/**
 * Generate a cache key with consistent format
 * Format: {namespace}:{type}:{identifier}:{version}
 */
export function generateCacheKey(
  namespace: string,
  type: string,
  identifier: string,
  version?: string
): string {
  const v = version || getCacheConfig(namespace).version || 'v1'
  return `${namespace}:${type}:${identifier}:${v}`
}
```

### Event-Based Cache Invalidation

From `/src/plugins/cache/services/cache-invalidation.ts`:

```typescript
import { onEvent, emitEvent } from './event-bus.js'
import { getCacheService } from './cache.js'
import { CACHE_CONFIGS, createCachePattern } from './cache-config.js'

let invalidationStats = {
  totalInvalidations: 0,
  byNamespace: {} as Record<string, number>,
  byEvent: {} as Record<string, number>
}

const recentInvalidations: Array<{
  timestamp: number
  namespace: string
  event: string
  pattern: string
  count: number
}> = []

/**
 * Setup event-based cache invalidation
 */
export function setupCacheInvalidation(): void {
  console.log('Setting up cache invalidation listeners...')

  for (const [namespace, config] of Object.entries(CACHE_CONFIGS)) {
    const cache = getCacheService(config)

    // Listen to invalidation events
    for (const event of config.invalidateOn) {
      onEvent(event, async (data) => {
        console.log(`Cache invalidation triggered: ${event} for ${namespace}`)

        // Determine invalidation pattern
        let pattern = createCachePattern(namespace)

        if (data?.id) {
          pattern = createCachePattern(namespace, '*', data.id)
        }

        const count = await cache.invalidate(pattern)

        // Update stats
        invalidationStats.totalInvalidations += count
        invalidationStats.byNamespace[namespace] =
          (invalidationStats.byNamespace[namespace] || 0) + count
        invalidationStats.byEvent[event] =
          (invalidationStats.byEvent[event] || 0) + count

        // Track recent invalidations
        recentInvalidations.unshift({
          timestamp: Date.now(),
          namespace,
          event,
          pattern,
          count
        })

        // Keep only last 100
        if (recentInvalidations.length > 100) {
          recentInvalidations.length = 100
        }

        console.log(`Invalidated ${count} entries for ${namespace}`)
      })
    }
  }

  console.log('Cache invalidation setup complete')
}
```

### Cache Routes

The Cache plugin provides comprehensive admin routes for monitoring and managing the cache. See the full implementation in `/src/plugins/cache/routes.ts`.

Key endpoints:
- `GET /admin/cache` - Dashboard with statistics
- `GET /admin/cache/stats` - Detailed statistics
- `POST /admin/cache/clear` - Clear all caches
- `POST /admin/cache/invalidate` - Invalidate by pattern
- `GET /admin/cache/browser` - Browse cache entries
- `GET /admin/cache/analytics` - Advanced analytics
- `POST /admin/cache/warm` - Warm cache

### Usage in Other Plugins

Other plugins can use the cache service:

```typescript
import { getCacheService } from '../cache/index.js'

// Get cache service for your namespace
const cache = getCacheService({
  namespace: 'my-plugin',
  ttl: 600,
  memoryEnabled: true,
  kvEnabled: false,
  invalidateOn: ['my-plugin:update'],
  version: 'v1'
})

// Use cache in route handlers
app.get('/data', async (c) => {
  const id = c.req.query('id')
  const cacheKey = `my-plugin:data:${id}:v1`

  // Try cache first
  const cached = await cache.get(cacheKey)
  if (cached) {
    return c.json({ data: cached, source: 'cache' })
  }

  // Fetch from database
  const data = await fetchDataFromDB(id)

  // Store in cache
  await cache.set(cacheKey, data)

  return c.json({ data, source: 'database' })
})

// Or use getOrSet pattern
app.get('/data/:id', async (c) => {
  const id = c.req.param('id')
  const cacheKey = `my-plugin:data:${id}:v1`

  const data = await cache.getOrSet(
    cacheKey,
    async () => {
      // This function only runs on cache miss
      return await fetchDataFromDB(id)
    }
  )

  return c.json({ data })
})
```

## Testing Plugins

### Unit Testing

Create tests in the `tests/` directory:

```typescript
// tests/plugin.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import plugin from '../index.js'

describe('My Plugin', () => {
  it('should have correct metadata', () => {
    expect(plugin.name).toBe('my-plugin')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should register routes', () => {
    expect(plugin.routes).toBeDefined()
    expect(plugin.routes?.length).toBeGreaterThan(0)
  })

  it('should have lifecycle hooks', () => {
    expect(plugin.activate).toBeDefined()
    expect(plugin.deactivate).toBeDefined()
  })
})
```

### Integration Testing

Test plugin integration with the plugin system:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { PluginManager } from '@/plugins/core/plugin-manager'
import myPlugin from '../index.js'

describe('Plugin Integration', () => {
  let manager: PluginManager

  beforeEach(() => {
    manager = new PluginManager()
  })

  it('should install plugin', async () => {
    await manager.install(myPlugin, {
      enabled: true,
      apiKey: 'test-key'
    })

    const status = manager.getStatus('my-plugin')
    expect(status.installed).toBe(true)
  })

  it('should activate plugin', async () => {
    await manager.install(myPlugin, { enabled: true })

    const status = manager.getStatus('my-plugin')
    expect(status.active).toBe(true)
  })

  it('should handle configuration', async () => {
    await manager.install(myPlugin)

    const newConfig = {
      enabled: true,
      apiKey: 'updated-key'
    }

    await myPlugin.configure?.(newConfig)

    // Verify configuration was applied
    expect(manager.registry.getConfig('my-plugin')).toMatchObject(newConfig)
  })
})
```

### Service Testing

Test your plugin services:

```typescript
import { describe, it, expect } from 'vitest'
import { WeatherService } from '../services/weather-service.js'

describe('WeatherService', () => {
  const service = new WeatherService('test-api-key')

  it('should fetch current weather', async () => {
    const weather = await service.getCurrentWeather('London')

    expect(weather).toBeDefined()
    expect(weather.city).toBe('London')
    expect(weather.temperature).toBeGreaterThan(-50)
    expect(weather.temperature).toBeLessThan(60)
  })

  it('should fetch forecast', async () => {
    const forecast = await service.getForecast('London', 7)

    expect(forecast).toHaveLength(7)
    expect(forecast[0]).toHaveProperty('date')
    expect(forecast[0]).toHaveProperty('high')
    expect(forecast[0]).toHaveProperty('low')
  })

  it('should search cities', async () => {
    const cities = await service.searchCities('Lon')

    expect(cities).toContain('London')
  })
})
```

### Real-World Test Example

From the Cache plugin (`/src/plugins/cache/tests/cache.test.ts`):

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { CacheService } from '../services/cache.js'

describe('CacheService', () => {
  let cache: CacheService

  beforeEach(() => {
    cache = new CacheService({
      namespace: 'test',
      ttl: 60,
      memoryEnabled: true,
      kvEnabled: false,
      invalidateOn: [],
      version: 'v1'
    })
  })

  it('should set and get values', async () => {
    await cache.set('test-key', { foo: 'bar' })
    const value = await cache.get('test-key')

    expect(value).toEqual({ foo: 'bar' })
  })

  it('should return null for missing keys', async () => {
    const value = await cache.get('missing-key')
    expect(value).toBeNull()
  })

  it('should invalidate by pattern', async () => {
    await cache.set('user:1', { name: 'Alice' })
    await cache.set('user:2', { name: 'Bob' })
    await cache.set('post:1', { title: 'Hello' })

    const count = await cache.invalidate('user:*')
    expect(count).toBe(2)

    expect(await cache.get('user:1')).toBeNull()
    expect(await cache.get('user:2')).toBeNull()
    expect(await cache.get('post:1')).toBeDefined()
  })

  it('should track statistics', async () => {
    await cache.set('key1', 'value1')
    await cache.get('key1')  // hit
    await cache.get('key2')  // miss

    const stats = cache.getStats()
    expect(stats.memoryHits).toBe(1)
    expect(stats.memoryMisses).toBe(1)
    expect(stats.totalRequests).toBe(2)
  })
})
```

## Best Practices

### 1. Plugin Naming

```typescript
// Good
name: 'weather-forecast'
name: 'user-analytics'
name: 'advanced-search'

// Avoid
name: 'Weather'
name: 'MyPlugin'
name: 'plugin_name'
```

### 2. Versioning

Follow semantic versioning (semver):

```typescript
// Major.Minor.Patch
version: '1.0.0'    // Initial release
version: '1.1.0'    // New feature (backward compatible)
version: '1.1.1'    // Bug fix
version: '2.0.0'    // Breaking change
```

### 3. Configuration

Provide sensible defaults:

```typescript
plugin.lifecycle({
  configure: async (config) => {
    const settings = {
      // Defaults
      enabled: true,
      cacheEnabled: true,
      cacheTTL: 3600,
      maxRetries: 3,
      timeout: 30000,
      // Override with user config
      ...config
    }

    // Validate
    if (settings.cacheTTL < 0) {
      throw new Error('cacheTTL must be positive')
    }

    // Apply
    applySettings(settings)
  }
})
```

### 4. Error Handling

Handle errors gracefully:

```typescript
plugin.addRoute('/api/data', new Hono().get('/', async (c) => {
  try {
    const data = await fetchData()
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Failed to fetch data:', error)

    // Log detailed error
    context.logger.error('Data fetch failed', error, {
      path: c.req.path,
      timestamp: Date.now()
    })

    // Return user-friendly error
    return c.json({
      success: false,
      error: 'Failed to fetch data. Please try again later.'
    }, 500)
  }
}))
```

### 5. Security

Validate and sanitize all inputs:

```typescript
import { z } from 'zod'

const inputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

routes.post('/users', async (c) => {
  try {
    const body = await c.req.json()
    const validated = inputSchema.parse(body)

    // Use validated data
    const user = await createUser(validated)

    return c.json({ success: true, data: user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Invalid input',
        details: error.errors
      }, 400)
    }
    throw error
  }
})
```

### 6. Logging

Use structured logging:

```typescript
// Good
context.logger.info('User created', {
  userId: user.id,
  email: user.email,
  timestamp: Date.now()
})

context.logger.error('Database error', error, {
  query: 'SELECT * FROM users',
  timestamp: Date.now()
})

// Avoid
console.log('User created')
console.log(error)
```

### 7. Dependencies

Minimize and document dependencies:

```typescript
plugin.metadata({
  dependencies: ['cache', 'auth'],
  compatibility: '^0.1.0'
})

// Document why each dependency is needed
/**
 * Dependencies:
 * - cache: Used for caching API responses
 * - auth: Required for user authentication
 */
```

### 8. Documentation

Document your plugin thoroughly:

```typescript
/**
 * Weather Plugin
 *
 * Provides weather information and forecasts.
 *
 * Features:
 * - Current weather by city
 * - 7-day forecast
 * - City search
 * - Automatic caching
 *
 * Configuration:
 * - apiKey: Weather API key (required)
 * - defaultCity: Default city for queries
 * - cacheEnabled: Enable caching (default: true)
 * - cacheTTL: Cache duration in seconds (default: 300)
 *
 * Usage:
 * ```typescript
 * const weather = await weatherService.getCurrentWeather('London')
 * ```
 */
```

### 9. Performance

Optimize for performance:

```typescript
// Use caching
const cache = getCacheService({ namespace: 'my-plugin', ttl: 300 })
const data = await cache.getOrSet('expensive-query', async () => {
  return await expensiveOperation()
})

// Batch operations
const users = await Promise.all(
  userIds.map(id => fetchUser(id))
)

// Pagination
const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100)
const offset = parseInt(c.req.query('offset') || '0')
```

### 10. Testing

Write comprehensive tests:

```typescript
describe('My Plugin', () => {
  // Test metadata
  it('should have valid metadata', () => {
    expect(plugin.name).toBeTruthy()
    expect(plugin.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  // Test lifecycle
  it('should activate successfully', async () => {
    await plugin.activate?.(mockContext)
    expect(plugin).toBeDefined()
  })

  // Test functionality
  it('should process data correctly', async () => {
    const result = await service.processData(input)
    expect(result).toMatchSnapshot()
  })

  // Test error handling
  it('should handle errors gracefully', async () => {
    await expect(service.processData(invalidInput))
      .rejects.toThrow('Invalid input')
  })
})
```

## Advanced Topics

### Custom Hook Names

Create plugin-specific hooks:

```typescript
// Register custom hook
plugin.addHook('my-plugin:data-processed', async (data, context) => {
  console.log('Data processed:', data)
  return data
}, {
  priority: 10,
  description: 'Custom plugin hook'
})

// Trigger from plugin code
const result = await context.hooks.execute('my-plugin:data-processed', data)
```

### Plugin Communication

Plugins can communicate through hooks:

```typescript
// Plugin A - Register hook
pluginA.addHook('plugin-a:user-created', async (user) => {
  console.log('User created in Plugin A:', user)
  return user
})

// Plugin B - Listen to Plugin A's hook
pluginB.addHook('plugin-a:user-created', async (user, context) => {
  console.log('Plugin B notified of new user:', user)

  // Plugin B can react to Plugin A's event
  await pluginB.service.handleNewUser(user)

  return user
})
```

### Resource Management

Properly manage resources:

```typescript
plugin.lifecycle({
  activate: async (context) => {
    // Initialize resources
    const connection = await createDatabaseConnection()
    const interval = setInterval(() => {
      // Background task
    }, 60000)

    // Store for cleanup
    context.resources = { connection, interval }
  },

  deactivate: async (context) => {
    // Clean up resources
    if (context.resources?.connection) {
      await context.resources.connection.close()
    }
    if (context.resources?.interval) {
      clearInterval(context.resources.interval)
    }
  }
})
```

### Lazy Loading

Load heavy dependencies only when needed:

```typescript
let heavyLibrary: any = null

async function getHeavyLibrary() {
  if (!heavyLibrary) {
    heavyLibrary = await import('heavy-library')
  }
  return heavyLibrary
}

routes.post('/process', async (c) => {
  const lib = await getHeavyLibrary()
  const result = lib.process(data)
  return c.json({ result })
})
```

### Plugin Hooks for Inter-Plugin Dependencies

```typescript
// Plugin that provides a service
const authPlugin = PluginBuilder.create({
  name: 'auth',
  version: '1.0.0'
})

authPlugin.addService('authService', authService, { singleton: true })

// Plugin that depends on auth
const securePlugin = PluginBuilder.create({
  name: 'secure-plugin',
  version: '1.0.0'
})

securePlugin.metadata({
  dependencies: ['auth']
})

securePlugin.lifecycle({
  activate: async (context) => {
    // Access auth service from dependency
    const authService = context.services.authService

    if (!authService) {
      throw new Error('Auth service not available')
    }

    // Use auth service
    const isValid = await authService.validateToken(token)
  }
})
```

### Dynamic Configuration

Update configuration at runtime:

```typescript
plugin.lifecycle({
  configure: async (config) => {
    // Dynamic configuration
    if (config.mode === 'production') {
      cache.ttl = 3600
      logger.level = 'error'
    } else {
      cache.ttl = 60
      logger.level = 'debug'
    }

    // Hot reload
    if (config.hotReload) {
      setupHotReload()
    }
  }
})
```

## Support and Resources

- [SonicJS Documentation](https://docs.sonicjs.com)
- [Plugin API Reference](https://docs.sonicjs.com/plugins/api)
- [GitHub Repository](https://github.com/lane711/sonicjs-ai)
- [Community Discord](https://discord.gg/sonicjs)
- [GitHub Issues](https://github.com/lane711/sonicjs-ai/issues)

## Conclusion

This guide has covered:

1. Plugin system architecture and core components
2. Creating custom plugins from scratch
3. Plugin manifest structure and configuration
4. Complete plugin lifecycle management
5. Hook system for event-driven programming
6. Route, middleware, and service registration
7. Database models and migrations
8. Admin interface integration
9. Real-world example: Complete Cache plugin
10. Testing strategies and best practices
11. Advanced topics and optimization techniques

The Cache plugin serves as a comprehensive reference implementation demonstrating production-ready plugin development. Study its source code for additional insights into advanced patterns and techniques.
