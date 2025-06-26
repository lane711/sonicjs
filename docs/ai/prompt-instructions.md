# SonicJS AI Assistant Instructions

## Core Technology Context
- **Framework**: Hono.js (ultrafast web framework for edge computing)
- **Runtime**: Cloudflare Workers with TypeScript
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Frontend**: HTMX + server-rendered HTML templates
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Wrangler CLI

## Development Workflow
1. **Understand First**: Read existing code patterns and project structure
2. **Plan with Todos**: Use TodoWrite to break down complex tasks
3. **Follow Conventions**: Match existing code style and patterns
4. **Test Changes**: Run `npm test` for unit tests, `npm run test:e2e` for E2E
5. **Build Verification**: Run `npm run build` to ensure TypeScript compilation
6. **Keep it Simple**: Make minimal, targeted changes

## Key Project Patterns
- **Templates**: Server-side HTML templates in `/src/templates/`
- **Routes**: Hono route handlers in `/src/routes/`
- **Database**: Drizzle schema in `/src/db/schema.ts`
- **Plugins**: Modular plugin system in `/src/plugins/`
- **Services**: Business logic in `/src/services/`
- **Validation**: Zod schemas in `/src/schemas/`

## Common Commands
- `npm run dev` - Start development server
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run build` - Build and validate TypeScript
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply migrations locally

## Best Practices
- Always use TypeScript with strict typing
- Follow the existing template pattern for HTML generation
- Use Drizzle for all database operations
- Validate inputs with Zod schemas
- Keep edge-first performance in mind
- Maintain the plugin architecture for extensibility
