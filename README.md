# SonicJS AI

A modern, TypeScript-first headless CMS built for Cloudflare's edge platform with Hono.js.

## 🚀 Features

### Core Platform
- **⚡ Edge-First**: Built specifically for Cloudflare Workers with global performance
- **🔧 Developer-Centric**: Configuration over UI, TypeScript-first approach  
- **🤖 AI-Friendly**: Structured codebase designed for AI-assisted development
- **🔌 Plugin System**: Extensible architecture without core modifications
- **📱 Modern Stack**: Hono.js, TypeScript, D1, R2, and HTMX

### Advanced Content Management (Stage 5)
- **📝 Rich Text Editor**: TinyMCE integration with customizable toolbars
- **🎛️ Dynamic Fields**: Custom field types (text, number, date, boolean, select, media)
- **📚 Content Versioning**: Complete revision history with restore functionality
- **⏰ Content Scheduling**: Publish/unpublish automation with date controls
- **🔄 Workflow System**: Draft → Review → Published → Archived with role-based permissions
- **💾 Auto-Save**: Automatic content saving every 30 seconds
- **👁️ Live Preview**: Real-time content preview before publishing
- **📋 Content Duplication**: One-click content copying and templates
- **🛡️ XSS Protection**: Comprehensive input validation and HTML escaping

## 🛠 Technology Stack

### Core Framework
- **Hono.js** - Ultrafast web framework for Cloudflare Workers
- **TypeScript** - Strict type safety throughout
- **HTMX** - Enhanced HTML for dynamic interfaces

### Cloudflare Services
- **D1** - SQLite database at the edge
- **R2** - Object storage for media
- **Workers** - Serverless compute runtime
- **KV** - Key-value storage for caching
- **Images API** - Image optimization and transformation

### Development Tools
- **Vitest** - Fast unit testing
- **Playwright** - End-to-end testing
- **Wrangler** - Local development and deployment
- **Drizzle ORM** - Type-safe database queries

## 🏁 Quick Start

### Prerequisites
- Node.js 20+
- Cloudflare account
- Wrangler CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/lane711/sonicjs-ai.git
cd sonicjs-ai

# Install dependencies
npm install

# Set up local development database
npm run db:migrate

# Start development server
npm run dev
```

### Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy

# Database operations
npm run db:generate    # Generate migrations
npm run db:migrate     # Apply migrations
npm run db:studio      # Open database studio
```

## 📁 Project Structure

```
src/
├── routes/           # Hono.js route handlers
│   ├── admin*.ts     # Admin interface routes
│   ├── api*.ts       # REST API endpoints
│   └── auth.ts       # Authentication routes
├── templates/        # HTML templates & components
│   ├── layouts/      # Page layouts (admin, public)
│   ├── pages/        # Full page templates
│   └── components/   # Reusable UI components
├── middleware/       # Hono.js middleware
│   └── auth.ts       # Authentication & authorization
├── utils/           # Utility functions
├── scripts/         # Database & deployment scripts
├── migrations/      # Database migration files
└── tests/           # Unit & integration tests
    └── e2e/         # End-to-end test suites
```

## 🔧 Content Management

### Creating Collections
SonicJS uses a dynamic field system. Create collections through the admin interface or define them in the database:

```sql
-- Example: Blog Posts collection with custom fields
INSERT INTO collections (id, name, display_name, description, schema) VALUES (
  'blog-posts', 'blog_posts', 'Blog Posts', 'Article content collection',
  '{"type":"object","properties":{"title":{"type":"string","required":true}}}'
);

-- Add dynamic fields
INSERT INTO content_fields (collection_id, field_name, field_type, field_label, field_options) VALUES
  ('blog-posts', 'title', 'text', 'Title', '{"maxLength": 200, "required": true}'),
  ('blog-posts', 'content', 'richtext', 'Content', '{"toolbar": "full", "height": 400}'),
  ('blog-posts', 'excerpt', 'text', 'Excerpt', '{"maxLength": 500, "rows": 3}'),
  ('blog-posts', 'featured_image', 'media', 'Featured Image', '{"accept": "image/*"}'),
  ('blog-posts', 'publish_date', 'date', 'Publish Date', '{"defaultToday": true}'),
  ('blog-posts', 'is_featured', 'boolean', 'Featured Post', '{"default": false}');
```

### Field Types
- **text**: Single-line text with validation
- **richtext**: WYSIWYG editor with TinyMCE
- **number**: Numeric input with min/max constraints
- **boolean**: Checkbox with custom labels
- **date**: Date picker with format options
- **select**: Dropdown with single/multi-select
- **media**: File picker with preview

## 🌐 API Endpoints

### Content Management
- `GET /admin/content/new?collection=id` - Create new content form
- `GET /admin/content/:id/edit` - Edit content form
- `POST /admin/content/` - Create content with validation
- `PUT /admin/content/:id` - Update content with versioning
- `DELETE /admin/content/:id` - Delete content

### Advanced Features
- `POST /admin/content/preview` - Preview content before publishing
- `POST /admin/content/duplicate` - Duplicate existing content
- `GET /admin/content/:id/versions` - Get version history
- `POST /admin/content/:id/restore/:version` - Restore specific version
- `GET /admin/content/:id/version/:version/preview` - Preview historical version

### Public API
- `GET /api/content` - Get published content (paginated)
- `GET /api/collections/:collection/content` - Get content by collection
- `GET /api/collections` - List all collections

## 🚀 Deployment

### Development Setup
```bash
# Run database migrations (includes Stage 5 enhancements)
npm run db:migrate

# Apply Stage 5 schema updates
wrangler d1 migrations apply sonicjs-ai --local
```

### Production Deployment
```bash
# Deploy to production
npm run deploy

# Deploy with custom environment
wrangler deploy --env production

# Apply migrations to production database
wrangler d1 migrations apply sonicjs-ai --remote
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## 📚 Documentation

- [Project Plan](docs/project-plan.md) - Development roadmap and stages
- [AI Instructions](docs/ai-instructions.md) - Comprehensive development guidelines
- [Development Guidelines](docs/CLAUDE.md) - Development workflow and principles

## 🔌 Plugin Development

Create plugins for extending SonicJS functionality:

```typescript
// src/plugins/my-plugin/index.ts
import { Plugin } from '@sonicjs/core'

export default {
  name: 'my-plugin',
  hooks: {
    'content:beforeCreate': async (content) => {
      // Plugin logic here
      return content
    }
  }
} as Plugin
```

## 🌟 Why SonicJS AI?

### Edge Performance
- Global distribution via Cloudflare's network
- Sub-100ms response times worldwide
- Automatic scaling and DDoS protection

### Developer Experience  
- TypeScript-first with full type safety
- Hot reload development environment
- Comprehensive CLI tools and generators

### AI-Friendly Architecture
- Clean, structured codebase
- Comprehensive documentation
- Clear conventions and patterns

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## 📞 Support

- [GitHub Issues](https://github.com/lane711/sonicjs-ai/issues)
- [Documentation](docs/)
- [Community Discussions](https://github.com/lane711/sonicjs-ai/discussions)

---

Built with ❤️ for the Cloudflare ecosystem