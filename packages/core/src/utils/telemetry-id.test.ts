/**
 * Telemetry ID Utilities Tests
 */

import { describe, it, expect } from 'vitest'
import {
  generateInstallationId,
  generateProjectId,
  sanitizeErrorMessage,
  sanitizeRoute
} from './telemetry-id'

describe('telemetry-id utilities', () => {
  describe('generateInstallationId', () => {
    it('should generate a valid UUID', () => {
      const id = generateInstallationId()
      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      // UUID v4 format
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should generate unique IDs', () => {
      const id1 = generateInstallationId()
      const id2 = generateInstallationId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateProjectId', () => {
    it('should generate a project ID', () => {
      const id = generateProjectId('test-project')
      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      expect(id).toMatch(/^proj_/)
    })

    it('should generate consistent IDs for same project', () => {
      const id1 = generateProjectId('my-project')
      const id2 = generateProjectId('my-project')
      expect(id1).toBe(id2)
    })

    it('should generate different IDs for different projects', () => {
      const id1 = generateProjectId('project-a')
      const id2 = generateProjectId('project-b')
      expect(id1).not.toBe(id2)
    })
  })

  describe('sanitizeErrorMessage', () => {
    it('should extract error type from string', () => {
      const sanitized = sanitizeErrorMessage('TypeError: Cannot read property')
      expect(sanitized).toBe('TypeError')
    })

    it('should extract error type from Error object', () => {
      const error = new Error('TypeError: Cannot read property')
      const sanitized = sanitizeErrorMessage(error)
      expect(sanitized).toBe('TypeError')
    })

    it('should extract only error type without paths', () => {
      const message = 'Error: /Users/john/project/file.js not found'
      const sanitized = sanitizeErrorMessage(message)
      expect(sanitized).toBe('Error')
      expect(sanitized).not.toContain('john')
    })

    it('should extract only error type from Linux paths', () => {
      const message = 'FileNotFoundError: /home/john/project/file.js not found'
      const sanitized = sanitizeErrorMessage(message)
      expect(sanitized).toBe('FileNotFoundError')
      expect(sanitized).not.toContain('john')
    })

    it('should extract only error type from Windows paths', () => {
      const message = 'TypeError: C:\\Users\\john\\project\\file.js invalid'
      const sanitized = sanitizeErrorMessage(message)
      expect(sanitized).toBe('TypeError')
      expect(sanitized).not.toContain('john')
    })

    it('should extract only error type without emails', () => {
      const message = 'ValidationError: user@example.com is invalid'
      const sanitized = sanitizeErrorMessage(message)
      expect(sanitized).toBe('ValidationError')
      expect(sanitized).not.toContain('user@example.com')
    })
  })

  describe('sanitizeRoute', () => {
    it('should sanitize UUID parameters', () => {
      const route = '/admin/users/550e8400-e29b-41d4-a716-446655440000'
      const sanitized = sanitizeRoute(route)
      expect(sanitized).toBe('/admin/users/:id')
    })

    it('should sanitize numeric IDs', () => {
      const route = '/admin/posts/123'
      const sanitized = sanitizeRoute(route)
      expect(sanitized).toBe('/admin/posts/:id')
    })

    it('should sanitize multiple IDs', () => {
      const route = '/admin/users/123/posts/456'
      const sanitized = sanitizeRoute(route)
      expect(sanitized).toBe('/admin/users/:id/posts/:id')
    })

    it('should sanitize email addresses in routes', () => {
      const route = '/admin/users/user@example.com'
      const sanitized = sanitizeRoute(route)
      expect(sanitized).toBe('/admin/users/:email')
    })

    it('should not modify routes without sensitive data', () => {
      const route = '/admin/dashboard'
      const sanitized = sanitizeRoute(route)
      expect(sanitized).toBe('/admin/dashboard')
    })
  })
})
