# SonicJS AI

A modern, TypeScript-first headless CMS built for Cloudflare's edge platform with Hono.js.

## 🚀 Features

- **⚡ Edge-First**: Built specifically for Cloudflare Workers with global performance
- **🔧 Developer-Centric**: Configuration over UI, TypeScript-first approach  
- **🤖 AI-Friendly**: Structured codebase designed for AI-assisted development
- **🔌 Plugin System**: Extensible architecture without core modifications
- **📱 Modern Stack**: Hono.js, TypeScript, D1, R2, and HTMX

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
├── core/           # Core CMS functionality
├── plugins/        # Built-in plugins
├── routes/         # Hono.js route handlers
├── middleware/     # Hono.js middleware
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── templates/      # HTML templates
└── tests/          # Test files
```

## 🔧 Configuration

SonicJS uses a configuration-first approach. Define your content models in TypeScript:

```typescript
// src/config/content-models.ts
export const blogPost = {
  name: 'blog_posts',
  fields: {
    title: { type: 'string', required: true },
    content: { type: 'text' },
    publishedAt: { type: 'datetime' },
    author: { type: 'relation', collection: 'users' }
  }
}
```

## 🚀 Deployment

Deploy to Cloudflare Workers:

```bash
# Deploy to production
npm run deploy

# Deploy with custom environment
wrangler deploy --env production
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