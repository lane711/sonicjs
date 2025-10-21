/**
 * Routes Module Exports
 *
 * Routes are being migrated incrementally from the monolith.
 * Each route is refactored to remove monolith-specific dependencies.
 */

// API routes
export { default as apiRoutes } from './api'
export { default as apiContentCrudRoutes } from './api-content-crud'
export { default as apiMediaRoutes } from './api-media'
export { default as apiSystemRoutes } from './api-system'
export { default as adminApiRoutes } from './admin-api'

// Auth routes
export { default as authRoutes } from './auth'

// Admin UI routes
export { default as adminContentRoutes } from './admin-content'

export const ROUTES_INFO = {
  message: 'Routes migration in progress',
  available: [
    'apiRoutes',
    'apiContentCrudRoutes',
    'apiMediaRoutes',
    'apiSystemRoutes',
    'adminApiRoutes',
    'authRoutes',
    'adminContentRoutes'
  ],
  status: 'Routes are being added incrementally',
  reference: 'https://github.com/sonicjs/sonicjs'
} as const
