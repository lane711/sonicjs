# SonicJS AI - Headless CMS Rebuild Instructions

## Project Vision
Rebuild SonicJS (https://sonicjs.com) as the most comprehensive, developer-centric headless CMS leveraging the full power of the Cloudflare stack. This will be an AI-friendly, TypeScript-first platform designed for maximum extensibility and performance.

## Core Philosophy
- **Developer-Centric**: Configuration over UI, code-first approach
- **Cloudflare-Native**: Built specifically for Cloudflare's edge infrastructure
- **AI-Friendly**: Highly structured, well-documented for AI assistance
- **Plugin-First**: Extensible without core modifications
- **Type-Safe**: Full TypeScript integration throughout

## Technology Stack

### Core Framework
- **Next.js**: React framework with App Router
- **TypeScript**: Strict type safety throughout
- **Tailwind CSS**: Utility-first styling
- **React**: Client-side interactivity

### Cloudflare Services
- **Cloudflare D1**: SQLite database at the edge
- **Cloudflare KV**: Key-value storage for caching
- **Cloudflare R2**: Object storage for media
- **Cloudflare Images API**: Image optimization and transformation
- **Cloudflare Workers**: Serverless compute
- **Cloudflare Pages**: Static site hosting

### Development & Testing
- **Jest**: Unit and integration testing
- **Playwright**: End-to-end testing
- **Vitest**: Fast unit testing
- **TypeScript**: Compile-time error checking

### Data Management
- **React TanStack Query**: Server state management
- **React TanStack Table**: Advanced data grids with filtering, sorting, pagination
- **Zod**: Runtime type validation
- **Drizzle ORM**: Type-safe database queries

## Competitive Feature Analysis

Based on comprehensive analysis of Strapi, Directus, and Payload CMS, SonicJS will implement:

### High Priority Features (MVP)
1. **TypeScript-First Schema Definition**
   - Code-based content models
   - Automatic type generation
   - Runtime validation with Zod

2. **Edge-Optimized APIs**
   - Auto-generated REST endpoints
   - GraphQL support
   - Real-time subscriptions via WebSockets
   - Serverless-optimized performance

3. **Developer Experience**
   - Hot reload development
   - CLI tools and generators
   - Local API access
   - Comprehensive TypeScript support

4. **Plugin Framework**
   - Workers-based plugins
   - Type-safe plugin development
   - Hook system for extensibility
   - Plugin marketplace integration

5. **Authentication & Authorization**
   - Built-in auth system
   - Role-based access control (RBAC)
   - Field-level permissions
   - JWT tokens with Cloudflare Access integration

### Medium Priority Features
1. **Content Management**
   - Visual content editor
   - Draft/published workflows
   - Content versioning
   - Bulk operations

2. **Media Management**
   - Cloudflare R2 integration
   - Automatic image optimization
   - CDN delivery
   - Transform API integration

3. **Internationalization**
   - Multi-language content
   - Locale-aware APIs
   - Translation workflows

4. **Advanced Workflows**
   - Custom approval processes
   - Scheduled publishing
   - Webhook system
   - Background job processing

### Future Enhancements
1. **Real-time Collaboration**
2. **Advanced Analytics**
3. **Multi-tenancy Support**
4. **Enterprise SSO Integration**

## Architecture Principles

### 1. Cloudflare-First Design
- Leverage edge computing for global performance
- Utilize Workers for serverless plugin execution
- Optimize for Cloudflare's infrastructure limits
- Built-in CDN integration

### 2. Type Safety
- Strict TypeScript throughout
- Runtime validation with Zod
- Auto-generated types from schema
- Compile-time error prevention

### 3. Developer Experience
- Minimal configuration required
- Intuitive CLI tools
- Hot reload development
- Comprehensive documentation

### 4. Plugin Architecture
- Hook-based extension system
- No core modification required
- Type-safe plugin development
- Cloudflare Workers integration

### 5. Performance First
- Edge-optimized queries
- Automatic caching strategies
- Minimal client-side JavaScript
- Progressive enhancement

## Development Guidelines

### Code Organization
```
src/
├── core/           # Core CMS functionality
├── plugins/        # Built-in plugins
├── api/           # API routes and handlers
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── hooks/         # Custom React hooks
├── components/    # React components
└── tests/         # Test files
```

### Naming Conventions
- **Files**: kebab-case (`content-model.ts`)
- **Components**: PascalCase (`ContentEditor.tsx`)
- **Functions**: camelCase (`getUserById`)
- **Types**: PascalCase (`ContentModel`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`)

### TypeScript Guidelines
- Use strict mode
- Prefer interfaces over types for extensibility
- Use generics for reusable components
- Implement proper error handling with Result types

### Testing Strategy
- Unit tests for utilities and core logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage

## AI-Friendly Documentation Standards

### 1. Code Documentation
- JSDoc comments for all public APIs
- Inline comments for complex logic
- Type annotations for all function parameters
- Example usage in documentation

### 2. Architecture Documentation
- Clear module boundaries
- Dependency graphs
- Data flow diagrams
- API specifications

### 3. Plugin Development Guide
- Step-by-step plugin creation
- Best practices and patterns
- Security considerations
- Performance optimization tips

### 4. Convention Documentation
- Code style guides
- File organization patterns
- Naming conventions
- Testing approaches

## Competitive Advantages

### 1. Cloudflare Integration
- Global edge performance
- Built-in security features
- Automatic scaling
- Cost-effective hosting

### 2. Developer Experience
- TypeScript-first approach
- Minimal configuration
- Hot reload development
- Comprehensive tooling

### 3. AI-Friendly Architecture
- Structured codebase
- Comprehensive documentation
- Clear conventions
- Extensible design

### 4. Modern Tech Stack
- Latest React features
- Advanced TypeScript usage
- Modern testing tools
- Performance optimizations

## Success Metrics

### Technical Metrics
- < 100ms API response time (p95)
- > 99.9% uptime
- < 2s initial page load
- > 80% code coverage

### Developer Experience
- < 5 minutes setup time
- < 10 commands to deploy
- Comprehensive TypeScript support
- Intuitive plugin development

### Feature Completeness
- All competitor core features
- Unique Cloudflare advantages
- Extensible plugin system
- Enterprise-ready capabilities

This enhanced instruction set provides a comprehensive foundation for building SonicJS as a world-class headless CMS that leverages Cloudflare's unique advantages while maintaining developer-first principles and AI-friendly architecture.


