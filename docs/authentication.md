# Authentication & Security

SonicJS AI implements a comprehensive authentication and authorization system using JWT tokens and role-based access control (RBAC). This guide covers all aspects of user authentication, security, and permissions.

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [JWT Implementation](#jwt-implementation)
- [Role-Based Access Control](#role-based-access-control)
- [User Management](#user-management)
- [Security Features](#security-features)
- [API Authentication](#api-authentication)
- [Frontend Integration](#frontend-integration)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

SonicJS AI uses a modern authentication architecture built on:

- **JWT (JSON Web Tokens)** for stateless authentication
- **RBAC (Role-Based Access Control)** for fine-grained permissions
- **Secure password hashing** with bcrypt
- **Session management** with configurable expiration
- **CSRF protection** and secure headers
- **Rate limiting** for authentication endpoints

## Authentication Flow

### 1. User Registration

```typescript
// POST /auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Process:**
1. Email validation and uniqueness check
2. Password strength validation
3. Secure password hashing with bcrypt
4. User record creation with default role
5. Welcome email (if configured)

### 2. User Login

```typescript
// POST /auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```typescript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "editor",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 3. Token Refresh

```typescript
// POST /auth/refresh
Authorization: Bearer <current_token>
```

## JWT Implementation

### Token Structure

SonicJS AI uses JWTs with the following payload structure:

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;  // Expiration timestamp
  iat: number;  // Issued at timestamp
}
```

### Token Configuration

```typescript
// Environment variables
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRES_IN=7d  // Default: 7 days
JWT_ALGORITHM=HS256
```

### Token Verification

The authentication middleware (`src/middleware/auth.ts`) handles:

- Token extraction from Authorization header
- Token verification and decoding
- Expiration checking
- User existence validation
- Role-based access control

## Role-Based Access Control

### Available Roles

| Role | Permissions | Description |
|------|-------------|-------------|
| `admin` | Full system access | System administrators |
| `editor` | Content management, user viewing | Content managers |
| `author` | Content creation/editing (own), viewing | Content creators |
| `viewer` | Read-only access | Basic users |

### Permission Matrix

| Action | Admin | Editor | Author | Viewer |
|--------|-------|--------|--------|--------|
| View content | ✅ | ✅ | ✅ | ✅ |
| Create content | ✅ | ✅ | ✅ | ❌ |
| Edit own content | ✅ | ✅ | ✅ | ❌ |
| Edit all content | ✅ | ✅ | ❌ | ❌ |
| Delete content | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ |
| Media management | ✅ | ✅ | ✅ | ❌ |

### Implementation

#### Middleware Usage

```typescript
import { requireAuth, requireRole } from '../middleware/auth'

// Require authentication
app.get('/protected', requireAuth(), (c) => {
  const user = c.get('user')
  return c.json({ message: 'Authenticated user', user })
})

// Require specific role
app.delete('/admin/users/:id', 
  requireAuth(),
  requireRole(['admin']),
  (c) => {
    // Admin-only endpoint
  }
)

// Multiple roles allowed
app.post('/content', 
  requireAuth(),
  requireRole(['admin', 'editor', 'author']),
  (c) => {
    // Content creation endpoint
  }
)
```

#### Custom Permission Checks

```typescript
// Check ownership or admin/editor role
const canEditContent = (user: User, content: Content): boolean => {
  return user.role === 'admin' || 
         user.role === 'editor' || 
         (user.role === 'author' && content.authorId === user.id)
}
```

## User Management

### User Model

```typescript
interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'editor' | 'author' | 'viewer';
  is_active: boolean;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}
```

### User Operations

#### Creating Users

```typescript
// Admin-only user creation
POST /admin/users
{
  "email": "newuser@example.com",
  "password": "temporaryPassword",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "editor"
}
```

#### Updating Users

```typescript
// Update user profile (self or admin)
PUT /admin/users/:id
{
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "author"  // Admin only
}
```

#### Password Management

```typescript
// Change password (authenticated users)
POST /auth/change-password
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword"
}

// Reset password (public)
POST /auth/reset-password
{
  "email": "user@example.com"
}
```

## Security Features

### Password Security

- **Minimum Requirements**: 8 characters, mixed case, numbers
- **Hashing**: bcrypt with salt rounds (default: 12)
- **Validation**: Client and server-side validation
- **Reset Tokens**: Secure, time-limited reset tokens

### Rate Limiting

```typescript
// Authentication endpoints are rate limited
POST /auth/login      // 5 attempts per 15 minutes
POST /auth/register   // 3 attempts per hour
POST /auth/reset      // 2 attempts per hour
```

### CSRF Protection

- **SameSite cookies** for session management
- **CSRF tokens** for state-changing operations
- **Origin validation** for API requests

### Secure Headers

```typescript
// Automatically applied security headers
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

## API Authentication

### Bearer Token Authentication

Include the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer your-jwt-token" \
     https://your-app.workers.dev/api/protected-endpoint
```

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 429 | `RATE_LIMITED` | Too many authentication attempts |

```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "code": 401
}
```

## Frontend Integration

### Token Storage

```typescript
// Store JWT securely
localStorage.setItem('auth_token', token)

// Include in requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  'Content-Type': 'application/json'
}
```

### HTMX Integration

```html
<!-- Include auth token in HTMX requests -->
<div hx-headers='{"Authorization": "Bearer your-token"}'>
  <button hx-post="/api/protected-action">
    Protected Action
  </button>
</div>
```

### Session Management

```typescript
// Check token expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// Auto-refresh tokens
if (isTokenExpired(token)) {
  await refreshToken()
}
```

## Security Best Practices

### Environment Configuration

```bash
# Production environment variables
JWT_SECRET=your-super-secure-256-bit-secret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_ENABLED=true
CSRF_PROTECTION=true
```

### Production Deployment

1. **Use HTTPS only** in production
2. **Secure JWT secrets** with at least 256 bits of entropy
3. **Enable rate limiting** for all authentication endpoints
4. **Configure CORS** appropriately for your domain
5. **Regular security audits** of dependencies
6. **Monitor authentication logs** for suspicious activity

### Password Policies

```typescript
// Recommended password validation
const passwordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true
}
```

## Troubleshooting

### Common Issues

#### Token Validation Errors

```bash
# Error: Invalid token signature
# Solution: Check JWT_SECRET environment variable

# Error: Token expired
# Solution: Implement token refresh logic

# Error: User not found
# Solution: Verify user still exists in database
```

#### Role Permission Issues

```bash
# Error: Insufficient permissions
# Check user role in database
SELECT role FROM users WHERE id = 'user-id';

# Update user role if needed
UPDATE users SET role = 'editor' WHERE id = 'user-id';
```

#### Authentication Flow Debug

```typescript
// Enable auth debugging
DEBUG=auth:* npm run dev

// Check token contents
console.log(JSON.parse(atob(token.split('.')[1])))
```

### Security Monitoring

```typescript
// Log authentication events
const logAuthEvent = (event: string, userId: string, ip: string) => {
  console.log(`[AUTH] ${event}: User ${userId} from ${ip}`)
}

// Monitor failed login attempts
const trackFailedLogins = async (email: string, ip: string) => {
  // Implement rate limiting and alerting
}
```

### Performance Optimization

```typescript
// Cache user permissions
const userPermissionsCache = new Map()

// Optimize JWT verification
const verifyTokenOptimized = async (token: string) => {
  // Implement caching for frequently verified tokens
}
```

## Related Documentation

- [User Guide](user-guide.md) - End-user authentication workflows
- [API Reference](api-reference.md) - Complete API authentication docs
- [Deployment](deployment.md) - Production security configuration
- [Troubleshooting](troubleshooting.md) - Common authentication issues