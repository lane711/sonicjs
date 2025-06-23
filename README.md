# SonicJS AI - Cloudflare-Native Headless CMS

A modern, TypeScript-first headless CMS built specifically for the Cloudflare edge platform. SonicJS AI combines the power of Next.js with Cloudflare's edge infrastructure to deliver blazing-fast performance and developer-centric experience.

## 🚀 Features

- **TypeScript-First**: Full type safety throughout the entire stack
- **Cloudflare-Native**: Built specifically for Cloudflare's edge infrastructure
- **Developer Experience**: Configuration over UI, code-first approach
- **Plugin Architecture**: Extensible without modifying core code
- **Edge Performance**: Global edge computing with minimal latency
- **AI-Friendly**: Structured codebase designed for AI assistance

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Cloudflare D1 (SQLite at the edge)
- **ORM**: Drizzle ORM with Zod validation
- **Storage**: Cloudflare R2 for media files
- **CDN**: Cloudflare Images API for optimization
- **Styling**: Tailwind CSS
- **Testing**: Jest + Playwright
- **Deployment**: Cloudflare Pages

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/lane711/sonicjs.git
cd sonicjs

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate database migrations
npm run db:migrate   # Apply migrations locally
npm run db:studio    # Open Drizzle Studio

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests

# CLI
npm run sonicjs      # Run SonicJS CLI
```

## 📁 Project Structure

```
src/
├── app/             # Next.js app router pages
├── components/      # React components
├── db/              # Database schema and utilities
├── lib/             # Utility functions and helpers
├── cli/             # CLI commands and tools
└── types/           # TypeScript type definitions

docs/
├── ai-instructions.md    # AI development guidelines
├── project-plan.md      # Development roadmap
└── CLAUDE.md            # Claude AI context
```

## 🎯 Development Stages

This project follows a systematic 6-stage development approach:

1. **Stage 1**: Foundation & Core Infrastructure ✅
2. **Stage 2**: Core API & Authentication (Next)
3. **Stage 3**: Content Management System
4. **Stage 4**: Media Management & File Handling
5. **Stage 5**: Plugin Framework & Extensibility
6. **Stage 6**: Advanced Features & Optimization

## 🔐 Environment Setup

Create a `.env.local` file with:

```env
# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Database
DATABASE_ID=your_d1_database_id

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Unit tests
npm test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test -- --coverage
```

## 🚀 Deployment

Deploy to Cloudflare Pages:

```bash
# Build and deploy
npm run build
npm run deploy
```

## 📖 Documentation

- [AI Instructions](docs/ai-instructions.md) - Guidelines for AI-assisted development
- [Project Plan](docs/project-plan.md) - Detailed development roadmap
- [Claude Context](docs/CLAUDE.md) - AI context and memory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on the shoulders of giants: Next.js, Cloudflare, and the open-source community
- Inspired by modern headless CMS solutions like Strapi, Directus, and Payload
- Designed for the edge-first future of web development
