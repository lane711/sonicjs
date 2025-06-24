import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { setCookie } from 'hono/cookie'
import { html } from 'hono/html'
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

// Login page (HTML form)
authRoutes.get('/login', (c) => {
  const error = c.req.query('error')
  const message = c.req.query('message')
  
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - SonicJS AI</title>
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen flex items-center justify-center">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to SonicJS AI
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or <a href="/auth/register" class="font-medium text-blue-600 hover:text-blue-500">create a new account</a>
          </p>
        </div>
        
        ${error ? html`
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ${error}
          </div>
        ` : ''}
        
        ${message ? html`
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ${message}
          </div>
        ` : ''}
        
        <form 
          id="login-form"
          hx-post="/auth/login/form"
          hx-target="#form-response"
          hx-swap="innerHTML"
          class="mt-8 space-y-6"
        >
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                autocomplete="email" 
                required 
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Email address"
              >
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autocomplete="current-password" 
                required 
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Password"
              >
            </div>
          </div>

          <div>
            <button 
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>
        
        <div id="form-response"></div>
      </div>
    </body>
    </html>
  `)
})

// Registration page (HTML form)
authRoutes.get('/register', (c) => {
  const error = c.req.query('error')
  
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Register - SonicJS AI</title>
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen flex items-center justify-center">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or <a href="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">sign in to existing account</a>
          </p>
        </div>
        
        ${error ? html`
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ${error}
          </div>
        ` : ''}
        
        <form 
          id="register-form"
          hx-post="/auth/register/form"
          hx-target="#form-response"
          hx-swap="innerHTML"
          class="mt-8 space-y-6"
        >
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">First name</label>
                <input 
                  id="firstName" 
                  name="firstName" 
                  type="text" 
                  required 
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                  placeholder="First name"
                >
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Last name</label>
                <input 
                  id="lastName" 
                  name="lastName" 
                  type="text" 
                  required 
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                  placeholder="Last name"
                >
              </div>
            </div>
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
              <input 
                id="username" 
                name="username" 
                type="text" 
                required 
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Username"
              >
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                autocomplete="email" 
                required 
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Email address"
              >
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autocomplete="new-password" 
                required 
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Password (min. 8 characters)"
              >
            </div>
          </div>

          <div>
            <button 
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create account
            </button>
          </div>
        </form>
        
        <div id="form-response"></div>
      </div>
    </body>
    </html>
  `)
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
        INSERT INTO users (id, email, username, first_name, last_name, password_hash, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        email,
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
      const user = await db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1')
        .bind(email)
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

    // Validate the data
    const validation = registerSchema.safeParse({
      email, password, username, firstName, lastName
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
      .bind(email, username)
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
      email,
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
    const token = await AuthManager.generateToken(userId, email, 'admin')
    
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

    // Validate the data
    const validation = loginSchema.safeParse({ email, password })

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
      .bind(email)
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