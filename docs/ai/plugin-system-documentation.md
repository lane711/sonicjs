# SonicJS Plugin System Documentation

**Version**: 2.0.2
**Last Updated**: October 24, 2025
**Status**: Production Ready

## Overview

The SonicJS plugin system provides a powerful, extensible architecture for adding functionality to your CMS. All plugins are included in the `@sonicjs-cms/core` package and can be enabled/disabled via configuration.

## Included Plugins

SonicJS v2.0.2 includes **13 plugins** across 6 categories:

### Core Plugins (4)

1. **Cache System** (`core-cache`)
2. **Analytics & Insights** (`core-analytics`)
3. **Authentication System** (`core-auth`)
4. **Media Manager** (`core-media`)

### Content Plugins (4)

5. **FAQ Manager** (`faq-plugin`)
6. **Testimonials** (`testimonials-plugin`)
7. **Code Examples** (`code-examples-plugin`)
8. **Workflow Engine** (`workflow-plugin`)

### Development Plugins (2)

9. **Database Tools** (`database-tools`)
10. **Seed Data Generator** (`seed-data`)

### Utility Plugins (2)

11. **Demo Login** (`demo-login-plugin`)
12. **Hello World** (`hello-world`)

### UI Plugins (1)

13. **Design System** (`design`)

---

## Plugin Details

### 1. Cache System (`core-cache`)

**Category**: Performance
**Version**: 1.0.0-beta.1
**Author**: SonicJS

**Description**: Three-tiered caching system with in-memory and KV storage. Provides automatic caching for content, users, media, and API responses with configurable TTL and invalidation patterns.

**Settings**:
- `memoryEnabled` (boolean, default: true) - Enable in-memory cache (tier-1)
- `kvEnabled` (boolean, default: false) - Enable KV cache (tier-2, global)
- `defaultTTL` (number, default: 3600) - Default time-to-live in seconds
- `maxMemorySize` (number, default: 50) - Max memory cache size in MB

**Routes**:
- `GET /admin/cache/stats` - View cache statistics
- `POST /admin/cache/clear` - Clear all cache entries
- `POST /admin/cache/invalidate` - Invalidate cache entries by pattern

**Permissions**:
- `cache.view` - View cache statistics
- `cache.clear` - Clear cache entries
- `cache.invalidate` - Invalidate cache patterns

**Hooks**:
- `onActivate`, `onDeactivate`, `onConfigure`

**Use Cases**:
- Speed up content delivery
- Reduce database queries
- Improve API response times
- Global content distribution via Cloudflare KV

---

### 2. Analytics & Insights (`core-analytics`)

**Category**: Analytics
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Core analytics system for tracking page views, user behavior, and content performance. Provides dashboards and reports with real-time metrics.

**Settings**:
- `trackPageViews` (boolean, default: true) - Automatically track page views
- `trackUserSessions` (boolean, default: true) - Track user session duration
- `retentionDays` (number, default: 90) - Data retention period in days

**Admin Menu**:
- Label: "Analytics"
- Icon: chart-bar
- Path: `/admin/analytics`
- Order: 50

**Permissions**:
- `analytics:view` - View analytics data
- `analytics:export` - Export analytics reports

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Track content performance
- Monitor user engagement
- Generate usage reports
- Identify trending content

---

### 3. Authentication System (`core-auth`)

**Category**: Security
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Core authentication and user management system with role-based access control (RBAC), session management, and security features.

**Settings**:
- `sessionTimeout` (number, default: 60) - Auto-logout after N minutes of inactivity
- `maxLoginAttempts` (number, default: 5) - Lock account after N failed attempts
- `requireStrongPasswords` (boolean, default: true) - Enforce password complexity

**Permissions**:
- `manage:users` - Manage users and accounts
- `manage:roles` - Manage user roles
- `manage:permissions` - Manage permission settings

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- User authentication and authorization
- Role-based access control (RBAC)
- Session management
- Account security and lockout

---

### 4. Media Manager (`core-media`)

**Category**: Media
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Core media upload and management system with support for images, videos, and documents. Includes automatic optimization, thumbnail generation, and cloud storage integration (Cloudflare R2).

**Settings**:
- `maxFileSize` (number, default: 10) - Maximum upload size in MB
- `allowedFileTypes` (string, default: "jpg,jpeg,png,gif,webp,pdf,mp4,mp3") - Allowed extensions
- `autoOptimize` (boolean, default: true) - Auto-optimize images on upload
- `generateThumbnails` (boolean, default: true) - Auto-generate thumbnails

**Admin Menu**:
- Label: "Media"
- Icon: image
- Path: `/admin/media`
- Order: 30

**Permissions**:
- `manage:media` - Manage media library
- `upload:files` - Upload files

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Image and video uploads
- Document management
- Thumbnail generation
- Cloud storage with Cloudflare R2

---

### 5. FAQ Manager (`faq-plugin`)

**Category**: Content
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Frequently Asked Questions management plugin with categorization, search, and display templates.

**Permissions**:
- `faq:manage` - Manage FAQ content

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Create FAQ sections
- Categorize questions
- Search functionality
- Display templates for frontend

---

### 6. Testimonials (`testimonials-plugin`)

**Category**: Content
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Customer testimonials and reviews management with display widgets and ratings.

**Permissions**:
- `testimonials:manage` - Manage testimonials

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Collect customer testimonials
- Display reviews on website
- Rating system
- Social proof widgets

---

### 7. Code Examples (`code-examples-plugin`)

**Category**: Content
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Code snippets and examples library with syntax highlighting and categorization.

**Permissions**:
- `code-examples:manage` - Manage code examples

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Documentation with code examples
- Developer documentation
- API examples
- Tutorial content

---

### 8. Workflow Engine (`workflow-plugin`)

**Category**: Content
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Content workflow and approval system with customizable states, transitions, and review processes.

**Settings**:
- `requireApproval` (boolean, default: true) - Require approval before publishing
- `notifyReviewers` (boolean, default: true) - Send notifications to reviewers

**Permissions**:
- `workflow:manage` - Manage workflow settings
- `workflow:approve` - Approve content

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Content approval workflows
- Multi-stage publishing
- Editorial review process
- Collaboration features

---

### 9. Database Tools (`database-tools`)

**Category**: Development
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Database management and administration tools including migrations, backups, and query execution.

**Permissions**:
- `database:admin` - Administer database

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Database migrations
- Backup and restore
- Query execution
- Database inspection

---

### 10. Seed Data Generator (`seed-data`)

**Category**: Development
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Development tool for generating sample data and testing content. Useful for demos and development environments.

**Permissions**:
- `seed-data:generate` - Generate seed data

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Generate demo data
- Testing environments
- Development setup
- Sample content creation

---

### 11. Demo Login (`demo-login-plugin`)

**Category**: Utilities
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: Quick demo login functionality for testing and demonstrations.

**Dependencies**: `core-auth`

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Demo environments
- Quick testing
- Prototype presentations
- Development convenience

---

### 12. Hello World (`hello-world`)

**Category**: Utilities
**Version**: 1.0.0-beta.1
**Author**: SonicJS Team

**Description**: A simple Hello World plugin demonstration showing basic plugin structure.

**Admin Menu**:
- Label: "Hello World"
- Icon: hand-raised
- Path: `/admin/hello-world`
- Order: 90

**Permissions**:
- `hello-world:view` - View Hello World page

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Plugin development reference
- Learning plugin structure
- Testing plugin system

---

### 13. Design System (`design`)

**Category**: UI
**Version**: 1.0.0-beta.1
**Author**: SonicJS

**Description**: Design system management including themes, components, and UI customization. Provides a visual interface for managing design tokens, typography, colors, and component library.

**Settings**:
- `defaultTheme` (string, default: "dark") - Default theme (light, dark, auto)
- `customCSS` (boolean, default: false) - Allow custom CSS overrides

**Routes**:
- `GET /admin/design` - Design system management page

**Admin Menu**:
- Label: "Design"
- Icon: palette
- Path: `/admin/design`
- Order: 80

**Permissions**:
- `design.view` - View design system
- `design.edit` - Edit design settings

**Hooks**:
- `onActivate`, `onDeactivate`

**Use Cases**:
- Theme customization
- UI component management
- Design token configuration
- Brand customization

---

## Plugin System Architecture

### Plugin Manifest Structure

Every plugin requires a `manifest.json` file:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name",
  "homepage": "https://example.com",
  "repository": "https://github.com/user/plugin",
  "license": "MIT",
  "category": "content",
  "tags": ["tag1", "tag2"],
  "dependencies": ["other-plugin-id"],
  "settings": {
    "settingKey": {
      "type": "boolean",
      "label": "Setting Label",
      "description": "Setting description",
      "default": true
    }
  },
  "hooks": {
    "onActivate": "activate",
    "onDeactivate": "deactivate"
  },
  "routes": [
    {
      "path": "/admin/my-plugin",
      "method": "GET",
      "handler": "getPage",
      "description": "Get plugin page"
    }
  ],
  "permissions": {
    "my-plugin:manage": "Manage my plugin"
  },
  "adminMenu": {
    "label": "My Plugin",
    "icon": "icon-name",
    "path": "/admin/my-plugin",
    "order": 50
  }
}
```

### Plugin Registry

All plugins are auto-discovered and registered at build time via `scripts/generate-plugin-registry.mjs`:

```typescript
import { PLUGIN_REGISTRY, PLUGIN_IDS, CORE_PLUGIN_IDS } from './plugins/plugin-registry'

// Get all plugin IDs
console.log(PLUGIN_IDS) // All 13 plugins

// Get core plugin IDs
console.log(CORE_PLUGIN_IDS) // Core plugins only

// Get plugin manifest
const manifest = PLUGIN_REGISTRY['core-cache']
```

### Plugin Categories

- **performance**: Caching, optimization
- **analytics**: Tracking, reporting, metrics
- **security**: Authentication, authorization
- **media**: Upload, storage, optimization
- **content**: Content types, management
- **development**: Tools, utilities, debugging
- **utilities**: General purpose tools
- **ui**: Themes, design, customization

### Plugin Lifecycle Hooks

- `onActivate` - Called when plugin is enabled
- `onDeactivate` - Called when plugin is disabled
- `onConfigure` - Called when settings change

### Plugin Permissions

Plugins can define custom permissions that integrate with the RBAC system:

```typescript
"permissions": {
  "plugin:action": "Description of permission"
}
```

### Plugin Settings

Plugins can define configurable settings with types:

- `boolean` - True/false toggle
- `string` - Text input
- `number` - Numeric input
- `array` - List of values

### Plugin Routes

Plugins can register custom routes:

```typescript
"routes": [
  {
    "path": "/admin/custom-path",
    "method": "GET",
    "handler": "handlerFunctionName",
    "description": "Route description"
  }
]
```

### Admin Menu Integration

Plugins can add items to the admin sidebar:

```typescript
"adminMenu": {
  "label": "Menu Label",
  "icon": "heroicon-name",
  "path": "/admin/path",
  "order": 50  // Lower = higher in menu
}
```

---

## Using Plugins

### Enable/Disable Plugins

```typescript
// In your sonicjs.config.ts
export default {
  plugins: {
    enabled: [
      'core-cache',
      'core-analytics',
      'faq-plugin',
      'testimonials-plugin'
    ],
    disabled: [
      'demo-login-plugin'  // Disable in production
    ]
  }
}
```

### Configure Plugin Settings

```typescript
// In your sonicjs.config.ts
export default {
  plugins: {
    settings: {
      'core-cache': {
        memoryEnabled: true,
        kvEnabled: true,
        defaultTTL: 7200
      },
      'core-media': {
        maxFileSize: 20,
        autoOptimize: true
      }
    }
  }
}
```

### Access Plugin Functionality

```typescript
import { PluginManager } from '@sonicjs-cms/core'

// Get plugin instance
const cachePlugin = await PluginManager.getPlugin('core-cache')

// Call plugin methods
await cachePlugin.clear()
const stats = await cachePlugin.getStats()
```

---

## Creating Custom Plugins

### 1. Create Plugin Directory Structure

```
src/plugins/my-plugin/
├── manifest.json
├── index.ts
├── handlers/
│   └── routes.ts
└── README.md
```

### 2. Define Manifest

See manifest structure above.

### 3. Implement Plugin Interface

```typescript
// src/plugins/my-plugin/index.ts
import type { Plugin, PluginContext } from '@sonicjs-cms/core'

export const myPlugin: Plugin = {
  async activate(context: PluginContext) {
    const { hookSystem, logger } = context

    // Register hooks
    hookSystem.register('content:beforeSave', async (data) => {
      // Your logic
      return data
    })

    await logger.info('plugin', 'Plugin activated', { plugin: 'my-plugin' })
  },

  async deactivate(context: PluginContext) {
    const { logger } = context
    await logger.info('plugin', 'Plugin deactivated', { plugin: 'my-plugin' })
  }
}
```

### 4. Register Routes (Optional)

```typescript
// src/plugins/my-plugin/handlers/routes.ts
import { Hono } from 'hono'

export const myPluginRoutes = new Hono()

myPluginRoutes.get('/admin/my-plugin', async (c) => {
  return c.html('<h1>My Plugin</h1>')
})
```

### 5. Rebuild Plugin Registry

```bash
npm run plugins:generate
```

---

## Plugin Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { myPlugin } from './index'

describe('My Plugin', () => {
  it('should activate successfully', async () => {
    const context = createMockContext()
    await myPlugin.activate(context)
    expect(context.logger.info).toHaveBeenCalled()
  })
})
```

### Integration Tests

```typescript
import { test, expect } from '@playwright/test'

test('plugin route works', async ({ page }) => {
  await page.goto('/admin/my-plugin')
  await expect(page.locator('h1')).toContainText('My Plugin')
})
```

---

## Plugin Best Practices

1. **Versioning**: Use semantic versioning (MAJOR.MINOR.PATCH)
2. **Dependencies**: Minimize dependencies, declare them in manifest
3. **Error Handling**: Always handle errors gracefully
4. **Logging**: Use the logger service for all logging
5. **Permissions**: Define granular permissions
6. **Settings**: Provide sensible defaults
7. **Documentation**: Include README.md with usage examples
8. **Testing**: Write comprehensive tests
9. **TypeScript**: Use strict typing
10. **Hooks**: Clean up resources in deactivate hook

---

## Plugin Verification

All 13 plugins have been validated and registered in the plugin registry:

```bash
npm run plugins:generate
```

**Output**:
```
✅ Loaded 13 valid manifests
📝 Generated plugin registry: src/plugins/plugin-registry.ts

Summary:
  - Total plugins: 13
  - Registry file: src/plugins/plugin-registry.ts
  - Core plugins: 4
```

---

## Next Steps

1. **Explore Plugins**: Visit `/admin/plugins` to see all available plugins
2. **Enable Plugins**: Configure which plugins to enable in your project
3. **Customize Settings**: Adjust plugin settings to fit your needs
4. **Create Custom Plugins**: Build your own plugins for custom functionality
5. **Contribute**: Share your plugins with the SonicJS community

---

## Support

- **Documentation**: https://docs.sonicjs.com/plugins
- **Discussions**: https://github.com/sonicjs/sonicjs/discussions
- **Issues**: https://github.com/sonicjs/sonicjs/issues
- **Discord**: https://discord.gg/sonicjs

---

**Last Updated**: October 24, 2025
**Core Version**: 2.0.2
**Total Plugins**: 13
