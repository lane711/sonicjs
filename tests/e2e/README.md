# E2E Test Suite

This directory contains end-to-end tests for SonicJS AI using Playwright.

## Test Files

### Core Tests
- `01-health.spec.ts` - Basic health and connectivity tests
- `02-authentication.spec.ts` - Login/logout functionality
- `03-admin-dashboard.spec.ts` - Admin dashboard functionality
- `04-collections.spec.ts` - Collections management UI tests
- `05-content.spec.ts` - Content management tests
- `06-media.spec.ts` - Media upload and management tests
- `07-api.spec.ts` - Basic API endpoint tests

### API Component Tests
- `08-collections-api.spec.ts` - **Collections API component tests**
- `08b-admin-collections-api.spec.ts` - **Admin Collections API component tests**

### Integration Tests
- `09-integration.spec.ts` - Full workflow integration tests

## Collections API Tests

The Collections API tests provide comprehensive coverage of:

### Public API Endpoints (`08-collections-api.spec.ts`)
- **GET /api/collections** - List all active collections
- **GET /api/collections/:collection/content** - Get content for specific collection
- **GET /api/content** - Get all content with pagination
- **Error handling** - Invalid requests, malformed data, SQL injection protection
- **Performance** - Response time validation
- **Security** - Data sanitization, no sensitive information exposure
- **Data integrity** - Consistent timestamps, valid JSON, referential integrity

### Admin API Endpoints (`08b-admin-collections-api.spec.ts`)
- **POST /admin/api/collections** - Create new collections (when implemented)
- **PUT /admin/api/collections/:id** - Update existing collections (when implemented)
- **DELETE /admin/api/collections/:id** - Delete collections (when implemented)
- **GET /admin/api/collections/:id** - Get single collection details (when implemented)
- **Authentication & Authorization** - Proper auth requirement
- **Rate limiting & Security** - Concurrent request handling, payload validation
- **Input sanitization** - XSS and SQL injection prevention

## Test Utilities

### Authentication
- `loginAsAdmin()` - Authenticate as admin user
- `ensureAdminUserExists()` - Create admin user if needed

### Collection Management
- `createTestCollection()` - Create test collection via UI
- `deleteTestCollection()` - Clean up test collection

### Test Data
- `TEST_DATA.collection` - Standard test collection data
- `ADMIN_CREDENTIALS` - Default admin login credentials

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test 08-collections-api

# Run with UI
npx playwright test --ui

# Run in debug mode
npx playwright test --debug
```

## Test Strategy

### Component Testing Approach
The Collections API tests follow a component testing approach:

1. **Isolation** - Each API endpoint is tested independently
2. **Coverage** - Tests cover happy paths, edge cases, and error conditions
3. **Security** - Validates input sanitization and prevents common attacks
4. **Performance** - Ensures reasonable response times
5. **Data Integrity** - Verifies data consistency and format

### Test Categories
- **Functional** - Core API functionality works as expected
- **Security** - No vulnerabilities or data exposure
- **Performance** - Acceptable response times
- **Error Handling** - Proper error responses and codes
- **Authentication** - Proper access control

## Notes

- Tests are designed to be idempotent and can run multiple times
- Cleanup is automatic using `beforeEach`/`afterEach` hooks
- Admin API tests gracefully handle unimplemented endpoints (404/405)
- Tests use real authentication cookies for admin operations
- SQL injection and XSS tests verify proper input sanitization