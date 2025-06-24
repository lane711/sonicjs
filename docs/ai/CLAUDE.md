# SonicJS AI Development Guidelines

This project is a Cloudflare-native headless CMS built with **Hono.js** and TypeScript.

## Core Technology Stack
- **Framework**: Hono.js (ultrafast web framework)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Validation**: Zod schemas
- **Testing**: Vitest (unit tests) + Playwright (E2E)
- **Frontend**: HTMX + HTML for admin interface
- **Deployment**: Wrangler CLI

## Development Workflow

1. **Plan First**: Read the codebase, understand the problem, and write a plan to project-plan.md
2. **Todo Management**: Create specific todo items that can be checked off as you complete them
3. **Get Approval**: Before starting work, check in with me to verify the plan
4. **Iterative Development**: Work through todo items, marking them complete as you go
5. **High-Level Updates**: Give brief explanations of changes made at each step
6. **Simplicity Focus**: Make minimal, targeted changes. Avoid complex refactoring.
7. **Documentation**: Add a review section to project-plan.md summarizing changes

## Key Principles
- **Edge-First**: Leverage Cloudflare's global edge network
- **TypeScript-First**: Strong typing throughout the application
- **Configuration over UI**: Developer-centric approach
- **AI-Friendly**: Clean, structured codebase for AI assistance