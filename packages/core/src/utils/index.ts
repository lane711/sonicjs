/**
 * Utils Module Exports
 *
 * Utility functions for SonicJS
 */

// HTML Sanitization Utilities
export { escapeHtml, sanitizeInput, sanitizeObject } from './sanitize'

// Slug Generation Utilities
export { generateSlug } from './slug-utils'

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
  getDefaultTelemetryConfig,
  isTelemetryEnabled,
  shouldSkipEvent
} from './telemetry-config'

export { getBlocksFieldConfig, parseBlocksValue } from './blocks'
