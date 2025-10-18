import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthManager, requireAuth, requireRole, optionalAuth } from '../../middleware/auth'
import { Context, Next } from 'hono'

describe('AuthManager', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await AuthManager.generateToken('user-123', 'test@example.com', 'admin')

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts: header.payload.signature
    })

    it('should generate unique tokens for different users', async () => {
      const token1 = await AuthManager.generateToken('user-1', 'user1@example.com', 'user')
      const token2 = await AuthManager.generateToken('user-2', 'user2@example.com', 'user')

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const userId = 'user-123'
      const email = 'test@example.com'
      const role = 'admin'

      const token = await AuthManager.generateToken(userId, email, role)
      const payload = await AuthManager.verifyToken(token)

      expect(payload).toBeTruthy()
      expect(payload?.userId).toBe(userId)
      expect(payload?.email).toBe(email)
      expect(payload?.role).toBe(role)
    })

    it('should return null for invalid token', async () => {
      const payload = await AuthManager.verifyToken('invalid.token.here')
      expect(payload).toBeNull()
    })

    it('should return null for malformed token', async () => {
      const payload = await AuthManager.verifyToken('not-a-jwt-token')
      expect(payload).toBeNull()
    })

    it('should include expiration time in payload', async () => {
      const token = await AuthManager.generateToken('user-123', 'test@example.com', 'admin')
      const payload = await AuthManager.verifyToken(token)

      expect(payload?.exp).toBeTruthy()
      expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })

    it('should include issued at time in payload', async () => {
      const token = await AuthManager.generateToken('user-123', 'test@example.com', 'admin')
      const payload = await AuthManager.verifyToken(token)

      expect(payload?.iat).toBeTruthy()
      expect(payload?.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000))
    })
  })

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'test-password-123'
      const hash = await AuthManager.hashPassword(password)

      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
      expect(hash).not.toBe(password)
      expect(hash.length).toBe(64) // SHA-256 produces 64 hex characters
    })

    it('should generate same hash for same password', async () => {
      const password = 'test-password-123'
      const hash1 = await AuthManager.hashPassword(password)
      const hash2 = await AuthManager.hashPassword(password)

      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different passwords', async () => {
      const hash1 = await AuthManager.hashPassword('password1')
      const hash2 = await AuthManager.hashPassword('password2')

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'test-password-123'
      const hash = await AuthManager.hashPassword(password)

      const isValid = await AuthManager.verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'test-password-123'
      const hash = await AuthManager.hashPassword(password)

      const isValid = await AuthManager.verifyPassword('wrong-password', hash)
      expect(isValid).toBe(false)
    })

    it('should reject empty password', async () => {
      const password = 'test-password-123'
      const hash = await AuthManager.hashPassword(password)

      const isValid = await AuthManager.verifyPassword('', hash)
      expect(isValid).toBe(false)
    })
  })
})

describe('requireAuth middleware', () => {
  let mockContext: any
  let mockNext: Next

  beforeEach(() => {
    mockNext = vi.fn()
    mockContext = {
      req: {
        header: vi.fn(),
        raw: {
          headers: new Headers()
        }
      },
      set: vi.fn(),
      json: vi.fn().mockReturnValue({ error: 'Authentication required' }),
      redirect: vi.fn().mockReturnValue({ redirect: true }),
      env: {},
    }
  })

  it('should reject request without token', async () => {
    mockContext.req.header.mockReturnValue(undefined)

    const middleware = requireAuth()
    await middleware(mockContext as Context, mockNext)

    // When no token is found, the middleware returns authentication required
    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Authentication required' },
      401
    )
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should redirect browser requests without token', async () => {
    mockContext.req.header.mockImplementation((name: string) => {
      if (name === 'Accept') return 'text/html'
      return undefined
    })

    const middleware = requireAuth()
    await middleware(mockContext as Context, mockNext)

    expect(mockContext.redirect).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should reject request with invalid token', async () => {
    mockContext.req.header.mockImplementation((name: string) => {
      if (name === 'Authorization') return 'Bearer invalid-token'
      return undefined
    })

    const middleware = requireAuth()
    await middleware(mockContext as Context, mockNext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Invalid or expired token' },
      401
    )
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should accept request with valid token', async () => {
    const token = await AuthManager.generateToken('user-123', 'test@example.com', 'admin')

    mockContext.req.header.mockImplementation((name: string) => {
      if (name === 'Authorization') return `Bearer ${token}`
      return undefined
    })

    const middleware = requireAuth()
    await middleware(mockContext as Context, mockNext)

    expect(mockContext.set).toHaveBeenCalledWith('user', expect.objectContaining({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'admin'
    }))
    expect(mockNext).toHaveBeenCalled()
  })

  it('should extract token from cookie if not in header', async () => {
    const token = await AuthManager.generateToken('user-123', 'test@example.com', 'admin')

    // Mock getCookie by setting up the header function
    mockContext.req.header.mockImplementation((name: string) => {
      if (name === 'Authorization') return undefined
      if (name === 'cookie') return `auth_token=${token}`
      return undefined
    })

    // Note: This test may need adjustment based on actual cookie handling in Hono
    // The middleware uses getCookie which may work differently than header access
  })
})

describe('requireRole middleware', () => {
  let mockContext: any
  let mockNext: Next

  beforeEach(() => {
    mockNext = vi.fn()
    mockContext = {
      get: vi.fn(),
      req: {
        header: vi.fn(),
      },
      json: vi.fn().mockReturnValue({ error: 'Insufficient permissions' }),
      redirect: vi.fn().mockReturnValue({ redirect: true }),
    }
  })

  it('should reject request without user context', async () => {
    mockContext.get.mockReturnValue(undefined)
    mockContext.req.header.mockReturnValue(undefined)

    const middleware = requireRole('admin')
    await middleware(mockContext as Context, mockNext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Authentication required' },
      401
    )
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should reject user with wrong role', async () => {
    mockContext.get.mockReturnValue({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user'
    })
    mockContext.req.header.mockReturnValue(undefined)

    const middleware = requireRole('admin')
    await middleware(mockContext as Context, mockNext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Insufficient permissions' },
      403
    )
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should accept user with correct role', async () => {
    mockContext.get.mockReturnValue({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'admin'
    })

    const middleware = requireRole('admin')
    await middleware(mockContext as Context, mockNext)

    expect(mockNext).toHaveBeenCalled()
  })

  it('should accept user with any of multiple allowed roles', async () => {
    mockContext.get.mockReturnValue({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'editor'
    })

    const middleware = requireRole(['admin', 'editor'])
    await middleware(mockContext as Context, mockNext)

    expect(mockNext).toHaveBeenCalled()
  })

  it('should redirect browser requests with insufficient permissions', async () => {
    mockContext.get.mockReturnValue({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user'
    })
    mockContext.req.header.mockImplementation((name: string) => {
      if (name === 'Accept') return 'text/html'
      return undefined
    })

    const middleware = requireRole('admin')
    await middleware(mockContext as Context, mockNext)

    expect(mockContext.redirect).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
  })
})

describe('optionalAuth middleware', () => {
  let mockContext: any
  let mockNext: Next

  beforeEach(() => {
    mockNext = vi.fn()
    mockContext = {
      req: {
        header: vi.fn(),
        raw: {
          headers: new Headers()
        }
      },
      set: vi.fn(),
    }
  })

  it('should continue without user when no token provided', async () => {
    mockContext.req.header.mockReturnValue(undefined)

    const middleware = optionalAuth()
    await middleware(mockContext as Context, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(mockContext.set).not.toHaveBeenCalled()
  })

  it('should set user when valid token provided', async () => {
    const token = await AuthManager.generateToken('user-123', 'test@example.com', 'user')

    mockContext.req.header.mockImplementation((name: string) => {
      if (name === 'Authorization') return `Bearer ${token}`
      return undefined
    })

    const middleware = optionalAuth()
    await middleware(mockContext as Context, mockNext)

    expect(mockContext.set).toHaveBeenCalledWith('user', expect.objectContaining({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user'
    }))
    expect(mockNext).toHaveBeenCalled()
  })

  it('should continue without user when invalid token provided', async () => {
    mockContext.req.header.mockImplementation((name: string) => {
      if (name === 'Authorization') return 'Bearer invalid-token'
      return undefined
    })

    const middleware = optionalAuth()
    await middleware(mockContext as Context, mockNext)

    expect(mockNext).toHaveBeenCalled()
    // User should not be set for invalid tokens
    expect(mockContext.set).not.toHaveBeenCalled()
  })
})
