/**
 * Auth Validation Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkAdminUserExists,
  setAdminExists,
  resetAdminExistsCache,
  isFirstUserRegistration,
  isRegistrationEnabled
} from './auth-validation'

// Mock D1Database
function createMockDb(options: {
  adminExists?: boolean
  userCount?: number
  registrationEnabled?: boolean
  shouldThrow?: boolean
} = {}) {
  const { adminExists = false, userCount = 0, registrationEnabled = true, shouldThrow = false } = options

  return {
    prepare: vi.fn((sql: string) => {
      // For queries that need bind()
      if (sql.includes('role = ?') || sql.includes('plugins WHERE id')) {
        return {
          bind: vi.fn(() => ({
            first: vi.fn(async () => {
              if (shouldThrow) {
                throw new Error('Database error')
              }

              // Check for admin user query
              if (sql.includes('role = ?')) {
                return adminExists ? { id: 'admin-id' } : null
              }

              // Check for plugin settings query
              if (sql.includes('plugins WHERE id')) {
                return registrationEnabled
                  ? { settings: JSON.stringify({ registration: { enabled: true } }) }
                  : { settings: JSON.stringify({ registration: { enabled: false } }) }
              }

              return null
            })
          }))
        }
      }

      // For queries that don't need bind() (like COUNT(*))
      return {
        bind: vi.fn(() => ({
          first: vi.fn(async () => {
            if (shouldThrow) {
              throw new Error('Database error')
            }
            return null
          })
        })),
        first: vi.fn(async () => {
          if (shouldThrow) {
            throw new Error('Database error')
          }

          // Check for user count query
          if (sql.includes('COUNT(*)')) {
            return { count: userCount }
          }

          return null
        })
      }
    })
  } as any
}

describe('Auth Validation Service', () => {
  beforeEach(() => {
    // Reset the cache before each test
    resetAdminExistsCache()
  })

  describe('checkAdminUserExists', () => {
    it('should return false when no admin user exists', async () => {
      const db = createMockDb({ adminExists: false })
      const result = await checkAdminUserExists(db)
      expect(result).toBe(false)
    })

    it('should return true when admin user exists', async () => {
      const db = createMockDb({ adminExists: true })
      const result = await checkAdminUserExists(db)
      expect(result).toBe(true)
    })

    it('should cache the result and not query again', async () => {
      const db = createMockDb({ adminExists: true })

      // First call - should query DB
      const result1 = await checkAdminUserExists(db)
      expect(result1).toBe(true)
      expect(db.prepare).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      const result2 = await checkAdminUserExists(db)
      expect(result2).toBe(true)
      expect(db.prepare).toHaveBeenCalledTimes(1) // Still 1, not 2
    })

    it('should return false on database error', async () => {
      const db = createMockDb({ shouldThrow: true })
      const result = await checkAdminUserExists(db)
      expect(result).toBe(false)
    })
  })

  describe('setAdminExists', () => {
    it('should set the cache to true', async () => {
      const db = createMockDb({ adminExists: false })

      // First check - no admin
      const result1 = await checkAdminUserExists(db)
      expect(result1).toBe(false)

      // Reset cache to test setAdminExists
      resetAdminExistsCache()

      // Set admin exists
      setAdminExists()

      // Now check should return true without querying DB
      const result2 = await checkAdminUserExists(db)
      expect(result2).toBe(true)
      // DB should not have been queried again (only 1 call from first check)
      expect(db.prepare).toHaveBeenCalledTimes(1)
    })
  })

  describe('resetAdminExistsCache', () => {
    it('should reset the cache so next call queries DB', async () => {
      const db = createMockDb({ adminExists: true })

      // First call - queries DB
      await checkAdminUserExists(db)
      expect(db.prepare).toHaveBeenCalledTimes(1)

      // Reset cache
      resetAdminExistsCache()

      // Next call should query DB again
      await checkAdminUserExists(db)
      expect(db.prepare).toHaveBeenCalledTimes(2)
    })
  })

  describe('isFirstUserRegistration', () => {
    it('should return true when no users exist', async () => {
      const db = createMockDb({ userCount: 0 })
      const result = await isFirstUserRegistration(db)
      expect(result).toBe(true)
    })

    it('should return false when users exist', async () => {
      const db = createMockDb({ userCount: 5 })
      const result = await isFirstUserRegistration(db)
      expect(result).toBe(false)
    })

    it('should return false on database error', async () => {
      const db = createMockDb({ shouldThrow: true })
      const result = await isFirstUserRegistration(db)
      expect(result).toBe(false)
    })
  })

  describe('isRegistrationEnabled', () => {
    it('should return true when registration is enabled', async () => {
      const db = createMockDb({ registrationEnabled: true })
      const result = await isRegistrationEnabled(db)
      expect(result).toBe(true)
    })

    it('should return false when registration is disabled', async () => {
      const db = createMockDb({ registrationEnabled: false })
      const result = await isRegistrationEnabled(db)
      expect(result).toBe(false)
    })

    it('should return true on database error (default)', async () => {
      const db = createMockDb({ shouldThrow: true })
      const result = await isRegistrationEnabled(db)
      expect(result).toBe(true)
    })
  })
})
