import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { setCookie } from 'hono/cookie'
import { html } from 'hono/html'
import { AuthManager, requireAuth } from '../middleware/auth'
import { renderLoginPage, LoginPageData } from '../templates/pages/auth-login.template'
import { renderRegisterPage, RegisterPageData } from '../templates/pages/auth-register.template'
import { normalizeExistingEmails } from '../scripts/normalize-emails'

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

// Login page (HTML form)
authRoutes.get('/login', (c) => {
  const error = c.req.query('error')
  const message = c.req.query('message')
  
  const pageData: LoginPageData = {
    error: error || undefined,
    message: message || undefined
  }
  
  return c.html(renderLoginPage(pageData))
})

// Registration page (HTML form)
authRoutes.get('/register', (c) => {
  const error = c.req.query('error')
  
  const pageData: RegisterPageData = {
    error: error || undefined
  }
  
  return c.html(renderRegisterPage(pageData))
})

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
      
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase()
      
      // Check if user already exists
      const existingUser = await db.prepare('SELECT id FROM users WHERE email = ? OR username = ?')
        .bind(normalizedEmail, username)
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
        INSERT INTO users (id, email, username, first_name, last_name, password_hash, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        normalizedEmail,
        username,
        firstName,
        lastName,
        passwordHash,
        'viewer', // Default role
        1, // is_active
        now.getTime(),
        now.getTime()
      ).run()
      
      // Generate JWT token
      const token = await AuthManager.generateToken(userId, normalizedEmail, 'viewer')
      
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
          email: normalizedEmail,
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
      
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase()
      
      // Find user
      const user = await db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1')
        .bind(normalizedEmail)
        .first() as any
      
      if (!user) {
        return c.json({ error: 'Invalid email or password' }, 401)
      }
      
      // Verify password
      const isValidPassword = await AuthManager.verifyPassword(password, user.password_hash)
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
      await db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
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

// Logout user (both GET and POST for convenience)
authRoutes.post('/logout', (c) => {
  // Clear the auth cookie
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'Strict',
    maxAge: 0 // Expire immediately
  })
  
  return c.json({ message: 'Logged out successfully' })
})

authRoutes.get('/logout', (c) => {
  // Clear the auth cookie
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'Strict',
    maxAge: 0 // Expire immediately
  })
  
  return c.redirect('/auth/login?message=You have been logged out successfully')
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
    const userData = await db.prepare('SELECT id, email, username, first_name, last_name, role, created_at FROM users WHERE id = ?')
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

// Form-based registration handler (for HTML forms)
authRoutes.post('/register/form', async (c) => {
  try {
    const formData = await c.req.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase()

    // Validate the data
    const validation = registerSchema.safeParse({
      email: normalizedEmail, password, username, firstName, lastName
    })

    if (!validation.success) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ${validation.error.errors.map(err => err.message).join(', ')}
        </div>
      `)
    }

    const db = c.env.DB
    
    // Check if user already exists
    const existingUser = await db.prepare('SELECT id FROM users WHERE email = ? OR username = ?')
      .bind(normalizedEmail, username)
      .first()
    
    if (existingUser) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          User with this email or username already exists
        </div>
      `)
    }
    
    // Hash password
    const passwordHash = await AuthManager.hashPassword(password)
    
    // Create user
    const userId = crypto.randomUUID()
    const now = new Date()
    
    await db.prepare(`
      INSERT INTO users (id, email, username, first_name, last_name, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      normalizedEmail,
      username,
      firstName,
      lastName,
      passwordHash,
      'admin', // First user gets admin role
      1, // is_active
      now.getTime(),
      now.getTime()
    ).run()
    
    // Generate JWT token
    const token = await AuthManager.generateToken(userId, normalizedEmail, 'admin')
    
    // Set HTTP-only cookie
    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'Strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })
    
    return c.html(html`
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Account created successfully! Redirecting to admin dashboard...
        <script>
          setTimeout(() => {
            window.location.href = '/admin';
          }, 2000);
        </script>
      </div>
    `)
  } catch (error) {
    console.error('Registration error:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Registration failed. Please try again.
      </div>
    `)
  }
})

// Form-based login handler (for HTML forms)
authRoutes.post('/login/form', async (c) => {
  try {
    const formData = await c.req.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase()

    // Validate the data
    const validation = loginSchema.safeParse({ email: normalizedEmail, password })

    if (!validation.success) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ${validation.error.errors.map(err => err.message).join(', ')}
        </div>
      `)
    }

    const db = c.env.DB
    
    // Find user
    const user = await db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1')
      .bind(normalizedEmail)
      .first() as any
    
    if (!user) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Invalid email or password
        </div>
      `)
    }
    
    // Verify password
    const isValidPassword = await AuthManager.verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Invalid email or password
        </div>
      `)
    }
    
    // Generate JWT token
    const token = await AuthManager.generateToken(user.id, user.email, user.role)
    
    // Set HTTP-only cookie
    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'Strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })
    
    // Update last login
    await db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
      .bind(new Date().getTime(), user.id)
      .run()
    
    return c.html(html`
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Login successful! Redirecting to admin dashboard...
        <script>
          setTimeout(() => {
            window.location.href = '/admin';
          }, 2000);
        </script>
      </div>
    `)
  } catch (error) {
    console.error('Login error:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Login failed. Please try again.
      </div>
    `)
  }
})

// Test seeding endpoint (only for development/testing)
authRoutes.post('/seed-admin', async (c) => {
  try {
    const db = c.env.DB
    
    // First ensure the users table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'viewer',
        avatar TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_login_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `).run()
    
    // Delete existing admin user if exists
    await db.prepare('DELETE FROM users WHERE email = ? OR username = ?')
      .bind('admin@sonicjs.com', 'admin')
      .run()
    
    // Hash password
    const passwordHash = await AuthManager.hashPassword('admin123')
    
    // Create admin user
    const userId = 'admin-user-id'
    const now = Date.now()
    const adminEmail = 'admin@sonicjs.com'.toLowerCase()
    
    await db.prepare(`
      INSERT INTO users (id, email, username, first_name, last_name, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      adminEmail,
      'admin',
      'Admin',
      'User',
      passwordHash,
      'admin',
      1, // is_active
      now,
      now
    ).run()
    
    return c.json({ 
      message: 'Admin user created successfully',
      user: {
        id: userId,
        email: adminEmail,
        username: 'admin',
        role: 'admin'
      },
      passwordHash: passwordHash // For debugging
    })
  } catch (error) {
    console.error('Seed admin error:', error)
    return c.json({ error: 'Failed to create admin user', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

// Normalize existing emails endpoint (temporary - for migration)
authRoutes.post('/normalize-emails', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    
    // Only allow admin users to run this
    if (!user || user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    const db = c.env.DB
    await normalizeExistingEmails(db)
    
    return c.json({ 
      message: 'Email normalization completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Email normalization error:', error)
    return c.json({ 
      error: 'Email normalization failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500)
  }
})