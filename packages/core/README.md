# @sonicjs/core

Core framework for SonicJS - A modern, TypeScript-first headless CMS built for Cloudflare's edge platform.

## Features

- 🚀 **Edge-First**: Runs on Cloudflare Workers for sub-50ms global response times
- 📦 **Zero Cold Starts**: V8 isolates provide instant startup
- 🔒 **Type-Safe**: Full TypeScript support with strict typing
- 🔌 **Plugin System**: Extensible architecture with hooks and middleware
- ⚡ **Three-Tier Caching**: Memory, KV, and database layers for optimal performance
- 🎨 **Admin Interface**: Beautiful glass morphism design system
- 🔐 **Authentication**: JWT-based auth with role-based permissions
- 📝 **Content Management**: Dynamic collections with versioning and workflows
- 🖼️ **Media Management**: R2 storage with automatic CDN optimization
- 📊 **API Documentation**: OpenAPI/Swagger with auto-generated docs

## Installation

```bash
npm install @sonicjs/core
```

### Peer Dependencies

```bash
npm install @cloudflare/workers-types hono drizzle-orm zod
```

## Quick Start

### 1. Create a new SonicJS project

```typescript
// src/index.ts
import { createSonicJSApp } from '@sonicjs/core'
import type { SonicJSConfig } from '@sonicjs/core'

const config: SonicJSConfig = {
  collections: {
    directory: './src/collections',
    autoSync: true
  },
  plugins: {
    directory: './src/plugins',
    autoLoad: true
  }
}

const app = createSonicJSApp(config)

export default app
```

### 2. Define a collection

```typescript
// src/collections/posts.collection.ts
import type { CollectionConfig } from '@sonicjs/core'

export const postsCollection: CollectionConfig = {
  name: 'posts',
  fields: {
    title: {
      type: 'text',
      required: true,
      label: 'Title'
    },
    content: {
      type: 'rich_text',
      required: true,
      label: 'Content'
    },
    published: {
      type: 'boolean',
      default: false,
      label: 'Published'
    }
  }
}
```

### 3. Run migrations

```bash
npm run db:migrate
```

### 4. Start development server

```bash
npm run dev
```

## Usage

### Importing Core Modules

```typescript
// Main API
import { createSonicJSApp } from '@sonicjs/core'
import type { SonicJSConfig } from '@sonicjs/core'

// Services
import { CollectionService, MigrationService } from '@sonicjs/core/services'

// Middleware
import { requireAuth, requireRole } from '@sonicjs/core/middleware'

// Types
import type {
  CollectionConfig,
  PluginConfig,
  User,
  Bindings
} from '@sonicjs/core'

// Utilities
import { validators, templateRenderer } from '@sonicjs/core/utils'
```

### Custom Routes

```typescript
import { Hono } from 'hono'
import { requireAuth } from '@sonicjs/core/middleware'
import type { Bindings } from '@sonicjs/core'

export const customRoutes = new Hono<{ Bindings: Bindings }>()

customRoutes.get('/custom', requireAuth(), async (c) => {
  return c.json({ message: 'Custom route' })
})
```

### Custom Plugins

```typescript
import type { Plugin } from '@sonicjs/core/plugins'

export class MyPlugin implements Plugin {
  name = 'my-plugin'
  version = '1.0.0'
  description = 'My custom plugin'

  async onActivate() {
    console.log('Plugin activated!')
  }

  hooks = {
    'content.beforeSave': async (content) => {
      // Modify content before saving
      return content
    }
  }
}
```

## Configuration

### SonicJS Config

```typescript
interface SonicJSConfig {
  // Collections configuration
  collections?: {
    directory: string
    autoSync: boolean
  }

  // Plugins configuration
  plugins?: {
    directory: string
    autoLoad: boolean
  }

  // Custom routes
  routes?: Array<{
    path: string
    handler: Hono
  }>

  // Custom middleware
  middleware?: {
    beforeAuth?: Array<MiddlewareHandler>
    afterAuth?: Array<MiddlewareHandler>
  }
}
```

## API Reference

### Services

- **CollectionService**: Load and manage collections
- **MigrationService**: Database migration management
- **PluginService**: Plugin lifecycle management
- **Logger**: Structured logging system

### Middleware

- **requireAuth()**: Require authentication
- **requireRole(roles)**: Require specific roles
- **requirePermission(permission)**: Require specific permission
- **bootstrapMiddleware()**: Initialize application

### Routes

- **apiRoutes**: Public API endpoints
- **adminRoutes**: Admin dashboard routes
- **authRoutes**: Authentication routes

## Migration from Standalone

If you're migrating from a standalone SonicJS project:

```bash
# 1. Install core package
npm install @sonicjs/core

# 2. Run migration tool
npx @sonicjs/migrate --from=current --to=1.0.0

# 3. Update src/index.ts with new config API
# 4. Run database migrations
npm run db:migrate

# 5. Test
npm run dev
```

See [Migration Guide](https://docs.sonicjs.com/migration) for detailed instructions.

## Documentation

- **Getting Started**: https://docs.sonicjs.com/getting-started
- **API Reference**: https://docs.sonicjs.com/api
- **Plugin Development**: https://docs.sonicjs.com/plugins
- **Migration Guide**: https://docs.sonicjs.com/migration

## Examples

See the [examples](../../examples) directory for complete examples:

- **Basic Setup**: Simple SonicJS application
- **Custom Plugin**: Building custom plugins
- **API Integration**: Consuming the API
- **Advanced Configuration**: Complex setups

## Architecture

```
@sonicjs/core
├── services/       # Business logic layer
├── middleware/     # Request processing
├── routes/         # HTTP handlers
├── templates/      # Admin UI templates
├── plugins/        # Plugin system
├── types/          # TypeScript definitions
├── utils/          # Utility functions
└── migrations/     # Database migrations
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

MIT © SonicJS Team

## Support

- **GitHub Issues**: https://github.com/sonicjs/sonicjs/issues
- **Discord**: https://discord.gg/sonicjs
- **Documentation**: https://docs.sonicjs.com
- **Twitter**: @sonicjscms

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

**Built with ❤️ by the SonicJS Team**
