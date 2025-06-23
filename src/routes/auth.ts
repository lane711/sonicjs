import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { setCookie } from 'hono/cookie'
import { AuthManager, requireAuth } from '../middleware/auth'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

type Variables = {
  user: {
    userId: string
    email: string
    role: string
    exp: number
    iat: number
  }
}

export const authRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Registration schema
const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
})

// Login schema
const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
})

// Register new user
authRoutes.post('/register',
  zValidator('json', registerSchema),
  async (c) => {
    try {
      const { email, password, username, firstName, lastName } = c.req.valid('json')
      const db = c.env.DB
      
      // Check if user already exists
      const existingUser = await db.prepare('SELECT id FROM users WHERE email = ? OR username = ?')
        .bind(email, username)
        .first()
      
      if (existingUser) {
        return c.json({ error: 'User with this email or username already exists' }, 400)
      }
      
      // Hash password
      const passwordHash = await AuthManager.hashPassword(password)
      
      // Create user
      const userId = crypto.randomUUID()
      const now = new Date()
      
      await db.prepare(`
        INSERT INTO users (id, email, username, firstName, lastName, passwordHash, role, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        email,
        username,
        firstName,
        lastName,
        passwordHash,
        'viewer', // Default role
        1, // isActive
        now.getTime(),
        now.getTime()
      ).run()
      
      // Generate JWT token
      const token = await AuthManager.generateToken(userId, email, 'viewer')
      
      // Set HTTP-only cookie
      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 60 * 60 * 24 // 24 hours
      })
      
      return c.json({
        user: {
          id: userId,
          email,
          username,
          firstName,
          lastName,
          role: 'viewer'
        },
        token
      }, 201)
    } catch (error) {
      console.error('Registration error:', error)
      return c.json({ error: 'Registration failed' }, 500)
    }
  }
)

// Login user
authRoutes.post('/login',
  zValidator('json', loginSchema),
  async (c) => {
    try {
      const { email, password } = c.req.valid('json')
      const db = c.env.DB
      
      // Find user
      const user = await db.prepare('SELECT * FROM users WHERE email = ? AND isActive = 1')
        .bind(email)
        .first() as any
      
      if (!user) {
        return c.json({ error: 'Invalid email or password' }, 401)
      }
      
      // Verify password
      const isValidPassword = await AuthManager.verifyPassword(password, user.passwordHash)
      if (!isValidPassword) {
        return c.json({ error: 'Invalid email or password' }, 401)
      }
      
      // Generate JWT token
      const token = await AuthManager.generateToken(user.id, user.email, user.role)
      
      // Set HTTP-only cookie
      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 60 * 60 * 24 // 24 hours
      })
      
      // Update last login
      await db.prepare('UPDATE users SET lastLoginAt = ? WHERE id = ?')
        .bind(new Date().getTime(), user.id)
        .run()
      
      return c.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      })
    } catch (error) {
      console.error('Login error:', error)
      return c.json({ error: 'Login failed' }, 500)
    }
  }
)

// Logout user
authRoutes.post('/logout', (c) => {
  // Clear the auth cookie
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 0 // Expire immediately
  })
  
  return c.json({ message: 'Logged out successfully' })
})

// Get current user
authRoutes.get('/me', requireAuth(), async (c) => {
  try {
    // This would need the auth middleware applied
    const user = c.get('user')
    
    if (!user) {
      return c.json({ error: 'Not authenticated' }, 401)
    }
    
    const db = c.env.DB
    const userData = await db.prepare('SELECT id, email, username, firstName, lastName, role, createdAt FROM users WHERE id = ?')
      .bind(user.userId)
      .first()
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user: userData })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Failed to get user' }, 500)
  }
})

// Refresh token
authRoutes.post('/refresh', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ error: 'Not authenticated' }, 401)
    }
    
    // Generate new token
    const token = await AuthManager.generateToken(user.userId, user.email, user.role)
    
    // Set new cookie
    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })
    
    return c.json({ token })
  } catch (error) {
    console.error('Token refresh error:', error)
    return c.json({ error: 'Token refresh failed' }, 500)
  }
})