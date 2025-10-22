/**
 * Utils Module Exports
 *
 * Utility functions for SonicJS
 */

// HTML Sanitization Utilities
export { escapeHtml, sanitizeInput, sanitizeObject } from './sanitize'

// Template Rendering
export { TemplateRenderer, templateRenderer, renderTemplate } from './template-renderer'

// Query Filter Builder
export {
  QueryFilterBuilder,
  buildQuery,
  type FilterOperator,
  type FilterCondition,
  type FilterGroup,
  type QueryFilter,
  type QueryResult
} from './query-filter'

// Metrics Tracking
export { metricsTracker } from './metrics'

// Version Info
export { SONICJS_VERSION, getCoreVersion } from './version'
