import { Hono } from 'hono'
import { marked } from 'marked'
// import { OpenAPIGenerator } from '../utils/openapi-generator'
// import { schemaDefinitions } from '../schemas'
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
    title: 'Core Guides',
    path: '/docs/core',
    children: [
      { title: 'Content Management', path: '/docs/content-management' },
      { title: 'Authentication & Security', path: '/docs/authentication' },
      { title: 'Database & Schema', path: '/docs/database' },
      { title: 'Template System', path: '/docs/templating' }
    ]
  },
  {
    title: 'Development',
    path: '/docs/development',
    children: [
      { title: 'Plugin Development', path: '/docs/plugin-development' },
      { title: 'Testing Guide', path: '/docs/testing' },
      { title: 'Media Management', path: '/docs/media-management' },
      { title: 'Troubleshooting', path: '/docs/troubleshooting' },
      { title: 'Configuration', path: '/docs/configuration' }
    ]
  },
  {
    title: 'Operations',
    path: '/docs/operations',
    children: [
      { title: 'Deployment Guide', path: '/docs/deployment' },
      { title: 'Architecture', path: '/docs/architecture' },
      { title: 'User Guide', path: '/docs/user-guide' }
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

Need more help? Check our [FAQ](/docs/faq) or [contact support](mailto:support@sonicjs.com).`,

  'deployment.md': `# Deployment Guide

This comprehensive guide covers deploying SonicJS AI to production using Cloudflare Workers, D1 database, and R2 storage.

## Overview

SonicJS AI is designed to run on Cloudflare's edge computing platform, providing global distribution and optimal performance:

- **Cloudflare Workers** - Application runtime
- **D1 Database** - SQLite-based edge database  
- **R2 Object Storage** - File and media storage
- **Pages** - Static asset hosting (optional)
- **Analytics** - Performance monitoring

## Prerequisites

### Required Accounts & Tools

1. **Cloudflare Account** with Workers paid plan
2. **Node.js** 18+ and npm/yarn
3. **Wrangler CLI** 3.0+
4. **Git** for version control

### Install Wrangler

\`\`\`bash
npm install -g wrangler@latest
wrangler --version

# Login to Cloudflare
wrangler auth login
\`\`\`

## Environment Setup

### 1. Clone and Install

\`\`\`bash
git clone https://github.com/your-org/sonicjs-ai.git
cd sonicjs-ai
npm install
\`\`\`

### 2. Environment Configuration

Create production environment file:

\`\`\`bash
cp .env.example .env.production
\`\`\`

Edit \`.env.production\`:

\`\`\`bash
# Database
DATABASE_URL="your-d1-database-url"

# Authentication
JWT_SECRET="your-super-secure-256-bit-secret"
JWT_EXPIRES_IN="7d"

# Media Storage
R2_BUCKET_NAME="your-r2-bucket"
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"

# Application
NODE_ENV="production"
APP_URL="https://your-domain.com"
ADMIN_EMAIL="admin@your-domain.com"

# Security
BCRYPT_ROUNDS="12"
RATE_LIMIT_ENABLED="true"
CORS_ORIGIN="https://your-domain.com"
\`\`\`

## Database Deployment

### 1. Create Production Database

\`\`\`bash
# Create D1 database
wrangler d1 create sonicjs-ai-prod

# Note the database ID and update wrangler.toml
\`\`\`

### 2. Run Database Migrations

\`\`\`bash
# Apply schema to production
wrangler d1 execute sonicjs-ai-prod --file=./schema.sql --env=production

# Or run migrations
npm run db:migrate:prod
\`\`\`

## Application Deployment

### 1. Set Production Secrets

\`\`\`bash
# Set JWT secret
echo "your-super-secure-jwt-secret" | wrangler secret put JWT_SECRET --env=production

# Set R2 credentials
echo "your-r2-access-key" | wrangler secret put R2_ACCESS_KEY_ID --env=production
echo "your-r2-secret-key" | wrangler secret put R2_SECRET_ACCESS_KEY --env=production
\`\`\`

### 2. Build and Deploy

\`\`\`bash
# Build for production
npm run build

# Deploy to production
wrangler deploy --env=production

# Verify deployment
curl https://your-worker.your-subdomain.workers.dev/health
\`\`\`

## Domain Configuration

### 1. Add Custom Domain

\`\`\`bash
# Add route to wrangler.toml
route = "your-domain.com/*"

# Or add via Cloudflare dashboard:
# Workers & Pages > your-worker > Settings > Triggers > Custom Domains
\`\`\`

### 2. DNS Configuration

In Cloudflare DNS settings:

\`\`\`
Type: AAAA
Name: @
Content: 100::
Proxy: Enabled (Orange Cloud)

Type: AAAA  
Name: www
Content: 100::
Proxy: Enabled (Orange Cloud)
\`\`\`

## Security & SSL

SSL is automatically handled by Cloudflare:

- **Universal SSL** is enabled by default
- **Full (Strict)** encryption mode recommended
- **HSTS** headers are automatically added

## Environment Variables

### Production Environment Variables

\`\`\`bash
# Application
NODE_ENV=production
APP_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com

# Database
DATABASE_URL=your-d1-connection-string

# Authentication  
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# File Storage
R2_BUCKET_NAME=your-media-bucket
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key

# Security
RATE_LIMIT_ENABLED=true
CORS_ORIGIN=https://your-domain.com
\`\`\`

## Monitoring & Analytics

Enable analytics in Cloudflare dashboard:

- **Real User Monitoring (RUM)**
- **Core Web Vitals**
- **Security insights**
- **Performance metrics**

## Backup & Recovery

### Database Backup

\`\`\`bash
# Export database
wrangler d1 export sonicjs-ai-prod --output=backup-$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
wrangler d1 export sonicjs-ai-prod --output=backups/db-backup-$DATE.sql
\`\`\`

## Troubleshooting

### Common Issues

#### Database Connection Errors

\`\`\`bash
# Check D1 binding
wrangler d1 list

# Verify database ID in wrangler.toml
# Test connection
wrangler d1 execute sonicjs-ai-prod --command="SELECT 1" --env=production
\`\`\`

#### Secret Variables Not Found

\`\`\`bash
# List secrets
wrangler secret list --env=production

# Re-add missing secrets
echo "your-secret" | wrangler secret put SECRET_NAME --env=production
\`\`\`

### Performance Issues

\`\`\`bash
# View Worker logs
wrangler tail --env=production

# Check deployment status
wrangler deployments list --env=production
\`\`\`

## Post-Deployment Checklist

- [ ] Application responds at custom domain
- [ ] SSL certificate is valid and active
- [ ] Database connection successful
- [ ] Authentication system working
- [ ] Media upload functionality operational
- [ ] Admin panel accessible
- [ ] Health check endpoint responding
- [ ] Error monitoring configured
- [ ] Backup system operational

## Related Documentation

- [Getting Started](/docs/getting-started) - Initial setup and development
- [Authentication](/docs/authentication) - Security configuration
- [Database](/docs/database) - Database management
- [Testing](/docs/testing) - Testing in production environments

For detailed deployment instructions, see the complete [deployment documentation](https://github.com/your-org/sonicjs-ai/blob/main/docs/deployment.md).`,

  'media-management.md': `# Media Management

SonicJS AI provides comprehensive media management capabilities with Cloudflare R2 storage, image optimization, and advanced file handling features.

## Overview

The media management system is built for scalability and performance:

- **Cloudflare R2** - Primary storage backend
- **Cloudflare Images** - Automatic optimization and transformation
- **CDN Delivery** - Global edge caching
- **File Organization** - Folder structure and metadata
- **Security** - Upload validation and access control

## Getting Started

### Upload Files

#### Via Admin Interface

1. Navigate to **Media Library** in the admin panel
2. Drag and drop files or click **Upload Files**
3. Files are automatically processed and stored
4. View, edit, or organize your media

#### Via API

\`\`\`javascript
// Upload via form data
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('folder', 'uploads/images')

const response = await fetch('/api/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`
  },
  body: formData
})

const result = await response.json()
console.log('Upload result:', result)
\`\`\`

### Supported File Types

#### Images
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)
- **GIF** (.gif)
- **SVG** (.svg)

#### Documents
- **PDF** (.pdf)
- **Text** (.txt, .md)
- **Word** (.doc, .docx)
- **Excel** (.xls, .xlsx)

#### Audio & Video
- **MP4** (.mp4)
- **WebM** (.webm)
- **MP3** (.mp3)
- **WAV** (.wav)

## File Organization

### Folder Structure

\`\`\`
/media/
├── uploads/
│   ├── images/
│   │   ├── 2024/01/
│   │   └── thumbnails/
│   ├── documents/
│   └── videos/
├── system/
│   ├── avatars/
│   └── logos/
└── temp/
    └── processing/
\`\`\`

### Creating Folders

\`\`\`javascript
// Create new folder
const response = await fetch('/api/media/folders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    name: 'New Folder',
    parent: '/uploads/images'
  })
})
\`\`\`

## Image Processing

### Automatic Optimization

All uploaded images are automatically:

- **Compressed** - Reduced file size without quality loss
- **Formatted** - Converted to optimal format (WebP when supported)
- **Resized** - Multiple sizes generated for responsive delivery
- **Cached** - Stored at edge locations globally

### Image Variants

\`\`\`javascript
// Request different image sizes
const variants = {
  thumbnail: 'https://media.yoursite.com/image.jpg?w=150&h=150',
  medium: 'https://media.yoursite.com/image.jpg?w=800&h=600',
  large: 'https://media.yoursite.com/image.jpg?w=1200&h=900',
  original: 'https://media.yoursite.com/image.jpg'
}
\`\`\`

### Transformation Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| \`w\` | Width in pixels | \`?w=800\` |
| \`h\` | Height in pixels | \`?h=600\` |
| \`fit\` | Resize mode | \`?fit=cover\` |
| \`format\` | Output format | \`?format=webp\` |
| \`quality\` | Compression quality | \`?quality=85\` |

## API Reference

### Upload Files

\`\`\`http
POST /api/media/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Fields:
- file: File to upload
- folder: Target folder (optional)
- alt: Alt text for images (optional)
- title: File title (optional)
\`\`\`

### Get Media List

\`\`\`http
GET /api/media
Authorization: Bearer {token}

Query Parameters:
- folder: Filter by folder
- type: Filter by file type
- limit: Items per page (default: 20)
- page: Page number (default: 1)
\`\`\`

### Get File Details

\`\`\`http
GET /api/media/{id}
Authorization: Bearer {token}
\`\`\`

### Update File Metadata

\`\`\`http
PUT /api/media/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Updated Title",
  "alt": "New alt text",
  "description": "File description"
}
\`\`\`

### Delete Files

\`\`\`http
DELETE /api/media/{id}
Authorization: Bearer {token}
\`\`\`

## Security & Permissions

### Upload Validation

- **File size limits** - Configurable per file type
- **MIME type checking** - Prevents malicious file uploads
- **Virus scanning** - Optional integration with security services
- **Content scanning** - Automatic inappropriate content detection

### Access Control

\`\`\`typescript
// Role-based media permissions
const mediaPermissions = {
  admin: ['create', 'read', 'update', 'delete'],
  editor: ['create', 'read', 'update'],
  author: ['create', 'read'],
  viewer: ['read']
}
\`\`\`

### Private Files

\`\`\`javascript
// Upload private file
const response = await fetch('/api/media/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'X-Private': 'true'  // Require authentication to access
  }
})
\`\`\`

## Performance Optimization

### CDN Configuration

All media files are automatically served through Cloudflare's global CDN:

- **Edge caching** - Files cached at 300+ locations worldwide
- **Smart routing** - Optimal path selection for fastest delivery
- **Compression** - Automatic Gzip/Brotli compression
- **HTTP/2 & HTTP/3** - Modern protocol support

### Lazy Loading

\`\`\`html
<!-- Implement lazy loading for images -->
<img 
  src="placeholder.jpg"
  data-src="https://media.yoursite.com/image.jpg?w=800" 
  alt="Image description"
  loading="lazy"
  class="lazy-image"
>
\`\`\`

### Progressive Images

\`\`\`javascript
// Progressive JPEG loading
const img = new Image()
img.onload = () => {
  // Replace placeholder with full image
  element.src = img.src
}
img.src = 'https://media.yoursite.com/image.jpg?progressive=true'
\`\`\`

## Integration Examples

### React Component

\`\`\`jsx
import { useState, useEffect } from 'react'

function MediaPicker({ onSelect, folder = 'uploads' }) {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMedia()
  }, [folder])

  const fetchMedia = async () => {
    try {
      const response = await fetch(\`/api/media?folder=\${folder}\`)
      const data = await response.json()
      setMedia(data.files)
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading media...</div>

  return (
    <div className="media-grid">
      {media.map(file => (
        <div 
          key={file.id} 
          className="media-item"
          onClick={() => onSelect(file)}
        >
          <img 
            src={\`\${file.url}?w=200&h=200&fit=cover\`}
            alt={file.alt || file.title}
          />
          <p>{file.title}</p>
        </div>
      ))}
    </div>
  )
}
\`\`\`

### Content Integration

\`\`\`javascript
// Insert media into rich text content
function insertMedia(mediaFile) {
  const mediaTag = mediaFile.type.startsWith('image/')
    ? \`<img src="\${mediaFile.url}" alt="\${mediaFile.alt}" />\`
    : \`<a href="\${mediaFile.url}" download>\${mediaFile.title}</a>\`
  
  // Insert into editor
  editor.insertContent(mediaTag)
}
\`\`\`

## Troubleshooting

### Common Issues

#### Upload Fails

\`\`\`bash
# Check file size limits
curl -I -X POST /api/media/upload

# Verify authentication
curl -H "Authorization: Bearer your-token" /api/media
\`\`\`

#### Images Not Loading

\`\`\`bash
# Check R2 bucket permissions
wrangler r2 bucket list

# Verify CDN configuration
curl -I https://media.yoursite.com/test-image.jpg
\`\`\`

#### Slow Loading Times

1. **Enable CDN caching** - Check cache headers
2. **Optimize images** - Use appropriate formats and compression
3. **Implement lazy loading** - Load images only when needed
4. **Use responsive images** - Serve appropriate sizes

### Performance Monitoring

\`\`\`javascript
// Monitor upload performance
console.time('upload')
await uploadFile(file)
console.timeEnd('upload')

// Track image load times
const img = new Image()
const startTime = performance.now()
img.onload = () => {
  const loadTime = performance.now() - startTime
  console.log(\`Image loaded in \${loadTime}ms\`)
}
\`\`\`

## Best Practices

### File Organization
1. **Use descriptive names** - Avoid generic filenames
2. **Organize by date/type** - Maintain consistent folder structure
3. **Clean up regularly** - Remove unused files
4. **Tag appropriately** - Use metadata for better searchability

### Performance
1. **Optimize before upload** - Compress images when possible
2. **Use WebP format** - Better compression than JPEG/PNG
3. **Generate thumbnails** - Don't load full-size images for previews
4. **Implement caching** - Cache file metadata and directory listings

### Security
1. **Validate file types** - Never trust client-side validation
2. **Scan for malware** - Implement virus scanning for uploads
3. **Limit file sizes** - Prevent abuse and storage issues
4. **Use signed URLs** - For private or temporary access

## Related Documentation

- [API Reference](/docs/api-reference) - Complete API documentation
- [Authentication](/docs/authentication) - Security and permissions
- [Configuration](/docs/configuration) - Media settings and limits
- [Deployment](/docs/deployment) - R2 and CDN setup`,

  'troubleshooting.md': `# Troubleshooting Guide

This comprehensive guide helps you diagnose and resolve common issues with SonicJS AI deployment, development, and production environments.

## General Troubleshooting

### Quick Diagnostics

\`\`\`bash
# Check system health
curl https://your-domain.com/health

# Check authentication
curl -H "Authorization: Bearer your-token" https://your-domain.com/api/auth/me

# Check database connection
wrangler d1 execute your-db --command="SELECT 1" --env=production
\`\`\`

### Log Analysis

\`\`\`bash
# View real-time logs
wrangler tail --env=production

# Filter error logs
wrangler tail --env=production | grep ERROR

# View specific time range
wrangler tail --env=production --since=1h
\`\`\`

## Development Issues

### Build Errors

#### TypeScript Compilation Failures

**Error**: \`tsc: Command not found\`
\`\`\`bash
# Install TypeScript globally
npm install -g typescript

# Or use local TypeScript
npx tsc --version
\`\`\`

**Error**: \`Cannot resolve module 'node:fs'\`
\`\`\`typescript
// Use Node.js compatibility for Cloudflare Workers
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
\`\`\`

**Error**: \`Type errors in strict mode\`
\`\`\`typescript
// Fix common type issues
interface User {
  id: string
  email: string
  name?: string  // Optional properties
}

// Use proper type guards
if (user && typeof user.id === 'string') {
  console.log(user.id)
}
\`\`\`

#### Wrangler Configuration Issues

**Error**: \`wrangler dev fails to start\`
\`\`\`bash
# Check wrangler.toml syntax
wrangler config

# Clear cache and restart
rm -rf .wrangler
wrangler dev
\`\`\`

**Error**: \`D1 database not found\`
\`\`\`toml
# Verify wrangler.toml configuration
[[d1_databases]]
binding = "DB"
database_name = "your-database"
database_id = "your-database-id"
\`\`\`

### Database Issues

#### Migration Failures

**Error**: \`Migration file not found\`
\`\`\`bash
# Generate migration
npm run db:generate

# Apply migrations
npm run db:migrate
\`\`\`

**Error**: \`Column already exists\`
\`\`\`sql
-- Use IF NOT EXISTS for safe migrations
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
\`\`\`

#### Connection Issues

**Error**: \`Database connection timeout\`
\`\`\`typescript
// Implement connection retry logic
async function connectWithRetry(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await db.select().from(users).limit(1)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
\`\`\`

## Authentication Issues

### JWT Token Problems

**Error**: \`Invalid token signature\`
\`\`\`bash
# Verify JWT secret is consistent
echo "your-jwt-secret" | wrangler secret put JWT_SECRET --env=production

# Check token generation
node -e "console.log(require('jsonwebtoken').sign({id:'test'}, 'your-secret'))"
\`\`\`

**Error**: \`Token expired\`
\`\`\`typescript
// Implement token refresh
async function refreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true })
    return jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: '7d' })
  } catch (error) {
    throw new Error('Invalid token')
  }
}
\`\`\`

### Session Issues

**Error**: \`Session not persisting\`
\`\`\`typescript
// Check cookie settings
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}
\`\`\`

**Error**: \`CORS blocking authentication\`
\`\`\`typescript
// Configure CORS properly
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}
\`\`\`

## API Issues

### Request Failures

**Error**: \`404 Not Found\`
\`\`\`bash
# Check route registration
curl -X GET https://your-domain.com/api/routes

# Verify endpoint exists
grep -r "route-path" src/routes/
\`\`\`

**Error**: \`500 Internal Server Error\`
\`\`\`bash
# Check server logs
wrangler tail --env=production | grep -A 5 -B 5 "500"

# Enable debug logging
export DEBUG=true
wrangler dev
\`\`\`

### Validation Errors

**Error**: \`Request validation failed\`
\`\`\`typescript
// Add proper error handling
try {
  const validatedData = schema.parse(requestData)
} catch (error) {
  if (error instanceof z.ZodError) {
    return c.json({
      error: 'Validation failed',
      details: error.errors
    }, 400)
  }
  throw error
}
\`\`\`

**Error**: \`MIME type not allowed\`
\`\`\`typescript
// Configure allowed file types
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]

if (!allowedMimeTypes.includes(file.type)) {
  throw new Error(\`File type \${file.type} not allowed\`)
}
\`\`\`

## Media & File Issues

### Upload Failures

**Error**: \`File upload timeout\`
\`\`\`typescript
// Increase timeout for large files
const uploadOptions = {
  timeout: 60000, // 60 seconds
  maxSize: 50 * 1024 * 1024 // 50MB
}
\`\`\`

**Error**: \`R2 bucket access denied\`
\`\`\`bash
# Check R2 credentials
wrangler r2 bucket list

# Verify bucket permissions
wrangler r2 object get your-bucket/test-file.txt
\`\`\`

### Image Processing Issues

**Error**: \`Image transformation failed\`
\`\`\`typescript
// Add fallback for unsupported formats
async function processImage(file: File) {
  try {
    return await transformImage(file)
  } catch (error) {
    console.warn('Image transformation failed, using original:', error)
    return file
  }
}
\`\`\`

**Error**: \`CDN cache not updating\`
\`\`\`bash
# Purge CDN cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/your-zone/purge_cache" \\
  -H "Authorization: Bearer your-api-token" \\
  -H "Content-Type: application/json" \\
  --data '{"purge_everything":true}'
\`\`\`

## Performance Issues

### Slow Response Times

**Problem**: API responses taking >2 seconds

**Diagnosis**:
\`\`\`bash
# Measure response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/endpoint

# Check database query performance
wrangler d1 execute your-db --command="EXPLAIN QUERY PLAN SELECT * FROM content"
\`\`\`

**Solutions**:
\`\`\`typescript
// Add database indexes
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_created ON content(created_at);

// Implement caching
const cached = await cache.get('key')
if (cached) return cached

const result = await expensiveOperation()
await cache.set('key', result, { ttl: 300 })
\`\`\`

### Memory Issues

**Error**: \`Worker exceeded memory limit\`
\`\`\`typescript
// Optimize memory usage
function processLargeData(data: any[]) {
  // Process in chunks instead of all at once
  const chunkSize = 100
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    processChunk(chunk)
  }
}
\`\`\`

**Error**: \`CPU time limit exceeded\`
\`\`\`typescript
// Break up long-running operations
async function processWithBreaks(items: any[]) {
  for (let i = 0; i < items.length; i++) {
    await processItem(items[i])
    
    // Allow other events to process
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
}
\`\`\`

## Deployment Issues

### Cloudflare Workers

**Error**: \`Deployment failed\`
\`\`\`bash
# Check build output
npm run build 2>&1 | tee build.log

# Verify bundle size
ls -la dist/
\`\`\`

**Error**: \`Environment variables not found\`
\`\`\`bash
# List current secrets
wrangler secret list --env=production

# Add missing secrets
echo "secret-value" | wrangler secret put SECRET_NAME --env=production
\`\`\`

### DNS & Domain Issues

**Error**: \`Custom domain not working\`
\`\`\`bash
# Check DNS propagation
dig your-domain.com
nslookup your-domain.com

# Verify route configuration
wrangler routes list
\`\`\`

**Error**: \`SSL certificate issues\`
\`\`\`bash
# Check certificate status
curl -I https://your-domain.com

# Force SSL renewal (Cloudflare dashboard)
# SSL/TLS > Edge Certificates > Always Use HTTPS
\`\`\`

## Error Codes Reference

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid JSON, missing fields |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Route doesn't exist |
| 422 | Unprocessable | Validation errors |
| 500 | Server Error | Uncaught exceptions |
| 503 | Service Unavailable | Database connection issues |

### Database Error Codes

| Error | Cause | Solution |
|-------|-------|----------|
| SQLITE_BUSY | Database locked | Implement retry logic |
| SQLITE_CONSTRAINT | Constraint violation | Check unique fields |
| SQLITE_NOTFOUND | Record not found | Add existence checks |

## Monitoring & Debugging

### Health Checks

\`\`\`typescript
// Comprehensive health check
app.get('/health', async (c) => {
  const checks = {
    database: await checkDatabase(),
    auth: await checkAuth(),
    storage: await checkStorage(),
    external: await checkExternalServices()
  }
  
  const isHealthy = Object.values(checks).every(Boolean)
  
  return c.json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks
  }, isHealthy ? 200 : 503)
})
\`\`\`

### Error Tracking

\`\`\`typescript
// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: c.req.url,
    method: c.req.method,
    timestamp: new Date().toISOString()
  })
  
  return c.json({
    error: 'Internal server error',
    id: generateErrorId()
  }, 500)
})
\`\`\`

### Performance Monitoring

\`\`\`typescript
// Request timing middleware
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  
  console.log(\`\${c.req.method} \${c.req.url} - \${duration}ms\`)
  
  if (duration > 1000) {
    console.warn('Slow request detected:', {
      url: c.req.url,
      duration,
      timestamp: new Date().toISOString()
    })
  }
})
\`\`\`

## Getting Help

### Community Resources

- **GitHub Issues**: [Report bugs and request features](https://github.com/lane711/sonicjs-ai/issues)
- **Discussions**: [Community support and questions](https://github.com/lane711/sonicjs-ai/discussions)
- **Documentation**: [Complete documentation](/docs)

### Debug Information to Include

When reporting issues, please include:

1. **Environment details** (Node.js version, OS, Wrangler version)
2. **Error messages** (full stack traces)
3. **Configuration** (wrangler.toml, package.json excerpts)
4. **Steps to reproduce** (minimal example)
5. **Expected vs actual behavior**

### Emergency Procedures

#### Service Outage

\`\`\`bash
# Quick rollback
wrangler rollback --deployment-id=previous-deployment-id

# Check service status
curl -I https://your-domain.com/health

# Enable maintenance mode
echo "true" | wrangler secret put MAINTENANCE_MODE
\`\`\`

#### Data Recovery

\`\`\`bash
# Export current database
wrangler d1 export your-db --output=emergency-backup.sql

# Restore from backup
wrangler d1 execute your-db --file=backup.sql
\`\`\`

This troubleshooting guide covers the most common issues. For complex problems, consider creating a minimal reproduction case and reaching out to the community for assistance.`,

  'configuration.md': `# Configuration Reference

This guide covers all configuration options for SonicJS AI, including environment variables, application settings, and deployment configurations.

## Overview

SonicJS AI uses multiple configuration layers:

- **Environment Variables** - Runtime configuration
- **wrangler.toml** - Cloudflare Workers configuration  
- **Application Config** - Feature toggles and settings
- **Database Schema** - Dynamic configuration storage

## Environment Variables

### Core Application

\`\`\`bash
# Application Environment
NODE_ENV=production                    # Environment: development, production
APP_NAME="SonicJS AI"                 # Application name
APP_URL="https://your-domain.com"     # Base application URL
APP_VERSION="1.0.0"                   # Application version

# Server Configuration
PORT=8787                             # Development server port
HOST="0.0.0.0"                       # Server host binding
WORKERS_DEV=false                     # Disable .workers.dev subdomain
\`\`\`

### Database Configuration

\`\`\`bash
# Database Connection
DATABASE_URL="file:./dev.db"          # Local development database
DB_POOL_SIZE=10                       # Connection pool size
DB_TIMEOUT=30000                      # Query timeout (ms)
DB_DEBUG=false                        # Enable query logging

# Migration Settings
DB_MIGRATIONS_DIR="./migrations"      # Migration files directory
DB_SEED_DATA=true                     # Enable seed data in development
\`\`\`

### Authentication & Security

\`\`\`bash
# JWT Configuration
JWT_SECRET="your-256-bit-secret-key"  # JWT signing secret (REQUIRED)
JWT_EXPIRES_IN="7d"                   # Token expiration
JWT_ISSUER="sonicjs-ai"              # Token issuer
JWT_AUDIENCE="sonicjs-users"         # Token audience

# Password Security
BCRYPT_ROUNDS=12                      # Password hashing rounds
PASSWORD_MIN_LENGTH=8                 # Minimum password length
PASSWORD_REQUIRE_SPECIAL=true         # Require special characters

# Session Management
SESSION_COOKIE_NAME="sonicjs-session" # Session cookie name
SESSION_MAX_AGE=604800000             # Session duration (ms)
SESSION_SECURE=true                   # Secure cookies (HTTPS only)
SESSION_SAME_SITE="lax"              # SameSite cookie policy
\`\`\`

### File Storage & Media

\`\`\`bash
# Cloudflare R2 Configuration
R2_BUCKET_NAME="your-media-bucket"    # R2 bucket name
R2_ACCOUNT_ID="your-account-id"       # Cloudflare account ID
R2_ACCESS_KEY_ID="your-access-key"    # R2 access key
R2_SECRET_ACCESS_KEY="your-secret"    # R2 secret key
R2_REGION="auto"                      # R2 region

# Media Settings
MEDIA_MAX_FILE_SIZE=52428800          # Max file size (50MB)
MEDIA_ALLOWED_TYPES="image/*,application/pdf" # Allowed MIME types
MEDIA_UPLOAD_PATH="/uploads"          # Upload directory
MEDIA_CDN_URL="https://media.yoursite.com" # CDN base URL

# Image Processing
IMAGE_QUALITY=85                      # Default image quality
IMAGE_AUTO_OPTIMIZE=true              # Enable auto-optimization
IMAGE_GENERATE_WEBP=true              # Generate WebP variants
IMAGE_MAX_WIDTH=2048                  # Maximum image width
IMAGE_MAX_HEIGHT=2048                 # Maximum image height
\`\`\`

### Email Configuration

\`\`\`bash
# Email Service
EMAIL_PROVIDER="sendgrid"             # Email provider (sendgrid, ses, smtp)
EMAIL_FROM="noreply@yoursite.com"     # Default sender email
EMAIL_FROM_NAME="SonicJS AI"          # Default sender name

# SendGrid Configuration
SENDGRID_API_KEY="your-sendgrid-key"  # SendGrid API key
SENDGRID_TEMPLATE_ID="template-id"    # Default template

# SMTP Configuration (alternative)
SMTP_HOST="smtp.gmail.com"            # SMTP server
SMTP_PORT=587                         # SMTP port
SMTP_USER="your-email@gmail.com"      # SMTP username
SMTP_PASS="your-app-password"         # SMTP password
SMTP_SECURE=true                      # Use TLS
\`\`\`

### Features & Integrations

\`\`\`bash
# Feature Flags
ENABLE_REGISTRATION=true              # Allow user registration
ENABLE_PASSWORD_RESET=true            # Enable password reset
ENABLE_EMAIL_VERIFICATION=true        # Require email verification
ENABLE_2FA=false                      # Two-factor authentication
ENABLE_AUDIT_LOG=true                 # User activity logging

# API Configuration
API_RATE_LIMIT=1000                   # Requests per hour per IP
API_ENABLE_DOCS=true                  # Enable API documentation
API_CORS_ORIGIN="*"                   # CORS allowed origins
API_MAX_REQUEST_SIZE=10485760         # Max request size (10MB)

# Content Management
CONTENT_AUTO_SAVE=true                # Auto-save drafts
CONTENT_REVISION_LIMIT=10             # Max revisions per content
CONTENT_EXCERPT_LENGTH=160            # Auto-excerpt length
CONTENT_SLUG_SEPARATOR="-"            # Slug separator character

# Search Configuration
SEARCH_PROVIDER="internal"            # Search provider (internal, algolia)
SEARCH_INDEX_NAME="sonicjs"           # Search index name
SEARCH_MIN_QUERY_LENGTH=3             # Minimum search query length
\`\`\`

## Wrangler Configuration

### Basic Configuration

\`\`\`toml
# wrangler.toml
name = "sonicjs-ai"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Account and zone configuration
account_id = "your-cloudflare-account-id"
zone_id = "your-zone-id"

# Worker configuration
workers_dev = false
route = "your-domain.com/*"

# Build configuration
[build]
command = "npm run build"
cwd = "."
watch_dir = "src"

# Asset configuration
[assets]
directory = "./public"
binding = "ASSETS"
\`\`\`

### Environment-Specific Configuration

\`\`\`toml
# Development environment
[env.development]
name = "sonicjs-ai-dev"
route = "dev.your-domain.com/*"

[env.development.vars]
NODE_ENV = "development"
API_ENABLE_DOCS = "true"
DB_DEBUG = "true"

# Staging environment
[env.staging]
name = "sonicjs-ai-staging"
route = "staging.your-domain.com/*"

[env.staging.vars]
NODE_ENV = "staging"
API_ENABLE_DOCS = "true"

# Production environment
[env.production]
name = "sonicjs-ai-production"
route = "your-domain.com/*"

[env.production.vars]
NODE_ENV = "production"
API_ENABLE_DOCS = "false"
\`\`\`

### Service Bindings

\`\`\`toml
# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "sonicjs-ai-db"
database_id = "your-database-id"
preview_database_id = "your-preview-db-id"

# R2 Storage binding
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "sonicjs-ai-media"
preview_bucket_name = "sonicjs-ai-media-preview"

# KV Storage binding
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-id"

# Queue binding
[[queues]]
binding = "EMAIL_QUEUE"
queue = "email-processing"

# Analytics binding
[analytics_engine_datasets]
binding = "ANALYTICS"
dataset = "sonicjs_analytics"
\`\`\`

## Application Configuration

### Feature Configuration

\`\`\`typescript
// src/config/features.ts
export const features = {
  // Authentication features
  auth: {
    registration: process.env.ENABLE_REGISTRATION === 'true',
    passwordReset: process.env.ENABLE_PASSWORD_RESET === 'true',
    emailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    twoFactor: process.env.ENABLE_2FA === 'true',
    socialLogin: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      github: !!process.env.GITHUB_CLIENT_ID,
    }
  },

  // Content management features
  content: {
    autoSave: process.env.CONTENT_AUTO_SAVE === 'true',
    versioning: true,
    comments: process.env.ENABLE_COMMENTS === 'true',
    workflow: process.env.ENABLE_WORKFLOW === 'true',
  },

  // Media features
  media: {
    imageOptimization: process.env.IMAGE_AUTO_OPTIMIZE === 'true',
    videoProcessing: process.env.ENABLE_VIDEO_PROCESSING === 'true',
    cdn: !!process.env.MEDIA_CDN_URL,
  },

  // API features
  api: {
    docs: process.env.API_ENABLE_DOCS === 'true',
    rateLimit: process.env.API_RATE_LIMIT ? parseInt(process.env.API_RATE_LIMIT) : 1000,
    cors: process.env.API_CORS_ORIGIN || '*',
  }
}
\`\`\`

### Database Configuration

\`\`\`typescript
// src/config/database.ts
export const dbConfig = {
  url: process.env.DATABASE_URL || 'file:./dev.db',
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
  timeout: parseInt(process.env.DB_TIMEOUT || '30000'),
  debug: process.env.DB_DEBUG === 'true',
  
  migrations: {
    directory: process.env.DB_MIGRATIONS_DIR || './migrations',
    tableName: 'migrations',
  },
  
  seeds: {
    enabled: process.env.DB_SEED_DATA === 'true',
    directory: './seeds',
  }
}
\`\`\`

### Media Configuration

\`\`\`typescript
// src/config/media.ts
export const mediaConfig = {
  storage: {
    provider: 'r2', // 'r2' | 'local' | 's3'
    bucket: process.env.R2_BUCKET_NAME,
    region: process.env.R2_REGION || 'auto',
    cdnUrl: process.env.MEDIA_CDN_URL,
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MEDIA_MAX_FILE_SIZE || '52428800'), // 50MB
    allowedTypes: process.env.MEDIA_ALLOWED_TYPES?.split(',') || ['image/*'],
    path: process.env.MEDIA_UPLOAD_PATH || '/uploads',
  },
  
  image: {
    quality: parseInt(process.env.IMAGE_QUALITY || '85'),
    autoOptimize: process.env.IMAGE_AUTO_OPTIMIZE === 'true',
    generateWebP: process.env.IMAGE_GENERATE_WEBP === 'true',
    maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH || '2048'),
    maxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT || '2048'),
    
    variants: {
      thumbnail: { width: 150, height: 150, fit: 'cover' },
      medium: { width: 800, height: 600, fit: 'inside' },
      large: { width: 1200, height: 900, fit: 'inside' },
    }
  }
}
\`\`\`

## Security Configuration

### CORS Settings

\`\`\`typescript
// src/config/cors.ts
const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
}
\`\`\`

### Rate Limiting

\`\`\`typescript
// src/config/rateLimit.ts
const rateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.API_RATE_LIMIT || '1000'),
  
  // Different limits for different endpoints
  endpoints: {
    '/api/auth/login': { max: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
    '/api/auth/register': { max: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
    '/api/media/upload': { max: 50, windowMs: 60 * 60 * 1000 }, // 50 per hour
  },
  
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}
\`\`\`

## Deployment Configurations

### Development

\`\`\`bash
# .env.development
NODE_ENV=development
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret-key
API_ENABLE_DOCS=true
DB_DEBUG=true
ENABLE_REGISTRATION=true
\`\`\`

### Staging

\`\`\`bash
# .env.staging
NODE_ENV=staging
DATABASE_URL=staging-db-url
JWT_SECRET=staging-secret-key
API_ENABLE_DOCS=true
DB_DEBUG=false
EMAIL_PROVIDER=sendgrid
\`\`\`

### Production

\`\`\`bash
# .env.production (secrets managed via Wrangler)
NODE_ENV=production
API_ENABLE_DOCS=false
DB_DEBUG=false
SESSION_SECURE=true
BCRYPT_ROUNDS=12
API_RATE_LIMIT=500
\`\`\`

## Configuration Validation

### Environment Validation

\`\`\`typescript
// src/config/validation.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  DATABASE_URL: z.string().url().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
})

export function validateConfig() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('Configuration validation failed:', error)
    process.exit(1)
  }
}
\`\`\`

### Runtime Configuration

\`\`\`typescript
// src/config/index.ts
export class Config {
  private static instance: Config
  private config: Record<string, any> = {}

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config()
    }
    return Config.instance
  }

  get(key: string, defaultValue?: any): any {
    return this.config[key] ?? process.env[key] ?? defaultValue
  }

  set(key: string, value: any): void {
    this.config[key] = value
  }

  load(): void {
    // Load configuration from database
    this.loadDatabaseConfig()
    
    // Validate required settings
    this.validateRequiredSettings()
  }

  private async loadDatabaseConfig(): Promise<void> {
    try {
      // Load settings from database
      const settings = await getSettings()
      this.config = { ...this.config, ...settings }
    } catch (error) {
      console.warn('Failed to load database configuration:', error)
    }
  }
}
\`\`\`

## Configuration Best Practices

### Security

1. **Use environment variables** for sensitive data
2. **Validate configuration** on startup
3. **Use different secrets** for each environment
4. **Rotate secrets regularly**
5. **Never commit secrets** to version control

### Performance

1. **Cache configuration** to avoid repeated reads
2. **Use appropriate data types** (numbers vs strings)
3. **Set reasonable defaults** for optional settings
4. **Monitor configuration changes** in production

### Maintainability

1. **Document all settings** with comments
2. **Group related settings** logically
3. **Use consistent naming** conventions
4. **Provide examples** for complex configurations

## Related Documentation

- [Deployment Guide](/docs/deployment) - Production deployment setup
- [Authentication](/docs/authentication) - Security configuration details
- [Media Management](/docs/media-management) - File storage configuration
- [Troubleshooting](/docs/troubleshooting) - Configuration-related issues`,

  'architecture.md': `# Architecture Documentation

SonicJS AI is built with a modern, cloud-native architecture leveraging Cloudflare's edge computing platform. This document provides a comprehensive overview of the system architecture, design decisions, and technical implementation.

## System Overview

### High-Level Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Admin Panel   │    │   Public Site   │
│  (React/Vue)    │    │    (HTMX)       │    │   (Static)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Cloudflare     │
                    │  Edge Network   │
                    └─────────┬───────┘
                              │
                 ┌─────────────────────────┐
                 │   SonicJS AI Worker     │
                 │   (Hono.js Runtime)     │
                 └─────────┬───────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────┐    ┌────────▼────┐    ┌────────▼────┐
│ D1 Database│    │ R2 Storage  │    │ KV Cache    │
│ (SQLite)   │    │ (Objects)   │    │ (Key-Value) │
└────────────┘    └─────────────┘    └─────────────┘
\`\`\`

### Core Components

1. **Hono.js Runtime** - Fast, lightweight web framework
2. **Cloudflare Workers** - Serverless execution environment
3. **D1 Database** - Edge-distributed SQLite database
4. **R2 Storage** - Object storage for media files
5. **KV Storage** - Key-value cache for sessions and temporary data

## Application Layer Architecture

### Request Flow

\`\`\`
Request → Middleware Chain → Route Handler → Response
   │           │                 │             │
   │           ├─ CORS           │             │
   │           ├─ Auth           │             │
   │           ├─ Rate Limit     │             │
   │           └─ Validation     │             │
   │                             │             │
   └─ Parse ────────────────────►│             │
                                 │             │
                            ┌────▼────┐        │
                            │Business │        │
                            │ Logic   │        │
                            └────┬────┘        │
                                 │             │
                            ┌────▼────┐        │
                            │Database/│        │
                            │Storage  │        │
                            └────┬────┘        │
                                 │             │
                                 └─────────────►
\`\`\`

### Middleware Stack

\`\`\`typescript
// Middleware execution order
app.use('*', corsHandler)           // 1. Handle CORS
app.use('*', securityHeaders)       // 2. Security headers
app.use('*', requestLogger)         // 3. Request logging
app.use('/api/*', rateLimiter)      // 4. Rate limiting
app.use('/api/*', authMiddleware)   // 5. Authentication
app.use('/admin/*', adminAuth)      // 6. Admin authorization
app.use('*', errorHandler)          // 7. Error handling
\`\`\`

## Data Architecture

### Database Schema

\`\`\`sql
-- Core entities and relationships
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │────▶│   Content   │────▶│Collections  │
│             │     │             │     │             │
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ email       │     │ title       │     │ name        │
│ role        │     │ content     │     │ schema      │
│ created_at  │     │ status      │     │ settings    │
└─────────────┘     │ user_id(FK) │     └─────────────┘
                    │ collection_ │
                    │ id (FK)     │
                    └─────────────┘
                           │
                    ┌─────────────┐
                    │   Media     │
                    │             │
                    │ id (PK)     │
                    │ filename    │
                    │ mime_type   │
                    │ size        │
                    │ url         │
                    └─────────────┘
\`\`\`

### Data Flow Patterns

#### Content Management Flow

\`\`\`
Create Content → Validate Schema → Save to D1 → Index for Search
      │              │              │              │
      ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Client   │  │ Zod      │  │ Drizzle  │  │ Search   │
│ Request  │  │ Schema   │  │ ORM      │  │ Index    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
\`\`\`

#### Media Upload Flow

\`\`\`
File Upload → Validation → Processing → R2 Storage → CDN
     │            │           │           │          │
     ▼            ▼           ▼           ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Client  │ │ MIME    │ │ Image   │ │ R2      │ │ Edge    │
│ Browser │ │ Check   │ │ Resize  │ │ Bucket  │ │ Cache   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
\`\`\`

## Security Architecture

### Authentication & Authorization

\`\`\`
┌─────────────────────────────────────────────────┐
│                Authentication                   │
├─────────────────────────────────────────────────┤
│ JWT Tokens (HTTP-Only Cookies)                 │
│ ├─ Access Token (15 min)                       │
│ └─ Refresh Token (7 days)                      │
└─────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────┐
│               Authorization                     │
├─────────────────────────────────────────────────┤
│ Role-Based Access Control (RBAC)               │
│ ├─ Admin (full access)                         │
│ ├─ Editor (content + media)                    │
│ ├─ Author (own content only)                   │
│ └─ Viewer (read-only)                          │
└─────────────────────────────────────────────────┘
\`\`\`

### Security Layers

1. **Network Security**
   - Cloudflare WAF (Web Application Firewall)
   - DDoS protection
   - SSL/TLS termination

2. **Application Security**
   - Input validation (Zod schemas)
   - SQL injection prevention (Drizzle ORM)
   - XSS protection (CSP headers)
   - CSRF protection

3. **Data Security**
   - Encrypted data at rest (D1/R2)
   - Encrypted data in transit (HTTPS)
   - Access logging and audit trails

## Template System Architecture

### Component Hierarchy

\`\`\`
┌─────────────────────────────────────────────────┐
│                 Layouts                         │
├─────────────────────────────────────────────────┤
│ ├─ AdminLayout (admin interface)               │
│ ├─ DocsLayout (documentation)                  │
│ └─ PublicLayout (public pages)                 │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│               Components                        │
├─────────────────────────────────────────────────┤
│ ├─ Table (data tables)                         │
│ ├─ Form (input forms)                          │
│ ├─ Alert (notifications)                       │
│ ├─ MediaGrid (file browser)                    │
│ └─ Pagination (page navigation)                │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                 Pages                           │
├─────────────────────────────────────────────────┤
│ ├─ ContentList (content management)            │
│ ├─ MediaLibrary (file management)              │
│ ├─ Dashboard (admin overview)                  │
│ └─ Login/Register (authentication)             │
└─────────────────────────────────────────────────┘
\`\`\`

### Template Rendering Pipeline

\`\`\`typescript
// Template rendering flow
interface TemplateData {
  title: string
  user?: User
  content: any
  navigation: NavigationItem[]
}

function renderPage(template: string, data: TemplateData): string {
  return template
    .replace(/{{title}}/g, data.title)
    .replace(/{{content}}/g, renderContent(data.content))
    .replace(/{{navigation}}/g, renderNavigation(data.navigation))
}
\`\`\`

## API Architecture

### RESTful API Design

\`\`\`
/api/
├─ auth/
│  ├─ POST /login           # User authentication
│  ├─ POST /register        # User registration  
│  ├─ POST /logout          # Session termination
│  └─ GET  /me              # Current user info
├─ content/
│  ├─ GET    /              # List content
│  ├─ POST   /              # Create content
│  ├─ GET    /:id           # Get content by ID
│  ├─ PUT    /:id           # Update content
│  └─ DELETE /:id           # Delete content
├─ media/
│  ├─ GET    /              # List media files
│  ├─ POST   /upload        # Upload files
│  ├─ GET    /:id           # Get media details
│  └─ DELETE /:id           # Delete media
└─ collections/
   ├─ GET    /              # List collections
   ├─ POST   /              # Create collection
   ├─ GET    /:id           # Get collection
   └─ PUT    /:id           # Update collection
\`\`\`

### API Response Format

\`\`\`typescript
// Standardized API response format
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: PaginationMeta
    timestamp: string
    version: string
  }
}
\`\`\`

## Performance Architecture

### Caching Strategy

\`\`\`
┌─────────────────────────────────────────────────┐
│               Caching Layers                    │
├─────────────────────────────────────────────────┤
│ 1. Cloudflare Edge Cache (static assets)       │
│ 2. KV Storage (API responses, sessions)        │
│ 3. Worker Memory (configuration, schemas)      │
│ 4. Browser Cache (client-side resources)       │
└─────────────────────────────────────────────────┘
\`\`\`

### Performance Optimizations

1. **Database Optimizations**
   \`\`\`sql
   -- Strategic indexes for common queries
   CREATE INDEX idx_content_status ON content(status);
   CREATE INDEX idx_content_created ON content(created_at DESC);
   CREATE INDEX idx_users_email ON users(email);
   \`\`\`

2. **Asset Optimization**
   - Image compression and WebP conversion
   - CSS/JS minification and bundling
   - Font subsetting and preloading

3. **Code Splitting**
   - Lazy loading of admin components
   - Separate bundles for public/admin areas
   - Dynamic imports for heavy features

## Deployment Architecture

### Multi-Environment Setup

\`\`\`
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Development   │  │     Staging     │  │   Production    │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Local SQLite    │  │ D1 Preview      │  │ D1 Production   │
│ Local Storage   │  │ R2 Preview      │  │ R2 Production   │
│ Debug Enabled   │  │ Debug Enabled   │  │ Debug Disabled  │
│ CORS: *         │  │ CORS: staging   │  │ CORS: domain    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
\`\`\`

### CI/CD Pipeline

\`\`\`yaml
# GitHub Actions workflow
Build → Test → Deploy Preview → Manual Approval → Deploy Production
  │       │            │                │               │
  ▼       ▼            ▼                ▼               ▼
TypeScript Unit      Staging         Review         Production
Compile   Tests      Deploy          Changes        Deploy
\`\`\`

## Monitoring & Observability

### Logging Architecture

\`\`\`typescript
// Structured logging format
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  requestId: string
  userId?: string
  context?: Record<string, any>
}
\`\`\`

### Metrics Collection

1. **Application Metrics**
   - Request count and latency
   - Error rates by endpoint
   - Database query performance
   - Cache hit/miss ratios

2. **Business Metrics**
   - User registrations and logins
   - Content creation and publishing
   - Media upload statistics
   - API usage patterns

## Scalability Considerations

### Horizontal Scaling

- **Stateless Workers**: Each request is independent
- **Edge Distribution**: Global deployment across 300+ locations
- **Database Scaling**: D1 automatic replication and failover
- **Storage Scaling**: R2 unlimited capacity with global distribution

### Vertical Scaling

- **Memory Optimization**: Efficient data structures and caching
- **CPU Optimization**: Minimal processing per request
- **I/O Optimization**: Connection pooling and batch operations

## Design Patterns

### Architectural Patterns

1. **Repository Pattern**
   \`\`\`typescript
   interface ContentRepository {
     findAll(filters: ContentFilters): Promise<Content[]>
     findById(id: string): Promise<Content | null>
     create(data: CreateContentDto): Promise<Content>
     update(id: string, data: UpdateContentDto): Promise<Content>
     delete(id: string): Promise<void>
   }
   \`\`\`

2. **Service Layer Pattern**
   \`\`\`typescript
   class ContentService {
     constructor(
       private contentRepo: ContentRepository,
       private mediaService: MediaService,
       private searchService: SearchService
     ) {}

     async createContent(data: CreateContentDto): Promise<Content> {
       // Business logic here
       const content = await this.contentRepo.create(data)
       await this.searchService.index(content)
       return content
     }
   }
   \`\`\`

3. **Factory Pattern**
   \`\`\`typescript
   class ResponseFactory {
     static success<T>(data: T, meta?: any): ApiResponse<T> {
       return { success: true, data, meta }
     }

     static error(code: string, message: string): ApiResponse<never> {
       return { success: false, error: { code, message } }
     }
   }
   \`\`\`

## Future Architecture Considerations

### Planned Enhancements

1. **Plugin System**
   - Dynamic plugin loading
   - Sandboxed execution environment
   - Plugin marketplace integration

2. **Microservices Transition**
   - Service decomposition strategy
   - Inter-service communication
   - Distributed data management

3. **Advanced Caching**
   - Redis integration for complex caching
   - GraphQL with DataLoader
   - Real-time data synchronization

4. **Enhanced Security**
   - OAuth 2.0 / OpenID Connect
   - Multi-factor authentication
   - Advanced audit logging

This architecture provides a solid foundation for a scalable, secure, and maintainable content management system while leveraging the full power of Cloudflare's edge computing platform.`,

  'user-guide.md': `# User Guide

Welcome to SonicJS AI! This comprehensive guide will help you get the most out of your content management system, whether you're an admin, editor, author, or viewer.

## Getting Started

### First Login

1. **Access the Admin Panel**
   - Navigate to \`https://your-domain.com/admin\`
   - Enter your email and password
   - Click "Sign In"

2. **Dashboard Overview**
   - **Content Summary** - Recent content and statistics
   - **Media Library** - Quick access to uploaded files
   - **Quick Actions** - Common tasks and shortcuts
   - **System Status** - Health indicators and notifications

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access - users, content, media, settings |
| **Editor** | Content management, media library, user content |
| **Author** | Create and edit own content, access media library |
| **Viewer** | Read-only access to content and media |

## Content Management

### Creating Content

#### Step 1: Navigate to Content

1. Click **"Content"** in the admin navigation
2. Click **"New Content"** button
3. Select your content type (Page, Post, etc.)

#### Step 2: Fill in Content Details

\`\`\`
Title: Your content title
Slug: auto-generated-url-friendly-slug
Status: Draft | Published | Archived
Collection: Select appropriate collection
\`\`\`

#### Step 3: Add Content

The rich text editor supports:

- **Headings** - Use # for H1, ## for H2, etc.
- **Formatting** - Bold, italic, underline, strikethrough
- **Lists** - Ordered and unordered lists
- **Links** - Internal and external linking
- **Images** - Drag and drop or insert from media library
- **Code Blocks** - Syntax highlighted code snippets
- **Tables** - Data tables with sorting capabilities

#### Step 4: Set Publishing Options

- **Publish Date** - Schedule content for future publication
- **Author** - Assign content to specific user
- **Categories** - Organize content with categories
- **Tags** - Add searchable keywords
- **SEO Settings** - Meta description and keywords

#### Step 5: Save or Publish

- **Save Draft** - Keep content private for editing
- **Publish** - Make content live immediately
- **Schedule** - Set future publication date

### Content Workflow

#### Draft → Review → Published

1. **Draft State**
   - Content is private and editable
   - Only author and editors can view
   - Appears in "Drafts" section

2. **Review State** (optional)
   - Content submitted for editorial review
   - Editors receive notification
   - Author can still make changes

3. **Published State**
   - Content is live and public
   - Appears on website
   - Changes require republishing

#### Bulk Actions

Select multiple content items to:

- **Change Status** - Move to draft, published, or archived
- **Assign Author** - Bulk reassign content ownership  
- **Update Categories** - Apply categories to multiple items
- **Delete** - Remove multiple items (with confirmation)

### Content Versions

Every content change creates a new version:

1. **View Version History**
   - Click "Versions" tab in content editor
   - See all changes with timestamps
   - Compare versions side-by-side

2. **Restore Previous Version**
   - Select version from history
   - Click "Restore This Version"
   - Confirm restoration

3. **Version Management**
   - System keeps last 10 versions by default
   - Older versions automatically pruned
   - Critical versions can be marked for retention

## Media Management

### Uploading Files

#### Single File Upload

1. Navigate to **"Media"** in admin panel
2. Click **"Upload Files"** button
3. Select file from your computer
4. Add metadata (title, alt text, description)
5. Click **"Upload"**

#### Bulk Upload

1. Drag multiple files into media library
2. Files upload automatically
3. Edit metadata for each file
4. Organize into folders as needed

#### Supported File Types

- **Images** - JPEG, PNG, WebP, GIF, SVG
- **Documents** - PDF, DOC, DOCX, TXT, MD
- **Audio** - MP3, WAV, OGG
- **Video** - MP4, WebM, MOV
- **Archives** - ZIP, RAR (with restrictions)

### File Organization

#### Creating Folders

1. Click **"New Folder"** in media library
2. Enter folder name
3. Select parent folder (optional)
4. Click **"Create"**

#### Moving Files

- **Drag and Drop** - Move between folders
- **Bulk Move** - Select multiple files and move
- **Copy** - Duplicate files to multiple locations

#### File Metadata

Each file includes:

- **Title** - Display name for the file
- **Alt Text** - Accessibility description for images
- **Caption** - Optional caption text
- **Description** - Detailed file description
- **Tags** - Searchable keywords
- **Upload Date** - Automatic timestamp
- **File Size** - Automatic calculation
- **Dimensions** - For images and videos

### Image Optimization

Images are automatically optimized:

- **Compression** - Reduced file size without quality loss
- **Format Conversion** - WebP for modern browsers
- **Responsive Sizes** - Multiple sizes generated
- **CDN Delivery** - Global edge caching

#### Manual Image Editing

1. Select image in media library
2. Click **"Edit Image"**
3. Available options:
   - Crop and resize
   - Rotate and flip
   - Adjust brightness/contrast
   - Apply filters

## Collections & Schema

### Understanding Collections

Collections define content types and their structure:

- **Pages** - Static content like About, Contact
- **Blog Posts** - Time-based content with categories
- **Products** - E-commerce items with pricing
- **Events** - Calendar-based content with dates

### Creating Custom Collections

#### Step 1: Define Collection

1. Navigate to **"Collections"** in admin
2. Click **"New Collection"**
3. Enter collection details:
   - Name (technical name)
   - Display Name (user-friendly)
   - Description
   - Icon (optional)

#### Step 2: Configure Schema

Define fields for your collection:

\`\`\`json
{
  "title": {
    "type": "text",
    "label": "Title",
    "required": true,
    "max_length": 200
  },
  "description": {
    "type": "textarea", 
    "label": "Description",
    "required": false
  },
  "featured_image": {
    "type": "media",
    "label": "Featured Image",
    "allowed_types": ["image/*"]
  },
  "published_date": {
    "type": "date",
    "label": "Publication Date",
    "default": "now"
  }
}
\`\`\`

#### Available Field Types

| Type | Description | Options |
|------|-------------|---------|
| **text** | Single line text | max_length, pattern |
| **textarea** | Multi-line text | rows, max_length |
| **rich_text** | WYSIWYG editor | toolbar_options |
| **number** | Numeric input | min, max, step |
| **date** | Date picker | format, range |
| **boolean** | True/false toggle | default_value |
| **select** | Dropdown menu | options, multiple |
| **media** | File picker | allowed_types, multiple |
| **relation** | Link to other content | target_collection |

### Field Validation

Add validation rules to ensure data quality:

\`\`\`json
{
  "email": {
    "type": "text",
    "label": "Email Address",
    "required": true,
    "validation": {
      "pattern": "^[^@]+@[^@]+\\.[^@]+$",
      "message": "Please enter a valid email address"
    }
  },
  "price": {
    "type": "number",
    "label": "Price",
    "required": true,
    "validation": {
      "min": 0,
      "message": "Price must be positive"
    }
  }
}
\`\`\`

## Search & Filtering

### Content Search

#### Basic Search

1. Use search box in content list
2. Enter keywords
3. Results filter automatically
4. Search includes:
   - Title and content text
   - Author names
   - Categories and tags
   - Custom field values

#### Advanced Filters

- **Status** - Draft, Published, Archived
- **Author** - Filter by content creator
- **Date Range** - Created or modified dates
- **Collection** - Specific content types
- **Categories** - Content organization
- **Tags** - Keyword associations

#### Saved Searches

1. Apply desired filters
2. Click **"Save Search"**
3. Give search a name
4. Access from **"Saved Searches"** menu

### Media Search

Find media files quickly:

- **File Name** - Search by filename
- **File Type** - Filter by image, document, etc.
- **Upload Date** - Date range filtering
- **File Size** - Size range filtering
- **Folders** - Browse by folder structure
- **Tags** - Search by assigned tags

## User Management

### Managing Your Profile

#### Update Personal Information

1. Click your name in top-right corner
2. Select **"Profile"**
3. Update information:
   - Name and email
   - Profile photo
   - Bio and contact info
   - Notification preferences

#### Change Password

1. Go to **"Profile"** → **"Security"**
2. Enter current password
3. Enter new password (twice)
4. Click **"Update Password"**

#### Notification Settings

Configure email notifications for:

- **Content Updates** - When content is published/updated
- **System Alerts** - Important system notifications
- **User Activity** - Login attempts and security events
- **Weekly Summary** - System activity digest

### Managing Other Users (Admin Only)

#### Adding Users

1. Navigate to **"Users"** in admin panel
2. Click **"Add User"**
3. Fill in user details:
   - Email address (required)
   - Full name
   - Role assignment
   - Initial password (optional)
4. Send invitation email

#### User Roles & Permissions

Modify user access levels:

- **Change Role** - Upgrade/downgrade user permissions
- **Suspend Account** - Temporarily disable access
- **Reset Password** - Generate new password
- **View Activity** - See user's login and content history

#### Bulk User Actions

- **Import Users** - CSV file upload
- **Export Users** - Download user list
- **Bulk Role Changes** - Update multiple users
- **Deactivate Inactive** - Remove unused accounts

## System Settings

### General Settings

Configure basic system information:

- **Site Name** - Your website/organization name
- **Site URL** - Primary domain name
- **Admin Email** - System administrator contact
- **Timezone** - Default timezone for dates
- **Language** - Interface language (if available)

### Content Settings

Customize content management:

- **Default Status** - New content status (draft/published)
- **Auto-Save Interval** - How often drafts are saved
- **Revision Limit** - Number of versions to keep
- **Excerpt Length** - Auto-generated excerpt size
- **Slug Generation** - URL generation rules

### Media Settings

Configure file handling:

- **Upload Limits** - Maximum file sizes by type
- **Allowed Types** - Permitted file extensions
- **Image Quality** - Compression settings
- **Storage Location** - Primary storage provider
- **CDN Settings** - Content delivery network

### Security Settings

Enhance system security:

- **Password Requirements** - Minimum length, complexity
- **Session Duration** - How long users stay logged in
- **Failed Login Attempts** - Account lockout settings
- **Two-Factor Authentication** - Enable/disable 2FA
- **IP Restrictions** - Limit access by IP address

## Best Practices

### Content Creation

1. **Plan Your Structure**
   - Define content types before creating
   - Use consistent naming conventions
   - Organize with clear categories

2. **Write for SEO**
   - Use descriptive titles and headings
   - Include relevant keywords naturally
   - Write compelling meta descriptions
   - Use internal linking

3. **Optimize Images**
   - Use descriptive filenames
   - Add alt text for accessibility
   - Choose appropriate file formats
   - Compress images before upload

### Organization

1. **File Management**
   - Create logical folder structures
   - Use consistent naming conventions
   - Tag files with relevant keywords
   - Regular cleanup of unused files

2. **Content Workflow**
   - Use draft status for work-in-progress
   - Review content before publishing
   - Schedule content for optimal timing
   - Update and refresh old content

### Security

1. **User Management**
   - Assign minimum required permissions
   - Regularly review user accounts
   - Use strong passwords
   - Enable two-factor authentication

2. **System Maintenance**
   - Keep software updated
   - Monitor system logs
   - Regular backups
   - Review security settings

## Troubleshooting

### Common Issues

#### "Access Denied" Errors

**Problem**: Cannot access certain features
**Solution**: 
- Check user role permissions
- Contact admin for access upgrade
- Clear browser cache and cookies

#### Content Not Saving

**Problem**: Changes not being saved
**Solution**:
- Check internet connection
- Try refreshing the page
- Use "Save Draft" instead of "Publish"
- Contact system administrator

#### Media Upload Failures

**Problem**: Files won't upload
**Solution**:
- Check file size limits
- Verify file type is allowed
- Try different file format
- Clear browser cache

#### Search Not Working

**Problem**: Search returns no results
**Solution**:
- Check spelling and try different keywords
- Use broader search terms
- Clear search filters
- Wait for search index to update

### Getting Help

#### Built-in Help

- **Tooltips** - Hover over question marks
- **Help Sections** - Context-sensitive help
- **Video Tutorials** - Step-by-step guides
- **Documentation** - Complete user manual

#### Support Channels

- **System Administrator** - Your organization's admin
- **Help Desk** - Internal support system
- **Community Forum** - User community discussions
- **Official Documentation** - Latest guides and updates

#### Reporting Issues

When reporting problems, include:

1. **What were you trying to do?**
2. **What happened instead?**
3. **What browser are you using?**
4. **Can you reproduce the problem?**
5. **Screenshots (if applicable)**

## Advanced Features

### Custom Fields

Create specialized content fields:

1. Navigate to collection settings
2. Add custom field definition
3. Configure field type and validation
4. Use in content creation forms
5. Display in templates

### Workflow Automation

Set up automated processes:

- **Auto-publish** - Schedule content publication
- **Email Notifications** - Alert users of changes
- **Content Archiving** - Auto-archive old content
- **Backup Scheduling** - Regular data backups

### API Access

For developers and integrations:

- **REST API** - Standard HTTP API endpoints
- **Authentication** - API key or JWT tokens
- **Documentation** - Interactive API explorer
- **Rate Limits** - Usage quotas and throttling
- **Webhooks** - Real-time event notifications

### Integration Options

Connect with external services:

- **Email Marketing** - Newsletter subscriptions
- **Analytics** - Website traffic tracking
- **Social Media** - Auto-posting to platforms
- **E-commerce** - Product catalog sync
- **CRM Systems** - Customer data integration

This comprehensive user guide should help you make the most of SonicJS AI. For additional help or specific questions, consult the [troubleshooting guide](/docs/troubleshooting) or contact your system administrator.`,

  'plugin-development.md': `# SonicJS Plugin Development Guide

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

\`\`\`typescript
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
\`\`\`

### Plugin Structure

\`\`\`
src/plugins/
├── my-plugin/
│   ├── index.ts          # Main plugin file
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── models/           # Database models
│   └── admin/            # Admin interface components
\`\`\`

## Plugin Builder SDK

The Plugin Builder provides a fluent API for constructing plugins:

### Basic Plugin Creation

\`\`\`typescript
const plugin = PluginBuilder.create({
  name: 'example-plugin',
  version: '1.0.0',
  description: 'Example plugin for demonstration'
})
\`\`\`

### Adding Metadata

\`\`\`typescript
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
\`\`\`

### Adding Routes

\`\`\`typescript
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
\`\`\`

### Adding Middleware

\`\`\`typescript
plugin.addSingleMiddleware('request-logger', async (c, next) => {
  console.log(\`\${c.req.method} \${c.req.path}\`)
  await next()
}, {
  description: 'Log all requests',
  global: true,
  priority: 5
})
\`\`\`

### Adding Services

\`\`\`typescript
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
\`\`\`

### Adding Database Models

\`\`\`typescript
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
\`\`\`

### Adding Hooks

\`\`\`typescript
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
\`\`\`

### Adding Admin Interface

\`\`\`typescript
plugin.addAdminPage('/my-plugin', 'My Plugin', 'MyPluginView', {
  description: 'Manage plugin settings',
  permissions: ['admin'],
  icon: 'cog'
})

plugin.addMenuItem('My Plugin', '/admin/my-plugin', {
  icon: 'puzzle',
  order: 50
})
\`\`\`

## Plugin Components

### Routes

Routes define API endpoints that your plugin exposes:

\`\`\`typescript
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
\`\`\`

### Middleware

Middleware can be applied globally or to specific routes:

\`\`\`typescript
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
\`\`\`

### Services

Services encapsulate business logic:

\`\`\`typescript
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
\`\`\`

### Models

Models define database structures:

\`\`\`typescript
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
\`\`\`

### Hooks

Hooks provide event-driven extensibility:

\`\`\`typescript
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
\`\`\`

## Examples

### Simple API Plugin

\`\`\`typescript
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
\`\`\`

### Content Type Plugin

\`\`\`typescript
import { PluginTemplates } from '@/plugins/sdk/plugin-builder'

export const productPlugin = PluginTemplates.contentType('Product', [
  { name: 'name', type: 'string', label: 'Product Name', required: true },
  { name: 'price', type: 'number', label: 'Price', required: true },
  { name: 'description', type: 'string', label: 'Description' },
  { name: 'inStock', type: 'boolean', label: 'In Stock' }
])
\`\`\`

### Analytics Plugin

\`\`\`typescript
export const customAnalyticsPlugin = PluginTemplates.analytics('Custom', {
  endpoints: ['/api/products', '/api/orders'],
  dashboard: true
})
\`\`\`

## Best Practices

### 1. Naming Conventions

- Use kebab-case for plugin names: \`my-awesome-plugin\`
- Prefix plugin-specific hooks: \`my-plugin:event-name\`
- Use descriptive service names: \`emailService\`, \`paymentProcessor\`

### 2. Error Handling

\`\`\`typescript
plugin.addRoute('/api/risky', new Hono().post('/', async (c) => {
  try {
    const result = await riskyOperation()
    return c.json(result)
  } catch (error) {
    console.error('Plugin error:', error)
    return c.json({ error: 'Operation failed' }, 500)
  }
}))
\`\`\`

### 3. Configuration

\`\`\`typescript
plugin.lifecycle({
  configure: async (config) => {
    // Validate configuration
    if (!config.apiKey) {
      throw new Error('API key is required')
    }
    
    // Apply configuration
    context.config.apiKey = config.apiKey
  }
})
\`\`\`

### 4. Dependencies

\`\`\`typescript
plugin.metadata({
  dependencies: ['core-auth', 'core-media'],
  compatibility: '^0.1.0'
})
\`\`\`

### 5. Security

- Always validate input data
- Use proper authentication checks
- Sanitize output data
- Follow principle of least privilege

## Testing Plugins

### Unit Testing

\`\`\`typescript
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
\`\`\`

### Integration Testing

\`\`\`typescript
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
\`\`\`

## Publishing Plugins

### 1. Prepare for Publishing

- Ensure all tests pass
- Update version in package.json
- Write comprehensive documentation
- Include example usage

### 2. Plugin Manifest

Create a \`plugin.json\` file:

\`\`\`json
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
\`\`\`

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

\`\`\`typescript
plugin.lifecycle({
  activate: async (context) => {
    context.logger.debug('Plugin activated with config:', context.config)
  }
})
\`\`\`

## Advanced Topics

### Custom Hook System

\`\`\`typescript
// Register custom hooks
plugin.addHook('my-plugin:custom-event', async (data, context) => {
  // Custom logic
  return data
})

// Trigger hooks from your plugin
const result = await context.hooks.execute('my-plugin:custom-event', data)
\`\`\`

### Plugin Communication

\`\`\`typescript
// Listen to other plugin events
plugin.addHook('other-plugin:event', async (data, context) => {
  // React to other plugin events
  return data
})
\`\`\`

### Resource Management

\`\`\`typescript
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
\`\`\`

## Support

- [SonicJS Documentation](https://docs.sonicjs.com)
- [Plugin API Reference](https://docs.sonicjs.com/plugins/api)
- [Community Discord](https://discord.gg/sonicjs)
- [GitHub Issues](https://github.com/sonicjs/sonicjs/issues)`
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

// Core Guides
docsRoutes.get('/authentication', async (c) => {
  return c.html(renderDocsLayout({
    title: 'Authentication & Security',
    content: '<h1>Authentication & Security</h1><p>Complete authentication and security documentation with JWT, RBAC, user management, and security best practices.</p><p><strong>Note:</strong> The full authentication documentation is available in the repository at <code>docs/authentication.md</code>. This covers JWT implementation, role-based access control, user management, security features, and production deployment security.</p><p>Key topics include:</p><ul><li>JWT token management and verification</li><li>Role-based access control (admin, editor, author, viewer)</li><li>User registration, login, and password management</li><li>Security best practices and hardening</li><li>API authentication and error handling</li></ul>',
    currentPath: '/docs/authentication',
    navigation
  }))
})

docsRoutes.get('/database', async (c) => {
  return c.html(renderDocsLayout({
    title: 'Database & Schema',
    content: '<h1>Database Documentation</h1><p>Comprehensive database operations and schema guide using Drizzle ORM with Cloudflare D1.</p><p><strong>Note:</strong> The complete database documentation is available in the repository at <code>docs/database.md</code>. This covers Drizzle ORM integration, schema definitions, migrations, and best practices.</p><p>Key topics include:</p><ul><li>Drizzle ORM setup and configuration</li><li>Database schema definition and relationships</li><li>CRUD operations and advanced queries</li><li>Migration management and deployment</li><li>Performance optimization and indexing</li><li>Backup and recovery procedures</li></ul>',
    currentPath: '/docs/database',
    navigation
  }))
})

docsRoutes.get('/templating', async (c) => {
  return c.html(renderDocsLayout({
    title: 'Template System',
    content: '<h1>Template System Documentation</h1><p>Component-based template system with HTMX integration for server-side rendering.</p><p><strong>Note:</strong> The complete template system documentation is available in the repository at <code>docs/templating.md</code>. This covers the component-based architecture, HTMX integration, and template development patterns.</p><p>Key topics include:</p><ul><li>Component-based template architecture</li><li>Layout and component development</li><li>HTMX integration patterns</li><li>Type-safe template functions</li><li>Performance optimization</li><li>Best practices and troubleshooting</li></ul>',
    currentPath: '/docs/templating',
    navigation
  }))
})

// Development Guides
docsRoutes.get('/plugin-development', async (c) => {
  const html = await renderMarkdownPage('plugin-development.md', '/docs/plugin-development')
  return c.html(html)
})

docsRoutes.get('/testing', async (c) => {
  return c.html(renderDocsLayout({
    title: 'Testing Guide',
    content: '<h1>Testing Guide</h1><p>Comprehensive testing strategies covering unit tests, integration tests, and end-to-end testing.</p><p><strong>Note:</strong> The complete testing documentation is available in the repository at <code>docs/testing.md</code>. This covers the full testing stack with Vitest and Playwright.</p><p>Key topics include:</p><ul><li>Unit testing with Vitest</li><li>Integration testing for API endpoints</li><li>End-to-end testing with Playwright</li><li>Test data management and fixtures</li><li>CI/CD integration</li><li>Performance testing strategies</li></ul>',
    currentPath: '/docs/testing',
    navigation
  }))
})

docsRoutes.get('/deployment', async (c) => {
  const html = await renderMarkdownPage('deployment.md', '/docs/deployment')
  return c.html(html)
})

// Documentation routes with full content
docsRoutes.get('/media-management', async (c) => {
  const html = await renderMarkdownPage('media-management.md', '/docs/media-management')
  return c.html(html)
})

docsRoutes.get('/troubleshooting', async (c) => {
  const html = await renderMarkdownPage('troubleshooting.md', '/docs/troubleshooting')
  return c.html(html)
})

docsRoutes.get('/configuration', async (c) => {
  const html = await renderMarkdownPage('configuration.md', '/docs/configuration')
  return c.html(html)
})

docsRoutes.get('/architecture', async (c) => {
  const html = await renderMarkdownPage('architecture.md', '/docs/architecture')
  return c.html(html)
})

docsRoutes.get('/user-guide', async (c) => {
  const html = await renderMarkdownPage('user-guide.md', '/docs/user-guide')
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