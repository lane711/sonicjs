/**
 * Telemetry ID Utilities
 *
 * Generates and manages anonymous installation IDs
 */

import { randomUUID } from 'node:crypto'

/**
 * Generate a new anonymous installation ID
 */
export function generateInstallationId(): string {
  return randomUUID()
}

/**
 * Generate a project-specific ID from project name
 * Uses a simple hash to anonymize while maintaining consistency
 */
export function generateProjectId(projectName: string): string {
  // Simple hash function to anonymize project names
  let hash = 0
  for (let i = 0; i < projectName.length; i++) {
    const char = projectName.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `proj_${Math.abs(hash).toString(36)}`
}

/**
 * Sanitize error messages to remove any potential PII
 */
export function sanitizeErrorMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message

  // Extract error type/category only
  const errorType = message.split(':')[0].trim()

  // Remove file paths that might contain usernames
  const sanitized = errorType
    .replace(/\/Users\/[^/]+/g, '/Users/***')
    .replace(/\/home\/[^/]+/g, '/home/***')
    .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\***')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***')

  return sanitized
}

/**
 * Sanitize route to remove any user-specific data
 */
export function sanitizeRoute(route: string): string {
  return route
    // Remove UUIDs
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, ':id')
    // Remove numeric IDs
    .replace(/\/\d+/g, '/:id')
    // Remove email patterns
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ':email')
}
