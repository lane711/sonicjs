import { createDb, users } from '@sonicjs-cms/core'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

/**
 * Seed script to create initial admin user
 *
 * Run this script after migrations:
 * npm run db:migrate:local
 * npm run seed
 *
 * Admin credentials:
 * Email: admin@sonicjs.com
 * Password: [as entered during setup]
 */

interface Env {
  DB: D1Database
}

async function seed() {
  // Get D1 database from Cloudflare environment
  // @ts-ignore - getPlatformProxy is available in wrangler
  const { env } = await import('@cloudflare/workers-types/experimental')
  const platform = (env as any).getPlatformProxy?.() || { env: {} }

  if (!platform.env?.DB) {
    console.error('❌ Error: DB binding not found')
    console.error('')
    console.error('Make sure you have:')
    console.error('1. Created your D1 database: wrangler d1 create <database-name>')
    console.error('2. Updated wrangler.toml with the database_id')
    console.error('3. Run migrations: npm run db:migrate:local')
    console.error('')
    process.exit(1)
  }

  const db = createDb(platform.env.DB)

  try {
    // Check if admin user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@sonicjs.com'))
      .get()

    if (existingUser) {
      console.log('✓ Admin user already exists')
      console.log(`  Email: admin@sonicjs.com`)
      console.log(`  Role: ${existingUser.role}`)
      return
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash('sonicjs!', 10)

    // Create admin user
    await db
      .insert(users)
      .values({
        email: 'admin@sonicjs.com',
        username: 'admin',
        password: passwordHash,
        role: 'admin',
        isActive: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .run()

    console.log('✓ Admin user created successfully')
    console.log(`  Email: admin@sonicjs.com`)
    console.log(`  Role: admin`)
    console.log('')
    console.log('You can now login at: http://localhost:8787/auth/login')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

// Run seed
seed()
  .then(() => {
    console.log('')
    console.log('✓ Seeding complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
