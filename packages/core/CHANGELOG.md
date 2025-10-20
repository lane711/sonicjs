# Changelog

All notable changes to `@sonicjs-cms/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0-alpha.2] - 2025-10-20

### 🔧 Fixes

- **Package Name**: Confirmed use of `@sonicjs-cms` organization (not `@sonicjs`)
- **Version Bump**: Updated to alpha.2 for npm publication

### 📝 Notes

- No functional changes from alpha.1
- This release corrects the npm organization scope

## [2.0.0-alpha.1] - 2025-10-20

### 🎉 Initial Alpha Release

First alpha release of `@sonicjs-cms/core` as a standalone npm package.

### ✨ Features

#### Core Application
- **Application Factory**: `createSonicJSApp()` for easy app initialization
- **Configuration API**: Type-safe `SonicJSConfig` for collections, plugins, routes
- **Health Endpoint**: Built-in `/health` endpoint for monitoring

#### Services
- **Collection Management**: Load, sync, and validate collection configurations
- **Migration Service**: Database migration management with tracking
- **Logger**: Structured logging with categories and levels
- **Plugin Services**: Plugin lifecycle and hook system management

#### Middleware
- **Authentication**: JWT-based authentication with `requireAuth()`, `requireRole()`
- **Permissions**: RBAC with `requirePermission()`, `requireAnyPermission()`
- **Logging**: Request logging with performance tracking
- **Security**: Security headers, CORS support
- **Performance**: Cache headers and compression

#### Routes
- **Admin Routes**: Complete admin dashboard with glass morphism UI
- **API Routes**: REST API for content management
- **Auth Routes**: Login, logout, registration, password reset
- **Media Routes**: Media upload and management

#### Templates
- **Form Components**: Dynamic form rendering with validation
- **Table Components**: Sortable, filterable data tables
- **Pagination**: Page navigation components
- **Alerts**: User feedback components
- **Confirmation Dialogs**: Modal confirmation system

#### Plugins
- **Hook System**: Event-based extension points
- **Plugin Registry**: Dynamic plugin management
- **Core Plugins**: Database tools, seed data plugins
- **Available Plugins**: Workflow, cache, FAQ, email (included)

#### Database
- **Schema**: Complete D1 schema with Drizzle ORM
- **Migrations**: Core database migrations (001-099)
- **Validation**: Zod schemas for all database entities

#### Types
- **Collection Types**: `CollectionConfig`, `FieldConfig`, `CollectionSchema`
- **Plugin Types**: `Plugin`, `PluginContext`, `HookSystem`
- **User Types**: `User`, `Permission`, `UserPermissions`
- **Content Types**: `Content`, `Media`, `ContentVersion`

#### Utilities
- **Sanitization**: XSS protection with `sanitizeInput()`, `escapeHtml()`
- **Template Rendering**: String interpolation engine
- **Query Filtering**: Advanced filtering and sorting
- **Metrics Tracking**: Performance monitoring

### 📦 Package Structure

- **Main Export**: Application factory and types
- **Subpath Exports**: `/services`, `/middleware`, `/routes`, `/templates`, `/plugins`, `/utils`, `/types`
- **Build Formats**: ESM + CJS with TypeScript definitions
- **Tree-Shaking**: Optimized for minimal bundle size

### 🔧 Build System

- **Bundler**: tsup for fast builds
- **Formats**: ESM (.js) + CommonJS (.cjs)
- **TypeScript**: Full type definitions (.d.ts)
- **Sourcemaps**: Included for debugging
- **Code Splitting**: Optimized chunks

### 📚 Documentation

- Comprehensive README with examples
- TypeScript JSDoc comments
- Type definitions for IDE support
- Migration guide (for future versions)

### 🧪 Testing

- 48 utility tests (sanitization, query filtering, metrics)
- 51 middleware tests (auth, logging, security, performance)
- Total: 99 tests passing

### ⚠️ Breaking Changes from v1.x

This is a complete rewrite from the monolith architecture:

- **New Package Name**: `@sonicjs-cms/core` → `@sonicjs-cms/core`
- **New API**: `createSonicJSApp()` instead of manual setup
- **Collection Schema**: New structure with `schema.properties`
- **Plugin Configuration**: New plugin directory structure
- **Migration Path**: No automatic migration from v1.x (greenfield only)

### 🚀 Deployment

- Designed for Cloudflare Workers
- Requires D1 database binding
- Requires R2 bucket for media storage
- Zero cold starts on edge

### 📝 Known Limitations

- **Alpha Release**: API may change before stable release
- **Greenfield Only**: No migration tooling from v1.x monolith
- **Testing**: Limited E2E test coverage
- **Documentation**: Some advanced features undocumented

### 🔮 Coming Soon

- Beta release with stabilized API
- CLI tool for project scaffolding
- Enhanced plugin documentation
- More example projects
- Performance benchmarks

### 🙏 Credits

Built by the SonicJS team with contributions from the community.

---

## Version History

### Alpha Releases

- **2.0.0-alpha.2** (2025-10-20) - Organization scope correction
- **2.0.0-alpha.1** (2025-10-20) - Initial alpha release

### Stable Releases

- **2.0.0** - Coming soon

---

## Links

- [GitHub Repository](https://github.com/sonicjs/sonicjs)
- [npm Package](https://www.npmjs.com/package/@sonicjs-cms/core)
- [Documentation](https://docs.sonicjs.com)
- [Discord Community](https://discord.gg/sonicjs)

---

**Note**: This project follows [Semantic Versioning](https://semver.org/). Alpha versions are experimental and may have breaking changes between releases.
