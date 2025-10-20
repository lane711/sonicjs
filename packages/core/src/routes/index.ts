/**
 * Routes Module Exports
 *
 * Routes are being migrated incrementally from the monolith.
 * Each route is refactored to remove monolith-specific dependencies.
 */

// API routes
export { default as apiRoutes } from './api'
export { default as apiContentCrudRoutes } from './api-content-crud'

export const ROUTES_INFO = {
  message: 'Routes migration in progress',
  available: [
    'apiRoutes',
    'apiContentCrudRoutes'
  ],
  status: 'Routes are being added incrementally',
  reference: 'https://github.com/sonicjs/sonicjs'
} as const
