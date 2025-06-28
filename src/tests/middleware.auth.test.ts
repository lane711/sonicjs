// @ts-nocheck
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { AuthManager, requireAuth, requireRole, optionalAuth } from '../middleware/auth'

// Mock the crypto API for password hashing
const mockCrypto = {
  subtle: {
    digest: vi.fn()
  }
}

// Mock Hono JWT functions
vi.mock('hono/jwt', () => ({
  sign: vi.fn(),
  verify: vi.fn()
}))

// Mock Hono cookie functions  
vi.mock('hono/cookie', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn()
}))

import { sign, verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'

// Setup global crypto mock
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
})

describe('Authentication Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock current time for consistent testing
    vi.spyOn(Date, 'now').mockReturnValue(1640995200000) // 2022-01-01 00:00:00
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AuthManager', () => {
    describe('generateToken', () => {
      it('should generate JWT token with correct payload', async () => {
        const mockToken = 'mock.jwt.token'
        vi.mocked(sign).mockResolvedValue(mockToken)

        const token = await AuthManager.generateToken('user123', 'test@example.com', 'admin')

        expect(sign).toHaveBeenCalledWith({
          userId: 'user123',
          email: 'test@example.com',
          role: 'admin',
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
          iat: Math.floor(Date.now() / 1000)
        }, 'your-super-secret-jwt-key-change-in-production')
        
        expect(token).toBe(mockToken)
      })

      it('should generate different tokens for different users', async () => {
        vi.mocked(sign)
          .mockResolvedValueOnce('token1')
          .mockResolvedValueOnce('token2')

        const token1 = await AuthManager.generateToken('user1', 'user1@example.com', 'user')
        const token2 = await AuthManager.generateToken('user2', 'user2@example.com', 'admin')

        expect(token1).toBe('token1')
        expect(token2).toBe('token2')
        expect(sign).toHaveBeenCalledTimes(2)
      })
    })

    describe('verifyToken', () => {
      it('should verify valid token successfully', async () => {
        const mockPayload = {
          userId: 'user123',
          email: 'test@example.com', 
          role: 'admin',
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          iat: Math.floor(Date.now() / 1000)
        }
        
        vi.mocked(verify).mockResolvedValue(mockPayload)

        const result = await AuthManager.verifyToken('valid.jwt.token')

        expect(verify).toHaveBeenCalledWith('valid.jwt.token', 'your-super-secret-jwt-key-change-in-production')
        expect(result).toEqual(mockPayload)
      })

      it('should return null for expired token', async () => {
        const expiredPayload = {
          userId: 'user123',
          email: 'test@example.com',
          role: 'admin', 
          exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          iat: Math.floor(Date.now() / 1000) - 7200
        }
        
        vi.mocked(verify).mockResolvedValue(expiredPayload)

        const result = await AuthManager.verifyToken('expired.jwt.token')

        expect(result).toBeNull()
      })

      it('should return null for invalid token', async () => {
        vi.mocked(verify).mockRejectedValue(new Error('Invalid token'))

        const result = await AuthManager.verifyToken('invalid.token')

        expect(result).toBeNull()
      })

      it('should handle verification errors gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.mocked(verify).mockRejectedValue(new Error('Token malformed'))

        const result = await AuthManager.verifyToken('malformed.token')

        expect(result).toBeNull()
        expect(consoleSpy).toHaveBeenCalledWith('Token verification failed:', expect.any(Error))
      })
    })

    describe('hashPassword', () => {
      it('should hash password using SHA-256', async () => {
        const mockHash = new ArrayBuffer(32)
        const mockArray = new Uint8Array(mockHash)
        mockArray.fill(0xab) // Fill with test bytes
        
        vi.mocked(mockCrypto.subtle.digest).mockResolvedValue(mockHash)

        const result = await AuthManager.hashPassword('testpassword')

        expect(mockCrypto.subtle.digest).toHaveBeenCalledWith(
          'SHA-256', 
          expect.any(Uint8Array)
        )
        expect(result).toBe('ab'.repeat(32)) // Should be hex representation
      })

      it('should produce consistent hash for same password', async () => {
        const mockHash = new ArrayBuffer(32)
        vi.mocked(mockCrypto.subtle.digest).mockResolvedValue(mockHash)

        const hash1 = await AuthManager.hashPassword('password123')
        const hash2 = await AuthManager.hashPassword('password123')

        expect(hash1).toBe(hash2)
      })
    })

    describe('verifyPassword', () => {
      it('should verify correct password', async () => {
        const mockHash = new ArrayBuffer(32)
        const mockArray = new Uint8Array(mockHash)
        mockArray.fill(0xcd)
        
        vi.mocked(mockCrypto.subtle.digest).mockResolvedValue(mockHash)
        const expectedHash = 'cd'.repeat(32)

        const result = await AuthManager.verifyPassword('correctpassword', expectedHash)

        expect(result).toBe(true)
      })

      it('should reject incorrect password', async () => {
        const mockHash = new ArrayBuffer(32)
        const mockArray = new Uint8Array(mockHash)
        mockArray.fill(0xef)
        
        vi.mocked(mockCrypto.subtle.digest).mockResolvedValue(mockHash)
        const wrongHash = 'ab'.repeat(32)

        const result = await AuthManager.verifyPassword('wrongpassword', wrongHash)

        expect(result).toBe(false)
      })
    })
  })

  describe('requireAuth middleware', () => {
    let mockContext: any
    let mockNext: any

    beforeEach(() => {
      mockNext = vi.fn()
      mockContext = {
        req: {
          header: vi.fn()
        },
        json: vi.fn(),
        redirect: vi.fn(),
        set: vi.fn()
      }
    })

    it('should authenticate user with valid Bearer token', async () => {
      const mockPayload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }

      mockContext.req.header.mockReturnValue('Bearer valid.jwt.token')
      vi.mocked(verify).mockResolvedValue(mockPayload)

      const middleware = requireAuth()
      await middleware(mockContext, mockNext)

      expect(mockContext.set).toHaveBeenCalledWith('user', mockPayload)
      expect(mockNext).toHaveBeenCalled()
      expect(mockContext.json).not.toHaveBeenCalled()
      expect(mockContext.redirect).not.toHaveBeenCalled()
    })

    it('should authenticate user with valid cookie token', async () => {
      const mockPayload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }

      mockContext.req.header.mockReturnValue(null)
      vi.mocked(getCookie).mockReturnValue('cookie.jwt.token')
      vi.mocked(verify).mockResolvedValue(mockPayload)

      const middleware = requireAuth()
      await middleware(mockContext, mockNext)

      expect(getCookie).toHaveBeenCalledWith(mockContext, 'auth_token')
      expect(mockContext.set).toHaveBeenCalledWith('user', mockPayload)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should return 401 for API request without token', async () => {
      mockContext.req.header
        .mockReturnValueOnce(null) // No Authorization header
        .mockReturnValueOnce('application/json') // Accept header
      vi.mocked(getCookie).mockReturnValue(null)

      const middleware = requireAuth()
      await middleware(mockContext, mockNext)

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Authentication required' }, 
        401
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should redirect browser request without token', async () => {
      mockContext.req.header
        .mockReturnValueOnce(null) // No Authorization header
        .mockReturnValueOnce('text/html') // Accept header
      vi.mocked(getCookie).mockReturnValue(null)

      const middleware = requireAuth()
      await middleware(mockContext, mockNext)

      expect(mockContext.redirect).toHaveBeenCalledWith(
        '/auth/login?error=Please login to access the admin area'
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 401 for invalid token', async () => {
      mockContext.req.header
        .mockReturnValueOnce('Bearer invalid.token')
        .mockReturnValueOnce('application/json')
      vi.mocked(verify).mockRejectedValue(new Error('Invalid token'))

      const middleware = requireAuth()
      await middleware(mockContext, mockNext)

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Invalid or expired token' }, 
        401
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should redirect browser for expired token', async () => {
      const expiredPayload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired
        iat: Math.floor(Date.now() / 1000) - 7200
      }

      mockContext.req.header
        .mockReturnValueOnce('Bearer expired.token')
        .mockReturnValueOnce('text/html')
      vi.mocked(verify).mockResolvedValue(expiredPayload)

      const middleware = requireAuth()
      await middleware(mockContext, mockNext)

      expect(mockContext.redirect).toHaveBeenCalledWith(
        '/auth/login?error=Your session has expired, please login again'
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle authentication errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockContext.req.header
        .mockImplementationOnce(() => { throw new Error('Header error') })
        .mockReturnValueOnce('application/json')

      const middleware = requireAuth()
      await middleware(mockContext, mockNext)

      expect(consoleSpy).toHaveBeenCalledWith('Auth middleware error:', expect.any(Error))
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Authentication failed' }, 
        401
      )
    })
  })

  describe('requireRole middleware', () => {
    let mockContext: any
    let mockNext: any

    beforeEach(() => {
      mockNext = vi.fn()
      mockContext = {
        get: vi.fn(),
        req: {
          header: vi.fn()
        },
        json: vi.fn(),
        redirect: vi.fn()
      }
    })

    it('should allow user with correct role', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'admin@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }

      mockContext.get.mockReturnValue(mockUser)

      const middleware = requireRole('admin')
      await middleware(mockContext, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockContext.json).not.toHaveBeenCalled()
    })

    it('should allow user with one of multiple allowed roles', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'editor@example.com',
        role: 'editor',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }

      mockContext.get.mockReturnValue(mockUser)

      const middleware = requireRole(['admin', 'editor'])
      await middleware(mockContext, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it('should deny user with insufficient role for API request', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }

      mockContext.get.mockReturnValue(mockUser)
      mockContext.req.header.mockReturnValue('application/json')

      const middleware = requireRole('admin')
      await middleware(mockContext, mockNext)

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Insufficient permissions' }, 
        403
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should redirect browser with insufficient role', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }

      mockContext.get.mockReturnValue(mockUser)
      mockContext.req.header.mockReturnValue('text/html')

      const middleware = requireRole('admin')
      await middleware(mockContext, mockNext)

      expect(mockContext.redirect).toHaveBeenCalledWith(
        '/auth/login?error=You do not have permission to access this area'
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should require authentication when no user in context', async () => {
      mockContext.get.mockReturnValue(null)
      mockContext.req.header.mockReturnValue('application/json')

      const middleware = requireRole('admin')
      await middleware(mockContext, mockNext)

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Authentication required' }, 
        401
      )
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('optionalAuth middleware', () => {
    let mockContext: any
    let mockNext: any

    beforeEach(() => {
      mockNext = vi.fn()
      mockContext = {
        req: {
          header: vi.fn()
        },
        set: vi.fn()
      }
    })

    it('should set user when valid token provided', async () => {
      const mockPayload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }

      mockContext.req.header.mockReturnValue('Bearer valid.token')
      vi.mocked(verify).mockResolvedValue(mockPayload)

      const middleware = optionalAuth()
      await middleware(mockContext, mockNext)

      expect(mockContext.set).toHaveBeenCalledWith('user', mockPayload)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should continue without user when no token provided', async () => {
      mockContext.req.header.mockReturnValue(null)
      vi.mocked(getCookie).mockReturnValue(null)

      const middleware = optionalAuth()
      await middleware(mockContext, mockNext)

      expect(mockContext.set).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should continue without user when invalid token provided', async () => {
      mockContext.req.header.mockReturnValue('Bearer invalid.token')
      vi.mocked(verify).mockRejectedValue(new Error('Invalid token'))

      const middleware = optionalAuth()
      await middleware(mockContext, mockNext)

      expect(mockContext.set).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle errors gracefully and continue', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockContext.req.header.mockImplementation(() => {
        throw new Error('Request error')
      })

      const middleware = optionalAuth()
      await middleware(mockContext, mockNext)

      expect(consoleSpy).toHaveBeenCalledWith('Optional auth error:', expect.any(Error))
      expect(mockNext).toHaveBeenCalled()
    })
  })
})