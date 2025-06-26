/**
 * Core Plugins Export
 * 
 * Exports all core SonicJS plugins
 */

export { authPlugin, createAuthPlugin } from './auth-plugin'
export { mediaPlugin, createMediaPlugin } from './media-plugin'
export { analyticsPlugin, createAnalyticsPlugin } from './analytics-plugin'
export { faqPlugin, createFAQPlugin } from './faq-plugin'

// Core plugins array for easy registration
export const corePlugins = [
  'core-auth',
  'core-media', 
  'core-analytics',
  'core-faq'
] as const

export type CorePluginNames = typeof corePlugins[number]