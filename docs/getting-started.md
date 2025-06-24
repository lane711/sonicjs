# Getting Started with SonicJS AI

This guide will help you set up and start using SonicJS AI for your content management needs.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **pnpm**
- **Git**
- **Cloudflare account** (for deployment)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/lane711/sonicjs-ai.git
cd sonicjs-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-secret-key-here"

# Cloudflare (for deployment)
CLOUDFLARE_API_TOKEN="your-api-token"
CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

### 4. Database Setup

Generate and run database migrations:

```bash
# Generate migration files
npm run db:generate

# Apply migrations locally
npm run db:migrate

# (Optional) Open database studio
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

Your SonicJS AI instance will be available at `http://localhost:8787`

## First Steps

### 1. Access the Admin Dashboard

Navigate to `http://localhost:8787/admin` to access the admin interface.

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

Visit `http://localhost:8787/docs` to explore the auto-generated API documentation.

## Project Structure

```
sonicjs-ai/
├── docs/              # Documentation files
├── src/
│   ├── routes/        # API and page routes
│   ├── templates/     # HTML templates
│   ├── db/           # Database schema and migrations
│   ├── content/      # Content management logic
│   ├── media/        # Media handling
│   └── cli/          # Command-line tools
├── migrations/       # Database migration files
└── tests/           # Test suites
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Cloudflare |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run db:studio` | Open database management UI |

## Next Steps

- [Learn about Content Management](/docs/content-management)
- [Explore the API](/docs/api-reference)
- [Set up Authentication](/docs/authentication)
- [Deploy to Production](/docs/deployment)

## Troubleshooting

### Common Issues

**Database connection errors:**
- Make sure you've run `npm run db:migrate`
- Check that the database file exists

**Port already in use:**
- Stop any existing development servers
- Or change the port in `wrangler.toml`

**Dependencies not found:**
- Run `npm install` again
- Clear node_modules and reinstall if needed

Need help? Check our [FAQ](/docs/faq) or [open an issue](https://github.com/lane711/sonicjs-ai/issues). 