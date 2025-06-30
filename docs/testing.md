# Testing Guide

SonicJS AI includes comprehensive testing strategies covering unit tests, integration tests, and end-to-end testing. This guide covers all testing approaches, tools, and best practices.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Data Management](#test-data-management)
- [Testing Patterns](#testing-patterns)
- [CI/CD Integration](#cicd-integration)
- [Performance Testing](#performance-testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

### Testing Philosophy

SonicJS AI follows a testing pyramid approach:

- **Unit Tests (70%)** - Fast, isolated tests for individual functions
- **Integration Tests (20%)** - API endpoints and component interactions
- **E2E Tests (10%)** - Critical user journeys and workflows

### Test Coverage Goals

- **Minimum 80%** code coverage for core business logic
- **100%** coverage for critical authentication and security functions
- **All API endpoints** have integration tests
- **Key user workflows** have E2E test coverage

## Testing Stack

### Core Testing Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| **Vitest** | Unit & Integration Testing | Fast, Vite-native test runner |
| **Playwright** | End-to-End Testing | Cross-browser automation |
| **MSW** | API Mocking | Mock external services |
| **@testing-library** | Component Testing | User-centric testing utilities |
| **Supertest** | HTTP Testing | API endpoint testing |

### Test Environment Setup

```bash
# Install testing dependencies
npm install -D vitest playwright @playwright/test
npm install -D @testing-library/dom @testing-library/user-event
npm install -D msw supertest
```

### Configuration Files

#### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

#### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8787',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8787',
    reuseExistingServer: !process.env.CI
  }
})
```

## Unit Testing

### Testing Utilities and Helpers

```typescript
// tests/utils/test-helpers.ts
import { vi } from 'vitest'

// Mock database
export const mockDB = {
  prepare: vi.fn().mockReturnValue({
    bind: vi.fn().mockReturnValue({
      all: vi.fn().mockResolvedValue({ results: [] }),
      first: vi.fn().mockResolvedValue(null),
      run: vi.fn().mockResolvedValue({ success: true })
    })
  })
}

// Mock environment
export const mockEnv = {
  DB: mockDB,
  KV: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  MEDIA_BUCKET: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}

// Mock user context
export const mockUser = {
  userId: 'test-user-id',
  email: 'test@example.com',
  role: 'admin',
  exp: Date.now() / 1000 + 3600,
  iat: Date.now() / 1000
}

// Mock request helper
export const createMockRequest = (
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
) => {
  return new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })
}
```

### Authentication Testing

```typescript
// tests/unit/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyToken, generateToken } from '@/utils/jwt'
import { hashPassword, verifyPassword } from '@/utils/password'

describe('Authentication', () => {
  describe('JWT Token Management', () => {
    it('should generate valid JWT token', async () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'user' }
      const token = await generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify valid JWT token', async () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'user' }
      const token = await generateToken(payload)
      
      const decoded = await verifyToken(token)
      
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
      expect(decoded.role).toBe(payload.role)
    })

    it('should reject invalid JWT token', async () => {
      const invalidToken = 'invalid.token.here'
      
      await expect(verifyToken(invalidToken)).rejects.toThrow()
    })

    it('should reject expired JWT token', async () => {
      // Mock expired token
      const expiredPayload = { 
        userId: '123', 
        email: 'test@example.com', 
        role: 'user',
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      }
      const expiredToken = await generateToken(expiredPayload)
      
      await expect(verifyToken(expiredToken)).rejects.toThrow('Token expired')
    })
  })

  describe('Password Hashing', () => {
    it('should hash password securely', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.startsWith('$2b$')).toBe(true)
    })

    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword456'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })
  })
})
```

### Content Management Testing

```typescript
// tests/unit/content.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContentModelManager } from '@/content/models'
import { ContentWorkflow } from '@/plugins/core-plugins/workflow-plugin/services/content-workflow'

describe('Content Management', () => {
  let modelManager: ContentModelManager
  
  beforeEach(() => {
    modelManager = new ContentModelManager()
  })

  describe('ContentModelManager', () => {
    it('should register content model', () => {
      const model = {
        name: 'test-model',
        displayName: 'Test Model',
        fields: {
          title: { type: 'text', required: true },
          content: { type: 'rich_text' }
        }
      }
      
      modelManager.registerModel(model)
      const registered = modelManager.getModel('test-model')
      
      expect(registered).toEqual(model)
    })

    it('should validate model schema', () => {
      const invalidModel = {
        name: '', // Empty name should fail
        displayName: 'Test',
        fields: {}
      }
      
      expect(() => modelManager.registerModel(invalidModel)).toThrow()
    })

    it('should get all registered models', () => {
      const model1 = { name: 'model1', displayName: 'Model 1', fields: {} }
      const model2 = { name: 'model2', displayName: 'Model 2', fields: {} }
      
      modelManager.registerModel(model1)
      modelManager.registerModel(model2)
      
      const allModels = modelManager.getAllModels()
      expect(allModels).toHaveLength(2)
      expect(allModels.find(m => m.name === 'model1')).toEqual(model1)
      expect(allModels.find(m => m.name === 'model2')).toEqual(model2)
    })
  })

  describe('ContentWorkflow', () => {
    it('should generate correct status badge', () => {
      expect(ContentWorkflow.generateStatusBadge('draft')).toContain('draft')
      expect(ContentWorkflow.generateStatusBadge('published')).toContain('published')
      expect(ContentWorkflow.generateStatusBadge('archived')).toContain('archived')
    })

    it('should return available actions for admin', () => {
      const actions = ContentWorkflow.getAvailableActions('draft', 'admin', false)
      
      expect(actions).toContain('edit')
      expect(actions).toContain('publish')
      expect(actions).toContain('delete')
    })

    it('should limit actions for non-owners', () => {
      const actions = ContentWorkflow.getAvailableActions('draft', 'author', false)
      
      expect(actions).not.toContain('delete')
      expect(actions.length).toBeLessThan(3)
    })
  })
})
```

### Database Testing

```typescript
// tests/unit/database.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createDatabase } from '@/db'
import { users, content } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Mock D1 database
const mockD1 = {
  prepare: vi.fn(),
  batch: vi.fn(),
  dump: vi.fn(),
  exec: vi.fn()
}

describe('Database Operations', () => {
  let db: any
  
  beforeEach(() => {
    vi.clearAllMocks()
    db = createDatabase(mockD1 as any)
  })

  it('should create user record', async () => {
    const userData = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user' as const
    }

    // Mock successful insert
    mockD1.prepare.mockReturnValue({
      bind: vi.fn().mockReturnValue({
        run: vi.fn().mockResolvedValue({ success: true })
      })
    })

    await expect(
      db.insert(users).values(userData)
    ).resolves.not.toThrow()
  })

  it('should query user by email', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'user'
    }

    // Mock successful query
    mockD1.prepare.mockReturnValue({
      bind: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(mockUser)
      })
    })

    const result = await db.select()
      .from(users)
      .where(eq(users.email, 'test@example.com'))
      .limit(1)

    expect(result).toEqual(mockUser)
  })

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockD1.prepare.mockReturnValue({
      bind: vi.fn().mockReturnValue({
        run: vi.fn().mockRejectedValue(new Error('Database error'))
      })
    })

    await expect(
      db.insert(users).values({ email: 'test@example.com' })
    ).rejects.toThrow('Database error')
  })
})
```

## Integration Testing

### API Endpoint Testing

```typescript
// tests/integration/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { app } from '@/index'
import { mockEnv, mockUser } from '../utils/test-helpers'

describe('API Integration Tests', () => {
  describe('Authentication Endpoints', () => {
    it('should login with valid credentials', async () => {
      const response = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'correctPassword'
        })
      }, mockEnv)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.token).toBeDefined()
      expect(data.user.email).toBe('admin@example.com')
    })

    it('should reject invalid credentials', async () => {
      const response = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'wrongPassword'
        })
      }, mockEnv)

      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should require authentication for protected routes', async () => {
      const response = await app.request('/admin/users', {
        method: 'GET'
      }, mockEnv)

      expect(response.status).toBe(401)
    })

    it('should allow access with valid token', async () => {
      const token = 'valid-jwt-token'
      
      const response = await app.request('/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, mockEnv)

      // Should not be 401 (assuming token is valid)
      expect(response.status).not.toBe(401)
    })
  })

  describe('Content API', () => {
    it('should create content', async () => {
      const contentData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'This is test content'
      }

      const response = await app.request('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(contentData)
      }, mockEnv)

      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.title).toBe(contentData.title)
      expect(data.id).toBeDefined()
    })

    it('should get content list', async () => {
      const response = await app.request('/api/content', {
        method: 'GET'
      }, mockEnv)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.meta).toBeDefined()
    })

    it('should update content', async () => {
      const contentId = 'content-123'
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content'
      }

      const response = await app.request(`/api/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(updateData)
      }, mockEnv)

      expect(response.status).toBe(200)
    })

    it('should delete content', async () => {
      const contentId = 'content-123'

      const response = await app.request(`/api/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      }, mockEnv)

      expect(response.status).toBe(200)
    })
  })

  describe('Media API', () => {
    it('should upload media file', async () => {
      const formData = new FormData()
      formData.append('files', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))
      formData.append('folder', 'uploads')

      const response = await app.request('/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      }, mockEnv)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.results).toBeDefined()
      expect(data.results[0].success).toBe(true)
    })

    it('should get media list', async () => {
      const response = await app.request('/media', {
        method: 'GET'
      }, mockEnv)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.data).toBeDefined()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })
})
```

### Template Integration Testing

```typescript
// tests/integration/templates.test.ts
import { describe, it, expect } from 'vitest'
import { renderAdminLayout } from '@/templates/layouts/admin-layout.template'
import { renderButton } from '@/templates/components/button.template'

describe('Template Integration', () => {
  it('should render admin layout with content', () => {
    const layoutData = {
      title: 'Test Page',
      content: '<div>Test Content</div>',
      currentPath: '/admin',
      user: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }
    }

    const html = renderAdminLayout(layoutData)
    
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Test Page')
    expect(html).toContain('Test Content')
    expect(html).toContain('Test User')
  })

  it('should render button with HTMX attributes', () => {
    const buttonData = {
      label: 'Submit',
      type: 'submit' as const,
      hxPost: '/api/submit',
      hxTarget: '#result'
    }

    const html = renderButton(buttonData)
    
    expect(html).toContain('type="submit"')
    expect(html).toContain('hx-post="/api/submit"')
    expect(html).toContain('hx-target="#result"')
    expect(html).toContain('Submit')
  })

  it('should handle missing data gracefully', () => {
    const minimalData = {
      label: 'Click Me'
    }

    const html = renderButton(minimalData)
    
    expect(html).toContain('Click Me')
    expect(html).toContain('type="button"') // Default type
    expect(html).not.toContain('hx-post') // Should not include undefined attributes
  })
})
```

## End-to-End Testing

### Authentication Flow Tests

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Fill login form
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'adminPassword')
    
    // Submit form
    await page.click('[type="submit"]')
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'wrongPassword')
    await page.click('[type="submit"]')
    
    // Should show error message
    await expect(page.locator('.alert-error')).toBeVisible()
    await expect(page.locator('.alert-error')).toContainText('Invalid credentials')
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'adminPassword')
    await page.click('[type="submit"]')
    
    // Logout
    await page.click('[href="/auth/logout"]')
    
    // Should redirect to login page
    await expect(page).toHaveURL('/auth/login')
  })
})
```

### Content Management Tests

```typescript
// tests/e2e/content.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Content Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'adminPassword')
    await page.click('[type="submit"]')
  })

  test('should create new content', async ({ page }) => {
    await page.goto('/admin/content')
    
    // Click new content button
    await page.click('text=New Content')
    
    // Fill content form
    await page.fill('[name="title"]', 'Test Article')
    await page.fill('[name="slug"]', 'test-article')
    await page.selectOption('[name="status"]', 'published')
    
    // Fill rich text content (assuming EasyMDE is loaded)
    await page.waitForSelector('.CodeMirror')
    await page.click('.CodeMirror')
    await page.keyboard.type('This is the article content.')
    
    // Submit form
    await page.click('[type="submit"]')
    
    // Should redirect to content list
    await expect(page).toHaveURL('/admin/content')
    await expect(page.locator('text=Test Article')).toBeVisible()
  })

  test('should edit existing content', async ({ page }) => {
    await page.goto('/admin/content')
    
    // Click edit button on first content item
    await page.click('[data-testid="edit-content-btn"]:first-child')
    
    // Update title
    await page.fill('[name="title"]', 'Updated Title')
    
    // Submit changes
    await page.click('[type="submit"]')
    
    // Should show success message
    await expect(page.locator('.alert-success')).toBeVisible()
    await expect(page.locator('text=Updated Title')).toBeVisible()
  })

  test('should delete content', async ({ page }) => {
    await page.goto('/admin/content')
    
    // Click delete button and confirm
    page.on('dialog', dialog => dialog.accept())
    await page.click('[data-testid="delete-content-btn"]:first-child')
    
    // Content should be removed from list
    await expect(page.locator('[data-testid="content-item"]:first-child')).not.toBeVisible()
  })
})
```

### Media Management Tests

```typescript
// tests/e2e/media.spec.ts
import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Media Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'adminPassword')
    await page.click('[type="submit"]')
  })

  test('should upload media file', async ({ page }) => {
    await page.goto('/admin/media')
    
    // Open upload modal
    await page.click('text=Upload Files')
    
    // Upload file
    const filePath = path.join(__dirname, '../fixtures/test-image.jpg')
    await page.setInputFiles('[name="files"]', filePath)
    
    // Submit upload
    await page.click('text=Upload Files')
    
    // Should show success message
    await expect(page.locator('.alert-success')).toBeVisible()
    
    // File should appear in media grid
    await expect(page.locator('[data-testid="media-item"]')).toBeVisible()
  })

  test('should filter media by type', async ({ page }) => {
    await page.goto('/admin/media')
    
    // Click images filter
    await page.click('text=Images')
    
    // URL should update with filter
    await expect(page).toHaveURL('/admin/media?type=images')
    
    // Only image files should be visible
    const mediaItems = page.locator('[data-testid="media-item"]')
    await expect(mediaItems.first()).toBeVisible()
  })

  test('should search media files', async ({ page }) => {
    await page.goto('/admin/media')
    
    // Type in search box
    await page.fill('[placeholder="Search files..."]', 'test')
    
    // Results should filter
    await page.waitForTimeout(500) // Wait for debounce
    await expect(page.locator('[data-testid="media-item"]')).toHaveCount(1)
  })
})
```

## Test Data Management

### Fixtures and Factories

```typescript
// tests/fixtures/users.ts
export const createUserFixture = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  passwordHash: '$2b$12$hashed-password',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  isActive: true,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

export const createAdminUser = () => createUserFixture({
  email: 'admin@example.com',
  role: 'admin'
})

// tests/fixtures/content.ts
export const createContentFixture = (overrides = {}) => ({
  id: 'content-123',
  title: 'Test Article',
  slug: 'test-article',
  collectionId: 'blog-posts',
  status: 'published',
  data: JSON.stringify({
    content: 'This is test content',
    excerpt: 'Test excerpt'
  }),
  authorId: 'user-123',
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

// tests/fixtures/media.ts
export const createMediaFixture = (overrides = {}) => ({
  id: 'media-123',
  filename: 'test-image.jpg',
  originalName: 'test-image.jpg',
  mimeType: 'image/jpeg',
  size: 1024,
  width: 800,
  height: 600,
  folder: 'uploads',
  r2Key: 'uploads/test-image.jpg',
  publicUrl: 'https://example.com/test-image.jpg',
  uploadedBy: 'user-123',
  uploadedAt: new Date().toISOString(),
  ...overrides
})
```

### Database Seeding for Tests

```typescript
// tests/utils/database-seeder.ts
import { mockDB } from './test-helpers'
import { createUserFixture, createContentFixture } from '../fixtures'

export class DatabaseSeeder {
  static async seed() {
    // Seed users
    const adminUser = createUserFixture({
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'admin'
    })
    
    const editorUser = createUserFixture({
      id: 'editor-123',
      email: 'editor@example.com',
      role: 'editor'
    })
    
    // Mock database responses
    mockDB.prepare.mockReturnValue({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ 
          results: [adminUser, editorUser] 
        }),
        first: vi.fn().mockImplementation((email) => {
          if (email === 'admin@example.com') return adminUser
          if (email === 'editor@example.com') return editorUser
          return null
        }),
        run: vi.fn().mockResolvedValue({ success: true })
      })
    })
  }
  
  static async cleanup() {
    // Reset all mocks
    vi.clearAllMocks()
  }
}
```

## Testing Patterns

### Page Object Model for E2E Tests

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth/login')
  }

  async fillEmail(email: string) {
    await this.page.fill('[name="email"]', email)
  }

  async fillPassword(password: string) {
    await this.page.fill('[name="password"]', password)
  }

  async submit() {
    await this.page.click('[type="submit"]')
  }

  async login(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator('.alert-error')).toContainText(message)
  }

  async expectSuccessfulLogin() {
    await expect(this.page).toHaveURL('/admin')
  }
}

// Usage in tests
test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page)
  
  await loginPage.goto()
  await loginPage.login('admin@example.com', 'password')
  await loginPage.expectSuccessfulLogin()
})
```

### Test Utilities for API Testing

```typescript
// tests/utils/api-helpers.ts
export class APITestHelper {
  constructor(private app: any, private env: any) {}

  async authenticate(email: string, password: string) {
    const response = await this.app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }, this.env)

    const data = await response.json()
    return data.token
  }

  async authenticatedRequest(
    method: string,
    path: string,
    token: string,
    body?: any
  ) {
    return await this.app.request(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : undefined
    }, this.env)
  }

  async createContent(token: string, contentData: any) {
    return await this.authenticatedRequest(
      'POST',
      '/api/content',
      token,
      contentData
    )
  }

  async getContent(id?: string) {
    const path = id ? `/api/content/${id}` : '/api/content'
    return await this.app.request(path, {
      method: 'GET'
    }, this.env)
  }
}
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Scripts in package.json

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage && open coverage/index.html"
  }
}
```

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery/load-test.yml
config:
  target: 'http://localhost:8787'
  phases:
    - duration: 60
      arrivalRate: 5
    - duration: 120
      arrivalRate: 10
    - duration: 60
      arrivalRate: 15

scenarios:
  - name: "Content API Load Test"
    weight: 70
    flow:
      - get:
          url: "/api/content"
      - think: 2
      - get:
          url: "/api/content/{{ $randomString() }}"

  - name: "Authentication Load Test"
    weight: 30
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "test@example.com"
            password: "password"
      - think: 1
      - get:
          url: "/admin"
          headers:
            Authorization: "Bearer {{ token }}"
```

### Performance Test Runner

```bash
# Install Artillery
npm install -g artillery

# Run load tests
artillery run artillery/load-test.yml

# Generate report
artillery run artillery/load-test.yml --output report.json
artillery report report.json
```

## Best Practices

### 1. Test Organization

```
tests/
├── unit/                 # Fast, isolated tests
│   ├── auth/
│   ├── content/
│   └── utils/
├── integration/          # API and component tests
│   ├── api/
│   └── templates/
├── e2e/                  # End-to-end tests
│   ├── auth.spec.ts
│   ├── content.spec.ts
│   └── media.spec.ts
├── fixtures/             # Test data
├── utils/                # Test helpers
└── setup.ts              # Global test setup
```

### 2. Test Naming Conventions

```typescript
// Good: Descriptive test names
describe('User Authentication', () => {
  it('should generate JWT token for valid user', () => {})
  it('should reject expired JWT tokens', () => {})
  it('should hash passwords securely', () => {})
})

// Bad: Vague test names
describe('Auth', () => {
  it('works', () => {})
  it('fails', () => {})
})
```

### 3. Test Data Isolation

```typescript
// Use factories for consistent test data
const createUser = (overrides = {}) => ({
  id: crypto.randomUUID(),
  email: `test-${Date.now()}@example.com`,
  ...defaultUserData,
  ...overrides
})

// Avoid shared test data
const sharedUser = { id: 'user-1' } // Bad
const user1 = createUser() // Good
const user2 = createUser() // Good
```

### 4. Async Testing

```typescript
// Proper async/await usage
it('should create user', async () => {
  const userData = createUser()
  const result = await createUser(userData)
  expect(result.id).toBeDefined()
})

// Avoid missing await
it('should create user', () => {
  const userData = createUser()
  const result = createUser(userData) // Missing await
  expect(result.id).toBeDefined() // Will fail
})
```

## Troubleshooting

### Common Test Issues

#### 1. Mock Setup Problems

```typescript
// Problem: Mocks not properly reset between tests
beforeEach(() => {
  vi.clearAllMocks() // Clear mock call history
  vi.resetAllMocks() // Reset mock implementations
})

// Problem: Mock not matching expected interface
const mockDB = {
  prepare: vi.fn().mockImplementation(() => ({
    bind: vi.fn().mockImplementation(() => ({
      all: vi.fn(),
      first: vi.fn(),
      run: vi.fn()
    }))
  }))
} as unknown as D1Database
```

#### 2. Timing Issues in E2E Tests

```typescript
// Use waitFor patterns
await page.waitForSelector('[data-testid="content-loaded"]')
await page.waitForLoadState('networkidle')

// Avoid fixed timeouts
await page.waitForTimeout(1000) // Bad
await expect(page.locator('.success')).toBeVisible() // Good
```

#### 3. Environment Setup Issues

```typescript
// Ensure proper test environment
if (process.env.NODE_ENV !== 'test') {
  throw new Error('Tests must run in test environment')
}

// Use test-specific configurations
const config = process.env.NODE_ENV === 'test' 
  ? testConfig 
  : productionConfig
```

### Debugging Test Failures

```bash
# Run specific test file
npm run test auth.test.ts

# Run tests in watch mode
npm run test:watch

# Debug with verbose output
npm run test -- --reporter=verbose

# Run E2E tests with debug mode
npm run test:e2e -- --debug

# Generate test coverage report
npm run test:coverage
```

### Performance Debugging

```typescript
// Profile slow tests
const start = performance.now()
await slowOperation()
const end = performance.now()
console.log(`Operation took ${end - start}ms`)

// Use test timeouts appropriately
it('should complete quickly', async () => {
  // Set 5 second timeout
}, 5000)
```

## Related Documentation

- [Getting Started](getting-started.md) - Setting up the development environment
- [Authentication](authentication.md) - Testing authentication flows
- [API Reference](api-reference.md) - API endpoint specifications
- [Deployment](deployment.md) - Testing in production environments