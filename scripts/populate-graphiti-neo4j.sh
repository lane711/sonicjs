#!/bin/bash

# Populate Graphiti Knowledge Graph via Direct Neo4j Access
# This script adds comprehensive SonicJS AI project information to the Neo4j database

GROUP_ID="sonicjs-ai"
CONTAINER="mcp_server-neo4j-1"
NEO4J_USER="neo4j"
NEO4J_PASS="demodemo"

echo "============================================================"
echo "SonicJS AI - Graphiti Knowledge Graph Population via Neo4j"
echo "============================================================"
echo ""

# Function to execute Cypher query
execute_cypher() {
    local query="$1"
    local description="$2"

    echo "Adding: $description"
    docker exec "$CONTAINER" cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASS" "$query" 2>&1 | grep -v "^0 rows available" | grep -v "^Set" || true
    echo "✓ Done"
    sleep 0.2
}

echo "📋 Adding Project Overview..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'SonicJS AI Project Overview',
    content: 'Project Name: SonicJS AI. Version: 2.0.0-alpha.5. Type: Headless CMS. License: MIT. Repository: https://github.com/lane711/sonicjs-ai. Description: A modern, TypeScript-first headless CMS built specifically for Cloudflare edge platform with Hono.js. SonicJS AI emphasizes performance, developer experience, and AI-friendly architecture. Primary Purpose: Content Management System designed for edge-first architecture on Cloudflare Workers, developer-centric configuration over UI, AI-assisted development workflows, plugin-based extensibility, and global performance at the edge. Key Features: Edge-First built for Cloudflare Workers with global performance, Developer-Centric configuration over UI with TypeScript-first approach, AI-Friendly structured codebase designed for AI-assisted development, Plugin System for extensible architecture without core modifications, Modern Stack with Hono.js, TypeScript, D1, R2, and HTMX.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Project Overview"

echo ""
echo "🔧 Adding Technology Stack..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'Technology Stack',
    content: 'Core Framework: Hono.js 4.7.3 ultrafast web framework for Cloudflare Workers, TypeScript 5.8.3 for strict type safety, HTMX for enhanced HTML. Cloudflare Platform Services: Cloudflare Workers for serverless compute at edge, D1 Database SQLite at edge for data persistence, R2 Storage for object storage of media files and assets, KV Storage for key-value caching and session management, Cloudflare Images API for image optimization and transformation. Database and ORM: Drizzle ORM 0.44.2 for type-safe database queries and migrations, Drizzle Kit 0.31.2 for database migration tooling, Zod 3.25.67 for schema validation and type inference. Development Tools: Vitest 2.1.8 for fast unit testing, Playwright 1.53.1 for end-to-end testing and browser automation, Wrangler 4.20.5 Cloudflare CLI for local development and deployment, TSX 4.20.3 for TypeScript execution, Husky 9.1.7 for git hooks. Additional Libraries: hono/zod-openapi 0.19.8 for OpenAPI specification generation, hono/zod-validator 0.7.0 for request validation, Commander 14.0.0 for CLI commands, Marked 15.0.12 for markdown parsing, Highlight.js 11.11.1 for syntax highlighting, Semver 7.7.2 for semantic versioning, Motion 12.23.22 for animation.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Technology Stack"

echo ""
echo "🏗️ Adding Architecture..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'Architecture Principles',
    content: 'SonicJS AI Architecture: Edge-First design runs entirely on Cloudflare global edge network. Zero Cold Starts using V8 isolates for instant startup. TypeScript-Native with full typing for developer experience. Plugin-Driven extensible through robust plugin system. Performance-Optimized with three-tier caching for sub-millisecond response times. System Layers: 1) Middleware Pipeline for request preprocessing authentication authorization security headers performance monitoring and logging, 2) Route Handler for request routing parameter validation response formatting and error handling, 3) Service Layer for business logic data transformation cache management and external integrations, 4) Data Layer for data persistence cache storage and query execution. V8 Isolates Model provides instant startup with no cold starts, memory isolation between requests, automatic scaling to handle traffic spikes, global distribution across 300+ Cloudflare locations. Performance Metrics: First request cold 50-100ms, Cached request memory 1-5ms, Cached request KV 10-50ms, Database query 100-200ms.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Architecture"

echo ""
echo "🔌 Adding Plugin System..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'Plugin System Architecture',
    content: 'SonicJS Plugin System Core Components: 1) Plugin Manager is central orchestrator managing plugin installation activation deactivation resolving dependencies providing plugin context and handling lifecycle events. 2) Plugin Registry manages plugin registration and status tracking installed plugins handling activation/deactivation resolving dependency order validating requirements. 3) Hook System provides event-driven extensibility registering hook handlers executing hooks with priority ordering supporting hook cancellation preventing infinite recursion. 4) Plugin Validator ensures plugin integrity by validating structure checking dependencies verifying compatibility and reporting errors/warnings. Plugin Lifecycle Stages: Install creates database tables initializes configuration sets up initial data. Activate initializes services registers event listeners starts background tasks. Configure updates service settings reconfigures connections applies new settings. Deactivate stops background tasks unregisters listeners cleans up resources. Uninstall removes database tables deletes plugin data cleans up all traces. Core Plugins: Auth Plugin for authentication and authorization, Media Plugin for file upload and media management, Analytics Plugin for usage tracking, FAQ Plugin for FAQ management, Demo Login Plugin for development shortcuts, Database Tools Plugin for database management, Seed Data Plugin for test data generation, Testimonials Plugin and Code Examples Plugin. Advanced Plugins: Workflow Plugin for content workflow management, Cache Plugin for three-tiered caching, Design Plugin for design system and theme management, Email Templates Plugin for email composition and sending.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Plugin System"

echo ""
echo "💾 Adding Caching System..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'Three-Tiered Caching System',
    content: 'Cache Architecture with Three Tiers: Tier 1 In-Memory Cache with latency approximately 1ms, scope regional edge location only 50MB per worker, LRU eviction policy implementation, use case for hot data with highest access frequency. Tier 2 Cloudflare KV Cache with latency 10-50ms globally, scope distributed across all edge locations, global CDN implementation with unlimited size, use case for frequently accessed data needing global availability. Tier 3 D1 Database as Source of Truth with latency 100-200ms, scope persistent SQLite at edge, full data with query capabilities implementation, use case for source of truth when cache misses occur. Cache Lookup Flow: 1) Try memory cache Tier 1 if hit return in approximately 1ms, 2) Try KV cache Tier 2 if hit populate memory and return in 10-50ms, 3) Query database Tier 3 populate both caches and return in 100-200ms. Cache Configurations: Content Cache TTL 3600s with Memory and KV enabled invalidating on content.update content.delete content.publish. User Cache TTL 900s with Memory and KV enabled invalidating on user.update user.delete auth.login. API Cache TTL 300s with Memory and KV enabled invalidating on content.update content.publish. Event-Based Invalidation provides automatic cache invalidation based on application events, pattern-based invalidation using wildcards, namespace isolation prevents cross-contamination, tracks invalidation statistics and recent invalidations.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Caching System"

echo ""
echo "🔐 Adding Authentication..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'Authentication and Security',
    content: 'Authentication Implementation: JWT JSON Web Tokens for stateless authentication with 24-hour expiration. HTTP-only cookies for web clients with Strict SameSite policy. Bearer token support for API clients. Cloudflare KV caching for token verification with 5-minute TTL. SHA-256 password hashing with salt. JWT Token Structure: Payload contains userId email role exp expiration and iat issued at. Signed with JWT_SECRET 256-bit secret. Cached in KV to reduce verification overhead. Automatic expiration after 24 hours. Role-Based Access Control RBAC: admin role has full system access user management and settings. editor role has content management media upload and publishing capabilities. viewer role has read-only access to content and media. Permission System: Content permissions include content.create content.read content.update content.delete content.publish. Collections permissions include collections.create collections.read collections.update collections.delete collections.fields. Media permissions include media.upload media.read media.update media.delete. Users permissions include users.create users.read users.update users.delete users.roles. Settings permissions include settings.read settings.update activity.read. Middleware: requireAuth verifies JWT token and sets user context. requireRole checks user has specific roles. requirePermission checks user has specific permission. requireAnyPermission checks user has any of the permissions. optionalAuth allows both authenticated and anonymous access.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Authentication & Security"

echo ""
echo "🌐 Adding API Structure..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'API Structure and Endpoints',
    content: 'API Endpoints Overview: Authentication Endpoints at /auth include POST /auth/register for user registration, POST /auth/login for user login returning JWT token, POST /auth/refresh to refresh JWT token, GET /auth/me to get current authenticated user, POST /auth/logout to clear authentication, POST /auth/request-password-reset to request password reset link, POST /auth/reset-password to reset password with token, POST /auth/accept-invitation to accept user invitation. Collections Endpoints at /api/collections include GET /api/collections to list all active collections with schemas, GET /api/collections/{collection}/content to get content for specific collection. Content Endpoints at /api/content include GET /api/content to list all published content with pagination, GET /api/content/{id} to get single content item by ID. Media Endpoints at /api/media include POST /api/media/upload to upload single file multipart/form-data, POST /api/media/upload-multiple to upload multiple files, DELETE /api/media/{id} to delete media file, POST /api/media/bulk-delete for bulk deletion max 50 per operation, PATCH /api/media/{id} to update file metadata. Admin Endpoints require authentication and admin/editor role: Content Management at /admin/content, Media Management at /admin/media, User Management at /admin/users, Plugin Management at /admin/plugins, Cache Management at /admin/cache. API Features: OpenAPI 3.0 specification at /api/, Interactive documentation at /docs using Scalar UI, JSON responses with metadata including count timestamp cache info and timing, Cache headers include X-Cache-Status X-Cache-Source X-Cache-TTL X-Response-Time, Error responses with status codes 400 401 403 404 500, Pagination support with limit offset and page parameters.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "API Structure"

echo ""
echo "🛣️ Adding Routes and Middleware..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'Routes and Middleware System',
    content: 'Route Organization: Public Routes include /auth/* for authentication pages login register logout, /docs for API documentation and playground, /health for health check endpoint. API Routes at /api/* include /api/collections for collections management public read, /api/content for content access public read auth for write, /api/media for media management requires auth for uploads. Content Routes at /content/* provide public content delivery with optional authentication supporting different views for authenticated vs anonymous users. Admin Routes at /admin/* all require authentication and appropriate roles: /admin for admin dashboard, /admin/content for content management interface, /admin/media for media library and upload, /admin/collections for collection management, /admin/users for user management admin only, /admin/plugins for plugin management, /admin/cache for cache monitoring and control, /admin/logs for activity logs admin only. Middleware Pipeline Execution Order: Priority 0 Bootstrap Middleware runs database migrations on first request syncs collection configurations bootstraps core plugins skips for static assets and health checks. Priority 1 Logging Middleware generates unique request ID records start time and request metadata performance logging for slow requests over 1000ms threshold security event logging. Priority 2 Security Middleware checks for suspicious patterns SQL injection XSS adds security headers X-Frame-Options X-Content-Type-Options logs security events handles CORS. Priority 5 Authentication Middleware route-specific extracts JWT from Authorization header or auth_token cookie checks KV cache for token verification 5-minute TTL verifies JWT signature and expiration sets user context in request. Priority 10 Authorization Middleware route-specific provides role-based access control requireRole permission checks requirePermission team-based permissions.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Routes and Middleware"

echo ""
echo "🗄️ Adding Database Structure..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'Database Structure and Schema',
    content: 'SonicJS AI Database Structure using Cloudflare D1 SQLite: Core Tables include users table with id PRIMARY KEY for user unique identifier, email UNIQUE for user email normalized lowercase, username UNIQUE for user login name, password_hash for SHA-256 hashed password with salt, first_name and last_name for user name fields, role for user role admin editor viewer, is_active for account activation status, email_verified for email verification status, invitation_token and password_reset_token for token fields, invited_at and last_login_at for timestamp fields, created_at and updated_at for audit timestamps. collections table with id PRIMARY KEY for collection identifier, name UNIQUE for collection internal name, display_name for human-readable name, description for collection purpose, schema for JSON schema definition, is_active for activation status, created_at and updated_at for audit timestamps. content table with id PRIMARY KEY for content identifier, title for content title, slug UNIQUE for URL-safe identifier, data for JSON field with dynamic content, collection_id for foreign key to collections, status for workflow status draft published archived, author_id for foreign key to users, created_at updated_at and published_at for timestamps. content_fields table, media table with filename original_name mime_type size folder uploaded_by and created_at fields. content_versions table for complete revision history. user_sessions table for session tracking with token_hash ip_address user_agent is_active expires_at created_at and last_used_at fields. activity_logs table for audit trail with user_id action resource_type resource_id details ip_address user_agent and created_at fields. permissions table and role_permissions table for RBAC implementation. plugins table for plugin management. Database Features: Foreign key constraints with ON DELETE CASCADE, Unique constraints on email username and slug, Index on frequently queried fields, JSON fields for flexible schema, Timestamp tracking with INTEGER Unix timestamps, Soft deletes via is_active flags. Migration System uses Drizzle ORM for schema definition, version-controlled migration files, automatic migration on first request via bootstrap middleware, migration tracking in _migrations table.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Database Structure"

echo ""
echo "⚙️ Adding Development Workflow..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'Development Workflow',
    content: 'Development Commands: npm run dev starts development server with Wrangler, npm test runs unit tests with Vitest, npm run test:watch provides watch mode for tests, npm run test:cov runs tests with coverage, npm run test:e2e runs end-to-end tests with Playwright, npm run test:e2e:ui provides E2E tests with UI. Build and Deployment: npm run build builds and dry-runs deployment, npm run predeploy runs tests and build before deploy, npm run deploy deploys to Cloudflare Workers. Database Operations: npm run db:generate generates Drizzle migrations, npm run db:migrate applies migrations to local D1, npm run db:migrate:prod applies migrations to production, npm run db:studio opens Drizzle Studio for database browsing. Utilities: npm run sync-collections syncs collection definitions, npm run sonicjs runs CLI commands, npm run type-check provides TypeScript type checking, npm run lint runs type check. Project Structure: src/routes/ contains Hono.js route handlers with admin*.ts for admin interface routes, api*.ts for REST API endpoints, auth.ts for authentication routes. src/templates/ contains HTML templates and components with layouts/ for page layouts admin and public, pages/ for full page templates, components/ for reusable UI components. src/middleware/ contains Hono.js middleware with auth.ts for authentication and authorization, permissions.ts for permission checking, bootstrap.ts for system initialization, logging.ts for request logging, performance.ts for performance middleware. src/plugins/ contains plugin system with core/ for plugin manager registry and hooks, core-plugins/ for built-in plugins, available/ for optional plugins, cache/ for caching plugin. src/utils/ contains utility functions. src/scripts/ contains database and deployment scripts. migrations/ contains database migration files. tests/ contains unit and integration tests with e2e/ subdirectory for end-to-end test suites. Code Quality: TypeScript strict mode enabled, Full type coverage required, Vitest for unit tests, Playwright for E2E tests, Coverage tracking with @vitest/coverage-v8. Local Development Setup: 1) Clone repository, 2) npm install to install dependencies, 3) npm run db:migrate to set up local database, 4) npm run dev to start development server, 5) Access at http://localhost:8787.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Development Workflow"

echo ""
echo "🚀 Adding Advanced Features..."
execute_cypher "
CREATE (e:Episodic {
    id: randomUUID(),
    name: 'Advanced Features',
    content: 'Content Management Features: Rich Text Editor Integration using TinyMCE WYSIWYG editor with customizable toolbars supporting tables images links and code blocks, media picker integration for embedding files, full HTML editing with syntax highlighting. Dynamic Field System provides custom field types including text richtext number boolean date select and media, field validation with required min/max and regex patterns, conditional field display based on other fields, field groups and sections for organization. Content Versioning maintains complete revision history for all content, restore to any previous version capability, tracks changes with user attribution, version comparison planned, automatic versioning on save. Content Scheduling supports publish/unpublish automation with date controls, schedule content for future publication, automatic archiving based on date, preview scheduled content before going live. Workflow System provides Draft to Review to Published to Archived states, role-based permissions for each state, automated transitions based on rules, notification system for workflow events, audit trail of all state changes. Auto-Save Feature provides automatic content saving every 30 seconds, recovery from browser crashes, draft preservation across sessions, visual indicator for save status. Live Preview provides real-time content preview before publishing, preview in context of actual templates, mobile and desktop preview modes, share preview links with stakeholders. Security Features: XSS Protection with comprehensive input validation, HTML escaping for all user inputs, Content Security Policy headers, sanitization of rich text content. CSRF Protection using SameSite cookie policy Strict, token validation for state-changing operations, origin verification. SQL Injection Prevention using parameterized queries via Drizzle ORM, input validation with Zod schemas, no raw SQL from user input. Activity Logging tracks all security-sensitive actions with user attribution including IP and user agent, provides searchable audit trail, implements retention policies for compliance. Media Management: File Upload Features provide drag-and-drop interface, multiple file upload capability, progress indicators, client-side validation before upload. Image Processing integrates Cloudflare Images API optionally, automatic thumbnail generation, image optimization and compression, format conversion JPEG PNG WebP. Media Organization uses folder-based organization, tags and categories, search and filter by metadata, bulk operations including move delete and tag.',
    group_id: '$GROUP_ID',
    created_at: datetime(),
    valid_at: datetime()
})
" "Advanced Features"

echo ""
echo "============================================================"
echo "✅ Knowledge graph population complete!"
echo "📊 All episodes added to group: $GROUP_ID"
echo "🗄️  Database: Neo4j via Docker"
echo "============================================================"
