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

// Telemetry Utilities
export {
  generateInstallationId,
  generateProjectId,
  sanitizeErrorMessage,
  sanitizeRoute
} from './telemetry-id'

export {
  getTelemetryConfig,
  isTelemetryEnabled,
  shouldSkipEvent,
  DEFAULT_TELEMETRY_CONFIG
} from './telemetry-config'
