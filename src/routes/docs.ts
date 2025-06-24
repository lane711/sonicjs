import { Hono } from 'hono'
import { marked } from 'marked'
// import { OpenAPIGenerator } from '../utils/openapi-generator'
import { schemaDefinitions } from '../schemas'
import { renderDocsLayout, NavigationItem } from '../templates/layouts/docs-layout.template'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export const docsRoutes = new Hono<{ Bindings: Bindings }>()

// TODO: Re-enable OpenAPI generator after fixing TypeScript issues
// const openAPIGenerator = new OpenAPIGenerator()
// schemaDefinitions.forEach(schema => {
//   openAPIGenerator.registerSchema(schema)
// })

// Documentation navigation structure
const navigation: NavigationItem[] = [
  { title: 'Home', path: '/docs' },
  { title: 'Getting Started', path: '/docs/getting-started' },
  { title: 'API Reference', path: '/docs/api-reference' },
  {
    title: 'Guides',
    path: '/docs/guides',
    children: [
      { title: 'Content Management', path: '/docs/content-management' },
      { title: 'Authentication', path: '/docs/authentication' },
      { title: 'Deployment', path: '/docs/deployment' }
    ]
  }
]

// Markdown content store (Workers-compatible)
const markdownContent: Record<string, string> = {
  'index.md': `# SonicJS AI Documentation

Welcome to **SonicJS AI** - a modern, AI-powered headless Content Management System built with TypeScript, Hono, and Cloudflare Workers.

## What is SonicJS AI?

SonicJS AI is a next-generation headless CMS that combines the power of modern web technologies with AI capabilities to provide developers with a fast, scalable, and intelligent content management solution.

### Key Features

- 🚀 **Lightning Fast** - Built on Cloudflare Workers for global edge deployment
- 🤖 **AI-Powered** - Intelligent content generation and management
- 🎯 **TypeScript First** - Full type safety throughout the stack
- 📱 **API-Driven** - RESTful APIs with OpenAPI documentation
- 🎨 **Admin Interface** - Beautiful, modern admin dashboard
- 🔒 **Secure** - Built-in authentication and authorization
- 📦 **Media Management** - Advanced file upload and management
- 🗃️ **Database Agnostic** - Powered by Drizzle ORM

## Quick Start

Get started with SonicJS AI in minutes:

\`\`\`bash
# Clone the repository
git clone https://github.com/lane711/sonicjs-ai.git
cd sonicjs-ai

# Install dependencies
npm install

# Set up the database
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
\`\`\`

## Architecture Overview

SonicJS AI is built with a modern, scalable architecture:

- **Frontend**: TypeScript + Hono for server-side rendering
- **Backend**: Cloudflare Workers for serverless execution
- **Database**: D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare R2 for media files
- **Authentication**: Built-in auth system

## Getting Help

- 📚 [Browse the documentation](/docs/getting-started)
- 🔧 [API Reference](/docs/api)
- 💬 [Community Support](https://github.com/lane711/sonicjs-ai/discussions)
- 🐛 [Report Issues](https://github.com/lane711/sonicjs-ai/issues)

## Contributing

We welcome contributions! Please see our [Contributing Guide](/docs/contributing) for more information.

---

Ready to build something amazing? Let's [get started](/docs/getting-started)!`,

  'getting-started.md': `# Getting Started with SonicJS AI

This guide will help you set up and start using SonicJS AI for your content management needs.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **pnpm**
- **Git**
- **Cloudflare account** (for deployment)

## Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/lane711/sonicjs-ai.git
cd sonicjs-ai
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a \`.env\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-secret-key-here"

# Cloudflare (for deployment)
CLOUDFLARE_API_TOKEN="your-api-token"
CLOUDFLARE_ACCOUNT_ID="your-account-id"
\`\`\`

### 4. Database Setup

Generate and run database migrations:

\`\`\`bash
# Generate migration files
npm run db:generate

# Apply migrations locally
npm run db:migrate

# (Optional) Open database studio
npm run db:studio
\`\`\`

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Your SonicJS AI instance will be available at \`http://localhost:8787\`

## First Steps

### 1. Access the Admin Dashboard

Navigate to \`http://localhost:8787/admin\` to access the admin interface.

### 2. Create Your First Content

1. Go to **Content** in the admin navigation
2. Click **"New Content"**
3. Fill in the content details
4. Save your content

### 3. Upload Media Files

1. Go to **Media** in the admin navigation  
2. Drag and drop files or click **"Upload Files"**
3. Manage your media library

### 4. Explore the API

Visit \`http://localhost:8787/docs\` to explore the auto-generated API documentation.

## Available Scripts

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Build for production |
| \`npm run deploy\` | Deploy to Cloudflare |
| \`npm test\` | Run unit tests |
| \`npm run test:e2e\` | Run end-to-end tests |
| \`npm run db:studio\` | Open database management UI |

## Next Steps

- [Learn about Content Management](/docs/content-management)
- [Explore the API](/docs/api-reference)
- [Set up Authentication](/docs/authentication)
- [Deploy to Production](/docs/deployment)

## Troubleshooting

### Common Issues

**Database connection errors:**
- Make sure you've run \`npm run db:migrate\`
- Check that the database file exists

**Port already in use:**
- Stop any existing development servers
- Or change the port in \`wrangler.toml\`

**Dependencies not found:**
- Run \`npm install\` again
- Clear node_modules and reinstall if needed

Need help? Check our [FAQ](/docs/faq) or [open an issue](https://github.com/lane711/sonicjs-ai/issues).`,

  'api-reference.md': `# API Reference

SonicJS AI provides a comprehensive REST API for managing content, media, and other resources programmatically.

## Base URL

\`\`\`
https://your-domain.com/api
\`\`\`

For local development:
\`\`\`
http://localhost:8787/api
\`\`\`

## Authentication

Most API endpoints require authentication. SonicJS AI uses JWT (JSON Web Tokens) for authentication.

### Getting an Access Token

\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
\`\`\`

### Using the Token

Include the token in the Authorization header:

\`\`\`http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## Content Management

### List Content Items

\`\`\`http
GET /api/content
\`\`\`

**Query Parameters:**
- \`page\` (optional): Page number (default: 1)
- \`limit\` (optional): Items per page (default: 10)
- \`type\` (optional): Filter by content type

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": "1",
      "title": "My First Post",
      "slug": "my-first-post",
      "type": "post",
      "status": "published",
      "content": "Lorem ipsum dolor sit amet...",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
\`\`\`

### Get Content Item by ID

\`\`\`http
GET /api/content/{id}
\`\`\`

### Create Content Item

\`\`\`http
POST /api/content
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "type": "post",
  "content": "This is the content of my new blog post...",
  "status": "draft"
}
\`\`\`

### Update Content Item

\`\`\`http
PUT /api/content/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Updated Title",
  "content": "Updated content..."
}
\`\`\`

### Delete Content Item

\`\`\`http
DELETE /api/content/{id}
Authorization: Bearer {token}
\`\`\`

## OpenAPI Specification

For a complete, interactive API reference, visit:
- [Scalar UI](/docs/api) - Modern API documentation
- [Swagger UI](/docs/swagger) - Traditional Swagger interface
- [OpenAPI JSON](/docs/openapi.json) - Raw OpenAPI specification

## Support

- 📖 [View full documentation](/docs)
- 💬 [Community discussions](https://github.com/lane711/sonicjs-ai/discussions)
- 🐛 [Report API issues](https://github.com/lane711/sonicjs-ai/issues)`,

  'content-management.md': `# Content Management

Learn how to create, manage, and organize content in SonicJS AI.

## Understanding Content Types

SonicJS AI supports flexible content types that can be customized for your needs:

### Built-in Content Types

- **Pages** - Static pages like About, Contact, etc.
- **Posts** - Blog posts, news articles, and time-based content
- **Media** - Images, videos, documents, and other files

### Custom Content Types

You can define custom content types by extending the base schema:

\`\`\`typescript
// Example: Product content type
export const productSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  inStock: z.boolean().default(true),
  images: z.array(z.string()).optional()
})
\`\`\`

## Creating Content

### Using the Admin Interface

1. **Navigate to Content** - Go to \`/admin/content\` in your browser
2. **Click "New Content"** - Start creating a new content item
3. **Fill in Details**:
   - **Title**: The main title of your content
   - **Slug**: URL-friendly identifier (auto-generated from title)
   - **Content Type**: Select the appropriate type
   - **Status**: Draft, Published, or Archived
   - **Content**: Rich text content with markdown support

4. **Save or Publish** - Save as draft or publish immediately

### Using the API

Create content programmatically using the REST API:

\`\`\`javascript
const response = await fetch('/api/content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    title: 'My New Article',
    slug: 'my-new-article',
    type: 'post',
    content: '# Welcome\\n\\nThis is my first article...',
    status: 'published'
  })
})

const newContent = await response.json()
\`\`\`

## Rich Text Editing

The admin interface includes a powerful markdown editor with:

### Features
- **Live preview** - See formatted content as you type
- **Syntax highlighting** - Code blocks with syntax highlighting
- **Media insertion** - Drag and drop images directly
- **Table support** - Create and edit tables easily
- **Link management** - Easy linking to internal and external content

## Best Practices

### Content Strategy
1. **Plan your content types** before you start creating content
2. **Use consistent naming** for categories and tags
3. **Write SEO-friendly titles** and descriptions
4. **Organize with clear hierarchies** using collections

### Performance Tips
1. **Optimize images** before uploading
2. **Use appropriate content types** for better organization
3. **Regular content audits** to remove outdated material
4. **Leverage caching** for frequently accessed content

Need more help? Check our [FAQ](/docs/faq) or [contact support](mailto:support@sonicjs.com).`
}

// Helper function to render markdown pages
async function renderMarkdownPage(filePath: string, currentPath: string): Promise<string> {
  try {
    const markdownText = markdownContent[filePath]
    if (!markdownText) {
      throw new Error(`Markdown file ${filePath} not found`)
    }
    
    const htmlContent = await marked(markdownText)
    
    // Extract title from first h1 tag or use filename
    const titleMatch = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/)
    const title = titleMatch?.[1]?.replace(/<[^>]*>/g, '') || filePath.replace('.md', '')
    
    return renderDocsLayout({
      title,
      content: htmlContent,
      currentPath,
      navigation
    })
  } catch (error) {
    console.error('Error rendering markdown page:', error)
    return renderDocsLayout({
      title: 'Not Found',
      content: '<h1>Page Not Found</h1><p>The requested documentation page could not be found.</p>',
      currentPath,
      navigation
    })
  }
}

// Temporary OpenAPI JSON spec
docsRoutes.get('/openapi.json', (c) => {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'SonicJS AI API',
      version: '1.0.0',
      description: 'Auto-generated REST API for SonicJS AI headless CMS'
    },
    servers: [{ url: '/api', description: 'API Server' }],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      schemas: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return c.json(spec)
})

// Documentation routes - handle markdown pages
docsRoutes.get('/', async (c) => {
  const html = await renderMarkdownPage('index.md', '/docs')
  return c.html(html)
})

docsRoutes.get('/getting-started', async (c) => {
  const html = await renderMarkdownPage('getting-started.md', '/docs/getting-started')
  return c.html(html)
})

docsRoutes.get('/api-reference', async (c) => {
  const html = await renderMarkdownPage('api-reference.md', '/docs/api-reference')
  return c.html(html)
})

docsRoutes.get('/content-management', async (c) => {
  const html = await renderMarkdownPage('content-management.md', '/docs/content-management')
  return c.html(html)
})

// API documentation UI routes
docsRoutes.get('/api', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SonicJS AI API Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 0; }
        </style>
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/docs/openapi.json"
          data-configuration='{"theme":"purple"}'
        ></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `)
})

// Alternative Swagger UI
docsRoutes.get('/swagger', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SwaggerUI" />
        <title>SonicJS AI API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js" crossorigin></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: '/docs/openapi.json',
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone,
              ],
              layout: "StandaloneLayout",
            });
          };
        </script>
      </body>
    </html>
  `)
})