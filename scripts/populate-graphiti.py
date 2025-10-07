#!/usr/bin/env python3
"""
Populate Graphiti Knowledge Graph with SonicJS AI Project Information

This script comprehensively documents the SonicJS AI project in the graphiti
knowledge graph, including architecture, features, plugins, and development practices.
"""

import requests
import json
import time
from datetime import datetime

# Graphiti server configuration
GRAPHITI_URL = "http://localhost:8000"
GROUP_ID = "sonicjs-ai"

def add_episode(content: str, name: str = None) -> dict:
    """Add an episode to the graphiti knowledge graph"""
    url = f"{GRAPHITI_URL}/add_episode"

    payload = {
        "group_id": GROUP_ID,
        "content": content
    }

    if name:
        payload["name"] = name

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        print(f"✓ Added episode: {name if name else 'Episode'}")
        time.sleep(0.5)  # Rate limiting
        return result
    except Exception as e:
        print(f"✗ Failed to add episode '{name}': {e}")
        return None

def clear_graph():
    """Clear the existing graph (optional)"""
    url = f"{GRAPHITI_URL}/clear_graph"
    try:
        response = requests.post(url, json={"group_id": GROUP_ID})
        response.raise_for_status()
        print("✓ Graph cleared")
    except Exception as e:
        print(f"✗ Failed to clear graph: {e}")

def populate_project_overview():
    """Add project overview and core information"""
    print("\n📋 Adding Project Overview...")

    add_episode("""
**Project Name**: SonicJS AI
**Version**: 2.0.0-alpha.5
**Type**: Headless CMS
**License**: MIT
**Repository**: https://github.com/lane711/sonicjs-ai

**Description**: A modern, TypeScript-first headless CMS built specifically for Cloudflare's edge platform with Hono.js. SonicJS AI emphasizes performance, developer experience, and AI-friendly architecture.

**Primary Purpose**: Content Management System designed for:
- Edge-first architecture on Cloudflare Workers
- Developer-centric configuration over UI
- AI-assisted development workflows
- Plugin-based extensibility
- Global performance at the edge

**Key Features**:
- Edge-First: Built specifically for Cloudflare Workers with global performance
- Developer-Centric: Configuration over UI, TypeScript-first approach
- AI-Friendly: Structured codebase designed for AI-assisted development
- Plugin System: Extensible architecture without core modifications
- Modern Stack: Hono.js, TypeScript, D1, R2, and HTMX
""", "SonicJS AI Project Overview")

def populate_technology_stack():
    """Add technology stack information"""
    print("\n🔧 Adding Technology Stack...")

    add_episode("""
**Core Framework**:
- Hono.js 4.7.3: Ultrafast web framework for Cloudflare Workers
- TypeScript 5.8.3: Strict type safety throughout the application
- HTMX: Enhanced HTML for dynamic interfaces without heavy JavaScript

**Cloudflare Platform Services**:
- Cloudflare Workers: Serverless compute runtime at the edge
- D1 Database: SQLite database at the edge for data persistence
- R2 Storage: Object storage for media files and assets
- KV Storage: Key-value storage for caching and session management
- Cloudflare Images API: Image optimization and transformation

**Database & ORM**:
- Drizzle ORM 0.44.2: Type-safe database queries and migrations
- Drizzle Kit 0.31.2: Database migration tooling
- Zod 3.25.67: Schema validation and type inference

**Development Tools**:
- Vitest 2.1.8: Fast unit testing framework
- Playwright 1.53.1: End-to-end testing and browser automation
- Wrangler 4.20.5: Cloudflare CLI for local development and deployment
- TSX 4.20.3: TypeScript execution for scripts
- Husky 9.1.7: Git hooks for code quality

**Additional Libraries**:
- @hono/zod-openapi 0.19.8: OpenAPI specification generation
- @hono/zod-validator 0.7.0: Request validation
- Commander 14.0.0: CLI command framework
- Marked 15.0.12: Markdown parsing and rendering
- Highlight.js 11.11.1: Syntax highlighting
- Semver 7.7.2: Semantic versioning utilities
- Motion 12.23.22: Animation library
""", "Technology Stack and Dependencies")

def populate_architecture():
    """Add architecture information"""
    print("\n🏗️ Adding Architecture Information...")

    add_episode("""
**SonicJS AI Architecture**:

**Architecture Principles**:
- Edge-First: Runs entirely on Cloudflare's global edge network
- Zero Cold Starts: V8 isolates provide instant startup
- TypeScript-Native: Fully typed for developer experience
- Plugin-Driven: Extensible through a robust plugin system
- Performance-Optimized: Three-tier caching for sub-millisecond response times

**System Layers**:

1. **Middleware Pipeline**: Request preprocessing, authentication, authorization, security headers, performance monitoring, logging
2. **Route Handler**: Request routing, parameter validation, response formatting, error handling
3. **Service Layer**: Business logic, data transformation, cache management, external integrations
4. **Data Layer**: Data persistence, cache storage, query execution

**Request Lifecycle**:
1. Request arrives at Cloudflare edge
2. Bootstrap Middleware runs database migrations and system initialization
3. Logging Middleware generates request ID and records metrics
4. Security Middleware checks for suspicious patterns and adds headers
5. Authentication Middleware extracts JWT and verifies user
6. Permission Middleware checks user permissions
7. Plugin Middleware executes plugin hooks
8. Route Handler executes business logic
9. Response Processing adds cache headers and timing metadata
10. Return to client

**V8 Isolates Model**:
- Instant startup with no cold starts
- Memory isolation between requests
- Automatic scaling to handle traffic spikes
- Global distribution across 300+ Cloudflare locations

**Performance Metrics**:
- First request (cold): 50-100ms
- Cached request (memory): 1-5ms
- Cached request (KV): 10-50ms
- Database query: 100-200ms
""", "SonicJS AI Architecture")

def populate_plugin_system():
    """Add plugin system information"""
    print("\n🔌 Adding Plugin System...")

    add_episode("""
**SonicJS Plugin System Architecture**:

**Core Components**:

1. **Plugin Manager**: Central orchestrator that manages plugin installation, activation, deactivation, resolves dependencies, provides plugin context, and handles lifecycle events

2. **Plugin Registry**: Manages plugin registration and status, tracks installed plugins, handles activation/deactivation, resolves dependency order, validates requirements

3. **Hook System**: Provides event-driven extensibility, registers hook handlers, executes hooks with priority ordering, supports hook cancellation, prevents infinite recursion

4. **Plugin Validator**: Ensures plugin integrity by validating structure, checking dependencies, verifying compatibility, reporting errors/warnings

**Plugin Lifecycle Stages**:
- Install: Create database tables, initialize configuration, set up initial data
- Activate: Initialize services, register event listeners, start background tasks
- Configure: Update service settings, reconfigure connections, apply new settings
- Deactivate: Stop background tasks, unregister listeners, clean up resources
- Uninstall: Remove database tables, delete plugin data, clean up all traces

**Hook Priority System**:
- Priority 1-5: Critical hooks that must run first
- Priority 6-10: Normal hooks (default is 10)
- Priority 11+: Lower priority hooks

**Standard Hooks**:
- Application lifecycle: app:init, app:ready, app:shutdown
- Request lifecycle: request:start, request:end, request:error
- Authentication: auth:login, auth:logout, auth:register, user:login, user:logout
- Content lifecycle: content:create, content:update, content:delete, content:publish, content:save
- Media lifecycle: media:upload, media:delete, media:transform
- Plugin lifecycle: plugin:install, plugin:uninstall, plugin:activate, plugin:deactivate

**Available Plugins**:

**Core Plugins** (automatically loaded):
- Auth Plugin: Authentication and authorization services
- Media Plugin: File upload and media management
- Analytics Plugin: Usage tracking and metrics
- FAQ Plugin: Frequently asked questions management
- Demo Login Plugin: Development login shortcuts
- Database Tools Plugin: Database management utilities
- Seed Data Plugin: Test data generation
- Testimonials Plugin: Customer testimonials
- Code Examples Plugin: Code snippet management

**Advanced Plugins**:
- Workflow Plugin: Content workflow management (draft → review → published → archived)
- Cache Plugin: Three-tiered caching system (memory, KV, database)
- Design Plugin: Design system and theme management
- Email Templates Plugin: Email composition and sending

**Plugin Extension Points**:
- Routes: Add new API endpoints
- Middleware: Intercept and modify requests
- Models: Define database schemas
- Services: Business logic and utilities
- Admin Pages: UI components for admin interface
- Hooks: Event listeners and data transformation
""", "Plugin System Architecture")

def populate_three_tier_cache():
    """Add caching system information"""
    print("\n💾 Adding Caching System...")

    add_episode("""
**Three-Tiered Caching System**:

**Cache Architecture**:

**Tier 1 - In-Memory Cache**:
- Latency: ~1ms
- Scope: Regional edge location only (50MB per worker)
- Implementation: LRU eviction policy
- Use case: Hot data with highest access frequency

**Tier 2 - Cloudflare KV Cache**:
- Latency: ~10-50ms globally
- Scope: Distributed across all edge locations
- Implementation: Global CDN with unlimited size
- Use case: Frequently accessed data that needs global availability

**Tier 3 - D1 Database (Source of Truth)**:
- Latency: ~100-200ms
- Scope: Persistent SQLite at the edge
- Implementation: Full data with query capabilities
- Use case: Source of truth when cache misses occur

**Cache Lookup Flow**:
1. Try memory cache (Tier 1) - if hit, return in ~1ms
2. Try KV cache (Tier 2) - if hit, populate memory and return in ~10-50ms
3. Query database (Tier 3) - populate both caches and return in ~100-200ms

**Cache Configurations by Entity**:

- **Content Cache**: TTL 3600s (1 hour), Memory + KV enabled, Invalidate on: content.update, content.delete, content.publish
- **User Cache**: TTL 900s (15 minutes), Memory + KV enabled, Invalidate on: user.update, user.delete, auth.login
- **API Cache**: TTL 300s (5 minutes), Memory + KV enabled, Invalidate on: content.update, content.publish
- **Collections Cache**: TTL 7200s (2 hours), Memory + KV enabled, Invalidate on: collection changes
- **Media Metadata Cache**: TTL 3600s (1 hour), Memory + KV enabled, Invalidate on: media.upload, media.delete
- **Session Cache**: TTL 1800s (30 minutes), Memory only, No KV storage for security

**Event-Based Invalidation**:
- Automatic cache invalidation based on application events
- Pattern-based invalidation (e.g., invalidate all user:* keys)
- Namespace isolation prevents cross-contamination
- Tracks invalidation statistics and recent invalidations

**Cache Features**:
- getOrSet pattern: Fetch from cache or compute if missing
- Pattern-based invalidation with wildcard support
- Statistics tracking (hits, misses, hit rate, memory size)
- Version-based cache busting
- Warming strategies for predictable access patterns
""", "Three-Tiered Caching System")

def populate_authentication():
    """Add authentication and security information"""
    print("\n🔐 Adding Authentication & Security...")

    add_episode("""
**Authentication & Security System**:

**Authentication Implementation**:
- JWT (JSON Web Tokens) for stateless authentication with 24-hour expiration
- HTTP-only cookies for web clients with Strict SameSite policy
- Bearer token support for API clients
- Cloudflare KV caching for token verification (5-minute TTL)
- SHA-256 password hashing with salt

**JWT Token Structure**:
- Payload contains: userId, email, role, exp (expiration), iat (issued at)
- Signed with JWT_SECRET (256-bit secret)
- Cached in KV to reduce verification overhead
- Automatic expiration after 24 hours

**Password Security**:
- SHA-256 hashing with salt via Web Crypto API
- Password history tracking in password_history table
- Minimum 8 character requirement
- Reset tokens expire after 1 hour
- Invitation tokens expire after 7 days

**Role-Based Access Control (RBAC)**:

**Roles**:
- admin: Full system access, user management, settings
- editor: Content management, media upload, publishing
- viewer: Read-only access to content and media

**Permission System**:

Content Permissions: content.create, content.read, content.update, content.delete, content.publish
Collections Permissions: collections.create, collections.read, collections.update, collections.delete, collections.fields
Media Permissions: media.upload, media.read, media.update, media.delete
Users Permissions: users.create, users.read, users.update, users.delete, users.roles
Settings Permissions: settings.read, settings.update, activity.read

**Middleware**:
- requireAuth(): Verify JWT token and set user context
- requireRole(role): Check user has specific role(s)
- requirePermission(permission): Check user has specific permission
- requireAnyPermission(permissions): Check user has any of the permissions
- optionalAuth(): Allow both authenticated and anonymous access

**Session Management**:
- HTTP-only cookies prevent JavaScript access
- Secure flag enforced in production (HTTPS only)
- Session tracking in user_sessions table with IP, user agent
- Token rotation strategy for long-lived sessions
- Automatic expiration and cleanup

**User Workflows**:
- Registration: Create user with viewer role, hash password, generate JWT
- Login: Verify credentials, update last_login_at, invalidate user cache, generate token
- Password Reset: Generate unique token (1 hour expiration), email link, verify and update password
- User Invitation: Admin creates inactive user, send invitation link (7 days), user accepts and activates

**Security Best Practices Implemented**:
- HTTPS-only cookies in production
- CSRF protection via SameSite cookie policy
- XSS protection via Content Security Policy headers
- Activity logging for security-sensitive actions
- Rate limiting on authentication endpoints (planned)
- Permission caching with 5-minute TTL
- Automatic token expiration
""", "Authentication and Security System")

def populate_api_structure():
    """Add API structure information"""
    print("\n🌐 Adding API Structure...")

    add_episode("""
**SonicJS AI API Structure**:

**API Endpoints Overview**:

**Base URLs**:
- Production: https://your-domain.com/api
- Development: http://localhost:8787/api

**Authentication Endpoints** (/auth):
- POST /auth/register: User registration with email and password
- POST /auth/login: User login returning JWT token
- POST /auth/refresh: Refresh JWT token
- GET /auth/me: Get current authenticated user
- POST /auth/logout: Clear authentication and logout
- POST /auth/request-password-reset: Request password reset link
- POST /auth/reset-password: Reset password with token
- POST /auth/accept-invitation: Accept user invitation

**Collections Endpoints** (/api/collections):
- GET /api/collections: List all active collections with schemas
- GET /api/collections/{collection}/content: Get content for specific collection

**Content Endpoints** (/api/content):
- GET /api/content: List all published content with pagination (limit parameter)
- GET /api/content/{id}: Get single content item by ID

**Media Endpoints** (/api/media):
- POST /api/media/upload: Upload single file (multipart/form-data)
- POST /api/media/upload-multiple: Upload multiple files
- DELETE /api/media/{id}: Delete media file
- POST /api/media/bulk-delete: Bulk delete files (max 50 per operation)
- PATCH /api/media/{id}: Update file metadata (alt, caption, tags)

**Admin Endpoints** (require authentication and admin/editor role):

Content Management (/admin/content):
- GET /admin/content/new: Create new content form
- GET /admin/content/{id}/edit: Edit content form
- POST /admin/content/: Create content with validation
- PUT /admin/content/{id}: Update content with versioning
- DELETE /admin/content/{id}: Delete content
- POST /admin/content/preview: Preview before publishing
- POST /admin/content/duplicate: Duplicate existing content
- GET /admin/content/{id}/versions: Get version history
- POST /admin/content/{id}/restore/{version}: Restore specific version

Media Management (/admin/media):
- GET /admin/media: Media library interface
- POST /admin/media/upload: Upload interface

User Management (/admin/users):
- GET /admin/users: List all users
- POST /admin/users/invite: Invite new user (admin only)
- PUT /admin/users/{id}: Update user profile/role
- DELETE /admin/users/{id}: Deactivate user

Plugin Management (/admin/plugins):
- GET /admin/plugins: List installed plugins
- POST /admin/plugins/{id}/activate: Activate plugin
- POST /admin/plugins/{id}/deactivate: Deactivate plugin
- PUT /admin/plugins/{id}/config: Update plugin configuration

Cache Management (/admin/cache):
- GET /admin/cache/stats: Cache statistics
- POST /admin/cache/clear: Clear all caches
- POST /admin/cache/invalidate: Invalidate by pattern

**API Features**:
- OpenAPI 3.0 specification at /api/
- Interactive documentation at /docs (Scalar UI)
- JSON responses with metadata (count, timestamp, cache info, timing)
- Cache headers (X-Cache-Status, X-Cache-Source, X-Cache-TTL, X-Response-Time)
- Error responses with status codes (400, 401, 403, 404, 500)
- Pagination support (limit, offset, page parameters)

**Response Format**:
{
  "data": [...],
  "meta": {
    "count": 10,
    "timestamp": "2025-10-06T12:34:56.789Z",
    "cache": {
      "hit": true,
      "source": "memory",
      "ttl": 278
    },
    "timing": {
      "total": 3,
      "execution": 1,
      "unit": "ms"
    }
  }
}

**Supported File Types for Media**:
- Images: JPEG, PNG, GIF, WebP, SVG
- Documents: PDF, TXT, DOC, DOCX
- Videos: MP4, WebM, OGG, AVI, MOV
- Audio: MP3, WAV, OGG, M4A
- Max file size: 50MB
""", "API Structure and Endpoints")

def populate_routes_and_middleware():
    """Add routes and middleware information"""
    print("\n🛣️ Adding Routes & Middleware...")

    add_episode("""
**SonicJS AI Routes and Middleware**:

**Route Organization**:

**Public Routes**:
- /auth/* - Authentication pages (login, register, logout)
- /docs - API documentation and playground
- /health - Health check endpoint

**API Routes** (/api/*):
- /api/collections - Collections management (public read)
- /api/content - Content access (public read, auth for write)
- /api/media - Media management (requires auth for uploads)

**Content Routes** (/content/*):
- Public content delivery with optional authentication
- Supports different views for authenticated vs anonymous users

**Admin Routes** (/admin/*):
All admin routes require authentication and appropriate roles:
- /admin - Admin dashboard
- /admin/content - Content management interface
- /admin/media - Media library and upload
- /admin/collections - Collection management
- /admin/users - User management (admin only)
- /admin/plugins - Plugin management
- /admin/cache - Cache monitoring and control
- /admin/logs - Activity logs (admin only)
- /admin/faq - FAQ management (requires faq plugin)
- /admin/testimonials - Testimonials (requires testimonials plugin)
- /admin/workflow - Workflow management (requires workflow plugin)
- /admin/design - Design system (requires design plugin)

**Middleware Pipeline (Execution Order)**:

Priority 0 - Bootstrap Middleware:
- Run database migrations on first request
- Sync collection configurations
- Bootstrap core plugins
- Skip for static assets and health checks

Priority 1 - Logging Middleware:
- Generate unique request ID
- Record start time and request metadata
- Performance logging for slow requests (>1000ms threshold)
- Security event logging

Priority 2 - Security Middleware:
- Check for suspicious patterns (SQL injection, XSS)
- Add security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Log security events
- CORS handling

Priority 3 - Core Middleware:
- Hono logger (skipped for high-frequency endpoints)
- CORS configuration
- Security headers
- Pretty JSON formatting for API routes

Priority 5 - Authentication Middleware (route-specific):
- Extract JWT from Authorization header or auth_token cookie
- Check KV cache for token verification (5-minute TTL)
- Verify JWT signature and expiration
- Set user context in request

Priority 10 - Authorization Middleware (route-specific):
- Role-based access control (requireRole)
- Permission checks (requirePermission)
- Team-based permissions

Priority 50+ - Plugin Middleware:
- Execute plugin-specific middleware
- Apply plugin hooks
- Custom business logic

**Middleware Implementation**:

bootstrapMiddleware():
- Ensures system initialization on first request
- Runs pending migrations
- Syncs collection configs
- Loads core plugins

loggingMiddleware():
- Generates requestId and tracks startTime
- Logs all requests with metadata

securityLoggingMiddleware():
- Detects and logs suspicious patterns
- Monitors for security threats

performanceLoggingMiddleware(threshold):
- Logs requests exceeding threshold (default 1000ms)
- Tracks performance issues

requireAuth():
- Validates JWT token
- Caches verification in KV (5 minutes)
- Sets user context

requireRole(roles):
- Checks user.role against required roles
- Returns 403 if insufficient permissions

requirePermission(permission):
- Checks if user has specific permission
- Caches permission results (5 minutes)

requireActivePlugin(pluginName):
- Ensures plugin is installed and active
- Returns 404 if plugin not available

securityHeaders():
- Adds X-Frame-Options, X-Content-Type-Options
- Sets strict security policies

cacheHeaders(ttl):
- Adds Cache-Control headers for browser caching
- Configurable TTL per route

**Route Guards**:
- Public routes: No authentication required
- API routes: Optional auth for reads, required for writes
- Admin routes: Require auth + admin/editor role
- Plugin routes: Require auth + active plugin + appropriate role
""", "Routes and Middleware System")

def populate_database_structure():
    """Add database structure information"""
    print("\n🗄️ Adding Database Structure...")

    add_episode("""
**SonicJS AI Database Structure (Cloudflare D1 - SQLite)**:

**Core Tables**:

**users**:
- id (PRIMARY KEY): User unique identifier
- email (UNIQUE): User email (normalized lowercase)
- username (UNIQUE): User login name
- password_hash: SHA-256 hashed password with salt
- first_name, last_name: User name fields
- role: User role (admin, editor, viewer)
- is_active: Account activation status
- email_verified: Email verification status
- invitation_token, password_reset_token: Token fields
- invited_at, last_login_at: Timestamp fields
- created_at, updated_at: Audit timestamps

**collections**:
- id (PRIMARY KEY): Collection identifier
- name (UNIQUE): Collection internal name
- display_name: Human-readable name
- description: Collection purpose
- schema: JSON schema definition
- is_active: Activation status
- created_at, updated_at: Audit timestamps

**content**:
- id (PRIMARY KEY): Content identifier
- title: Content title
- slug (UNIQUE): URL-safe identifier
- data: JSON field with dynamic content
- collection_id: Foreign key to collections
- status: Workflow status (draft, published, archived)
- author_id: Foreign key to users
- created_at, updated_at, published_at: Timestamps

**content_fields**:
- id (PRIMARY KEY): Field identifier
- collection_id: Foreign key to collections
- field_name: Field internal name
- field_type: Field data type (text, richtext, number, boolean, date, select, media)
- field_label: Display label
- field_options: JSON configuration
- order_index: Display order
- is_required: Validation flag

**media**:
- id (PRIMARY KEY): Media file identifier
- filename: Stored filename
- original_name: User's original filename
- mime_type: File MIME type
- size: File size in bytes
- folder: Organization folder path
- uploaded_by: Foreign key to users
- created_at: Upload timestamp

**content_versions**:
- id (PRIMARY KEY): Version identifier
- content_id: Foreign key to content
- data: JSON snapshot of content
- created_by: Foreign key to users
- created_at: Version timestamp
- version_number: Sequential version

**user_sessions**:
- id (PRIMARY KEY): Session identifier
- user_id: Foreign key to users
- token_hash: Hashed JWT token
- ip_address: Client IP
- user_agent: Browser information
- is_active: Session status
- expires_at: Expiration timestamp
- created_at, last_used_at: Timestamps

**activity_logs**:
- id (PRIMARY KEY): Log entry identifier
- user_id: Foreign key to users
- action: Action performed (user.login, content.created, etc.)
- resource_type: Type of resource affected
- resource_id: Affected resource ID
- details: JSON with additional data
- ip_address, user_agent: Client information
- created_at: Log timestamp

**permissions**:
- id (PRIMARY KEY): Permission identifier
- name (UNIQUE): Permission name (e.g., content.create)
- description: Permission purpose
- category: Permission category

**role_permissions**:
- role: User role (admin, editor, viewer)
- permission_id: Foreign key to permissions
- granted: Whether permission is granted

**plugins**:
- id (PRIMARY KEY): Plugin identifier
- name (UNIQUE): Plugin name
- version: Plugin version
- enabled: Activation status
- config: JSON configuration
- installed_at, updated_at: Timestamps

**Database Features**:
- Foreign key constraints with ON DELETE CASCADE
- Unique constraints on email, username, slug
- Index on frequently queried fields
- JSON fields for flexible schema
- Timestamp tracking with INTEGER Unix timestamps
- Soft deletes via is_active flags

**Migration System**:
- Drizzle ORM for schema definition
- Version-controlled migration files
- Automatic migration on first request via bootstrap middleware
- Migration tracking in _migrations table
""", "Database Structure and Schema")

def populate_development_workflow():
    """Add development workflow information"""
    print("\n⚙️ Adding Development Workflow...")

    add_episode("""
**SonicJS AI Development Workflow**:

**Development Commands**:
- npm run dev: Start development server with Wrangler
- npm test: Run unit tests with Vitest
- npm run test:watch: Watch mode for tests
- npm run test:cov: Run tests with coverage
- npm run test:e2e: Run end-to-end tests with Playwright
- npm run test:e2e:ui: E2E tests with UI

**Build and Deployment**:
- npm run build: Build and dry-run deployment
- npm run predeploy: Run tests and build before deploy
- npm run deploy: Deploy to Cloudflare Workers

**Database Operations**:
- npm run db:generate: Generate Drizzle migrations
- npm run db:migrate: Apply migrations to local D1
- npm run db:migrate:prod: Apply migrations to production
- npm run db:studio: Open Drizzle Studio for database browsing

**Utilities**:
- npm run sync-collections: Sync collection definitions
- npm run sonicjs: Run CLI commands
- npm run type-check: TypeScript type checking
- npm run lint: Run type check (same as type-check)

**Project Structure**:

src/
├── routes/              # Hono.js route handlers
│   ├── admin*.ts       # Admin interface routes
│   ├── api*.ts         # REST API endpoints
│   └── auth.ts         # Authentication routes
├── templates/          # HTML templates & components
│   ├── layouts/        # Page layouts (admin, public)
│   ├── pages/          # Full page templates
│   └── components/     # Reusable UI components
├── middleware/         # Hono.js middleware
│   ├── auth.ts         # Authentication & authorization
│   ├── permissions.ts  # Permission checking
│   ├── bootstrap.ts    # System initialization
│   ├── logging.ts      # Request logging
│   └── performance.ts  # Performance middleware
├── plugins/            # Plugin system
│   ├── core/           # Plugin manager, registry, hooks
│   ├── core-plugins/   # Built-in plugins
│   ├── available/      # Optional plugins
│   └── cache/          # Caching plugin
├── utils/             # Utility functions
├── scripts/           # Database & deployment scripts
├── migrations/        # Database migration files
└── tests/             # Unit & integration tests
    └── e2e/           # End-to-end test suites

**Git Workflow**:
- Husky for git hooks
- Lint-staged for pre-commit type checking
- Main branch: main
- Commit message format: Conventional commits

**Code Quality**:
- TypeScript strict mode enabled
- Full type coverage required
- Vitest for unit tests
- Playwright for E2E tests
- Coverage tracking with @vitest/coverage-v8

**Local Development Setup**:
1. Clone repository
2. npm install to install dependencies
3. npm run db:migrate to set up local database
4. npm run dev to start development server
5. Access at http://localhost:8787

**Environment Configuration**:
- wrangler.toml for Cloudflare configuration
- Environment-specific settings (development, preview, production)
- Bindings: DB (D1), CACHE_KV (KV), MEDIA_BUCKET (R2), ASSETS (static assets)

**Testing Strategy**:
- Unit tests for utilities, services, middleware
- Integration tests for route handlers
- E2E tests for user workflows
- Test coverage minimum: 80%
- Mock Cloudflare bindings in tests

**Performance Optimization**:
- Three-tier caching (memory, KV, database)
- Lazy loading of heavy dependencies
- Route-level caching with appropriate TTLs
- Batch operations for database queries
- Pagination for large result sets
""", "Development Workflow and Practices")

def populate_advanced_features():
    """Add advanced features information"""
    print("\n🚀 Adding Advanced Features...")

    add_episode("""
**SonicJS AI Advanced Features**:

**Content Management Features**:

Rich Text Editor Integration:
- TinyMCE WYSIWYG editor with customizable toolbars
- Support for tables, images, links, code blocks
- Media picker integration for embedding files
- Full HTML editing with syntax highlighting

Dynamic Field System:
- Custom field types: text, richtext, number, boolean, date, select, media
- Field validation (required, min/max, regex patterns)
- Conditional field display based on other fields
- Field groups and sections for organization

Content Versioning:
- Complete revision history for all content
- Restore to any previous version
- Track changes with user attribution
- Version comparison (planned)
- Automatic versioning on save

Content Scheduling:
- Publish/unpublish automation with date controls
- Schedule content for future publication
- Automatic archiving based on date
- Preview scheduled content before going live

Workflow System:
- Draft → Review → Published → Archived states
- Role-based permissions for each state
- Automated transitions based on rules
- Notification system for workflow events
- Audit trail of all state changes

Auto-Save Feature:
- Automatic content saving every 30 seconds
- Recovery from browser crashes
- Draft preservation across sessions
- Visual indicator for save status

Live Preview:
- Real-time content preview before publishing
- Preview in context of actual templates
- Mobile and desktop preview modes
- Share preview links with stakeholders

Content Duplication:
- One-click content copying
- Template creation from existing content
- Batch duplication for related content
- Preserve or regenerate slugs/IDs

**Security Features**:

XSS Protection:
- Comprehensive input validation
- HTML escaping for all user inputs
- Content Security Policy headers
- Sanitization of rich text content

CSRF Protection:
- SameSite cookie policy (Strict)
- Token validation for state-changing operations
- Origin verification

SQL Injection Prevention:
- Parameterized queries via Drizzle ORM
- Input validation with Zod schemas
- No raw SQL from user input

Rate Limiting:
- Per-IP rate limiting for auth endpoints (planned)
- API rate limiting by user tier (planned)
- Cloudflare built-in DDoS protection

Activity Logging:
- All security-sensitive actions logged
- User attribution with IP and user agent
- Searchable audit trail
- Retention policies for compliance

**Media Management**:

File Upload Features:
- Drag-and-drop interface
- Multiple file upload
- Progress indicators
- Client-side validation before upload

Image Processing:
- Cloudflare Images API integration (optional)
- Automatic thumbnail generation
- Image optimization and compression
- Format conversion (JPEG, PNG, WebP)

Media Organization:
- Folder-based organization
- Tags and categories
- Search and filter by metadata
- Bulk operations (move, delete, tag)

**Developer Experience Features**:

CLI Tools:
- sonicjs command for common tasks
- Collection sync utility
- Migration management
- Seed data generation

OpenAPI Integration:
- Auto-generated OpenAPI 3.0 spec
- Interactive API documentation (Scalar UI)
- Type-safe client generation support
- Request/response validation

Hot Reload:
- Instant updates during development
- No server restart required
- Preserves application state

Type Safety:
- Full TypeScript coverage
- Zod schemas for runtime validation
- Type inference from database schema
- Compile-time error catching

**Performance Features**:

Edge Computing Benefits:
- Global distribution via Cloudflare network
- Sub-100ms response times worldwide
- Automatic scaling based on demand
- DDoS protection included

Intelligent Caching:
- Three-tier cache strategy
- Event-based invalidation
- Cache warming for predictable patterns
- Statistics and monitoring

Optimization Strategies:
- Lazy loading of plugins
- Code splitting for admin interface
- Minimal JavaScript for public pages
- Efficient database queries with indexes

**Analytics & Monitoring**:

Metrics Tracking:
- Request count and response times
- Cache hit rates by tier
- Error rates and types
- User activity patterns

Real-time Dashboard:
- System status monitoring
- Performance metrics visualization
- Cache statistics
- Recent activity logs

Activity Tracking:
- User actions and events
- Content changes and versions
- Authentication events
- Plugin lifecycle events
""", "Advanced Features and Capabilities")

def main():
    """Main execution function"""
    print("=" * 60)
    print("SonicJS AI - Graphiti Knowledge Graph Population")
    print("=" * 60)

    # Optional: Clear existing graph
    # clear_graph()

    # Populate all aspects of the project
    populate_project_overview()
    populate_technology_stack()
    populate_architecture()
    populate_plugin_system()
    populate_three_tier_cache()
    populate_authentication()
    populate_api_structure()
    populate_routes_and_middleware()
    populate_database_structure()
    populate_development_workflow()
    populate_advanced_features()

    print("\n" + "=" * 60)
    print("✅ Knowledge graph population complete!")
    print(f"📊 All episodes added to group: {GROUP_ID}")
    print(f"🌐 Graphiti server: {GRAPHITI_URL}")
    print("=" * 60)

if __name__ == "__main__":
    main()
