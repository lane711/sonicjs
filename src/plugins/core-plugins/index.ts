/**
 * Core Plugins Export
 * 
 * Exports all core SonicJS plugins
 */

export { authPlugin, createAuthPlugin } from './auth-plugin'
export { mediaPlugin, createMediaPlugin } from './media-plugin'
export { analyticsPlugin, createAnalyticsPlugin } from './analytics-plugin'
export { faqPlugin, createFAQPlugin } from './faq-plugin'
export { testimonialsPlugin, createTestimonialPlugin } from './testimonials-plugin'
export { demoLoginPlugin } from './demo-login-plugin'
export { workflowPlugin, createWorkflowPlugin } from './workflow-plugin'
export { seedDataPlugin, createSeedDataPlugin } from './seed-data-plugin'

// Core plugins array for easy registration
export const corePlugins = [
  'core-auth',
  'core-media',
  'core-analytics',
  'core-faq',
  'testimonials-plugin',
  'demo-login-prefill',
  'workflow-plugin',
  'cache',
  'seed-data'
] as const

export type CorePluginNames = typeof corePlugins[number]