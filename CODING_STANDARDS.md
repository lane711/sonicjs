# SonicJS Coding Standards

This document defines the coding standards for contributing to SonicJS. Following these standards ensures consistency across the codebase and makes it easier for everyone to contribute.

## Naming Conventions

### Summary Table

| Element | Convention | Example |
|---------|------------|---------|
| Collection names | snake_case | `blog_posts`, `user_profiles` |
| Schema field names | camelCase | `firstName`, `createdAt` |
| Database columns | snake_case | `first_name`, `created_at` |
| API responses | camelCase | `userId`, `createdAt` |
| TypeScript variables | camelCase | `userData`, `isActive` |
| TypeScript functions | camelCase | `getUserById`, `validateInput` |
| Classes & Types | PascalCase | `UserService`, `BlogPost` |
| Interfaces | PascalCase | `IUserRepository`, `ApiResponse` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| File names | kebab-case | `user-service.ts`, `blog-posts.collection.ts` |
| Enum values | PascalCase | `UserRole.Admin`, `Status.Active` |

### Collection Names

Collection names **must** be lowercase with underscores (snake_case). This is enforced by validation:

```typescript
// Correct
name: 'blog_posts'
name: 'user_profiles'
name: 'order_items'

// Incorrect
name: 'blogPosts'      // No camelCase
name: 'Blog_Posts'     // No uppercase
name: 'blog-posts'     // No hyphens
```

**Validation regex:** `/^[a-z0-9_]+$/`

### Schema Field Names

Schema field names should use **camelCase** in the TypeScript definition:

```typescript
// Correct
export const blogPostsCollection: CollectionConfig = {
  name: 'blog_posts',
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      featuredImage: { type: 'string', format: 'media' },
      publishedAt: { type: 'string', format: 'date-time' },
      metaDescription: { type: 'string' },
    },
  },
}

// Incorrect - don't use snake_case for schema properties
properties: {
  featured_image: { type: 'string' },  // Wrong
  published_at: { type: 'string' },    // Wrong
}
```

### Database Columns

Database column names use **snake_case** (SQL convention). Drizzle ORM maps camelCase TypeScript properties to snake_case columns:

```typescript
// TypeScript property -> SQL column
firstName: text('first_name').notNull(),
lastName: text('last_name').notNull(),
createdAt: integer('created_at'),
updatedAt: integer('updated_at'),
isActive: integer('is_active', { mode: 'boolean' }),
```

### API Responses

API responses should use **camelCase** (JavaScript convention). Transform database results at the API boundary:

```typescript
// Correct - API response uses camelCase
{
  "id": "123",
  "userId": "user_456",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "firstName": "John",
  "lastName": "Doe"
}

// Incorrect - don't expose snake_case to API consumers
{
  "user_id": "user_456",     // Wrong
  "created_at": "...",       // Wrong
  "first_name": "John"       // Wrong
}
```

### TypeScript Variables and Functions

Use **camelCase** for variables and functions:

```typescript
// Correct
const userData = await getUserById(userId)
const isValidEmail = validateEmail(email)
let itemCount = 0

// Incorrect
const user_data = await get_user_by_id(user_id)  // Wrong
const IsValidEmail = validateEmail(email)         // Wrong (PascalCase)
```

### Classes, Types, and Interfaces

Use **PascalCase** for classes, types, and interfaces:

```typescript
// Correct
class UserService { }
type BlogPost = { title: string; content: string }
interface ApiResponse<T> { data: T; status: number }

// Incorrect
class userService { }        // Wrong
type blogPost = { }          // Wrong
interface apiResponse { }    // Wrong
```

### Constants

Use **SCREAMING_SNAKE_CASE** for constants:

```typescript
// Correct
const MAX_RETRY_ATTEMPTS = 3
const API_BASE_URL = 'https://api.example.com'
const DEFAULT_PAGE_SIZE = 20

// Incorrect
const maxRetryAttempts = 3   // Wrong (looks like a variable)
const ApiBaseUrl = '...'     // Wrong
```

### File Names

Use **kebab-case** for file names:

```
// Correct
user-service.ts
blog-posts.collection.ts
api-response.types.ts
auth.middleware.ts

// Incorrect
userService.ts              // Wrong (camelCase)
BlogPosts.collection.ts     // Wrong (PascalCase)
user_service.ts             // Wrong (snake_case)
```

## Code Style

### TypeScript

- **Always use TypeScript** with proper type annotations
- Avoid `any` type - use `unknown` if the type is truly unknown
- Prefer interfaces over type aliases for object shapes
- Use generics for reusable components

```typescript
// Correct
function getUser(id: string): Promise<User | null> {
  // ...
}

// Incorrect
function getUser(id): any {  // Missing types
  // ...
}
```

### Async/Await

- Prefer `async/await` over `.then()` chains
- Always handle errors with try/catch or error boundaries

```typescript
// Correct
async function fetchData() {
  try {
    const result = await api.getData()
    return result
  } catch (error) {
    logger.error('Failed to fetch data', error)
    throw error
  }
}

// Avoid
function fetchData() {
  return api.getData()
    .then(result => result)
    .catch(error => {
      logger.error(error)
      throw error
    })
}
```

### Imports

Organize imports in this order:
1. Node.js built-in modules
2. External dependencies
3. Internal modules (absolute paths)
4. Relative imports

```typescript
// 1. Built-in modules
import { readFile } from 'fs/promises'

// 2. External dependencies
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'

// 3. Internal modules
import { UserService } from '@/services/user-service'
import { validateInput } from '@/utils/validation'

// 4. Relative imports
import { localHelper } from './helpers'
import type { LocalType } from './types'
```

### Error Handling

- Use custom error classes for domain-specific errors
- Include meaningful error messages
- Log errors with context

```typescript
// Correct
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`)
    this.name = 'NotFoundError'
  }
}

// Usage
throw new NotFoundError('User', userId)
```

### Comments

- Write self-documenting code - minimize comments
- Use JSDoc for public APIs
- Explain "why" not "what"

```typescript
// Good - explains why
// Cache for 5 minutes to reduce database load during peak hours
const CACHE_TTL = 300

// Bad - explains what (obvious from code)
// Set cache TTL to 300
const CACHE_TTL = 300
```

## Project-Specific Patterns

### Collection Definitions

Follow this pattern for collection definitions:

```typescript
import { CollectionConfig } from '@sonicjs-cms/core'

export const blogPostsCollection: CollectionConfig = {
  name: 'blog_posts',  // snake_case
  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: 'Title',
        required: true,
      },
      content: {
        type: 'string',
        title: 'Content',
        format: 'richtext',
      },
      featuredImage: {  // camelCase
        type: 'string',
        title: 'Featured Image',
        format: 'media',
      },
      publishedAt: {  // camelCase
        type: 'string',
        title: 'Published At',
        format: 'date-time',
      },
    },
  },
  access: {
    read: () => true,
    create: ({ user }) => !!user,
    update: ({ user }) => !!user,
    delete: ({ user }) => user?.role === 'admin',
  },
}
```

### Route Handlers

Follow this pattern for Hono route handlers:

```typescript
import { Hono } from 'hono'
import type { Context } from 'hono'

const app = new Hono()

app.get('/users/:id', async (c: Context) => {
  const { id } = c.req.param()

  try {
    const user = await userService.getById(id)

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ data: user })  // camelCase in response
  } catch (error) {
    logger.error('Failed to get user', { id, error })
    return c.json({ error: 'Internal server error' }, 500)
  }
})
```

### Middleware

Follow this pattern for middleware:

```typescript
import type { MiddlewareHandler } from 'hono'

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const user = await verifyToken(token)
    c.set('user', user)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
```

## Formatting and Linting

### Prettier

Prettier runs automatically on commit. Configuration is in `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### ESLint

ESLint rules must pass. Run before committing:

```bash
npm run lint
```

### Pre-commit Hooks

Pre-commit hooks automatically:
- Format code with Prettier
- Run ESLint
- Run type checking

## Testing Standards

### Test File Location

Place test files next to the code they test:

```
src/
  services/
    user-service.ts
    user-service.test.ts    # Unit tests
  routes/
    api.ts
    api.test.ts
```

Or in a `__tests__` directory for larger test suites:

```
src/
  services/
    user-service.ts
    __tests__/
      user-service.test.ts
      user-service.integration.test.ts
```

### Test Naming

Use descriptive test names:

```typescript
describe('UserService', () => {
  describe('getById', () => {
    it('returns user when found', async () => {
      // ...
    })

    it('returns null when user does not exist', async () => {
      // ...
    })

    it('throws error when database connection fails', async () => {
      // ...
    })
  })
})
```

## Quick Reference

```
Collection names:     snake_case     blog_posts
Schema fields:        camelCase      featuredImage
Database columns:     snake_case     featured_image
API responses:        camelCase      featuredImage
Variables:            camelCase      userData
Functions:            camelCase      getUserById
Classes/Types:        PascalCase     UserService
Constants:            SNAKE_CASE     MAX_RETRIES
Files:                kebab-case     user-service.ts
```

## Questions?

If you have questions about these standards:
- Check [existing issues](https://github.com/lane711/sonicjs/issues)
- Ask in [GitHub Discussions](https://github.com/lane711/sonicjs/discussions)
- Join our [Discord](https://discord.gg/8bMy6bv3sZ)
