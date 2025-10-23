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
export { userRoutes as adminUsersRoutes } from './admin-users'
export { adminMediaRoutes } from './admin-media'
export { adminPluginRoutes } from './admin-plugins'
export { adminLogsRoutes } from './admin-logs'
export { adminDesignRoutes } from './admin-design'
export { adminCheckboxRoutes } from './admin-checkboxes'
export { default as adminFAQRoutes } from './admin-faq'
export { default as adminTestimonialsRoutes } from './admin-testimonials'
export { default as adminCodeExamplesRoutes } from './admin-code-examples'
export { adminDashboardRoutes } from './admin-dashboard'
export { adminCollectionsRoutes } from './admin-collections'
export { adminSettingsRoutes } from './admin-settings'

export const ROUTES_INFO = {
  message: 'Core routes available',
  available: [
    'apiRoutes',
    'apiContentCrudRoutes',
    'apiMediaRoutes',
    'apiSystemRoutes',
    'adminApiRoutes',
    'authRoutes',
    'adminContentRoutes',
    'adminUsersRoutes',
    'adminMediaRoutes',
    'adminPluginRoutes',
    'adminLogsRoutes',
    'adminDesignRoutes',
    'adminCheckboxRoutes',
    'adminFAQRoutes',
    'adminTestimonialsRoutes',
    'adminCodeExamplesRoutes',
    'adminDashboardRoutes',
    'adminCollectionsRoutes',
    'adminSettingsRoutes'
  ],
  status: 'Core package routes ready',
  reference: 'https://github.com/sonicjs/sonicjs'
} as const
