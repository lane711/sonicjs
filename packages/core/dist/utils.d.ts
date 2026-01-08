export { c as FilterCondition, d as FilterGroup, F as FilterOperator, f as QueryFilter, Q as QueryFilterBuilder, g as QueryResult, S as SONICJS_VERSION, T as TemplateRenderer, b as buildQuery, e as escapeHtml, h as getCoreVersion, m as metricsTracker, r as renderTemplate, s as sanitizeInput, a as sanitizeObject, t as templateRenderer } from './version-BaJZ9Z1J.js';
import { b as TelemetryConfig } from './telemetry-UiD1i9GS.js';

/**
 * Telemetry ID Utilities
 *
 * Generates and manages anonymous installation IDs
 */
/**
 * Generate a new anonymous installation ID
 * Uses globalThis.crypto for Cloudflare Workers compatibility
 */
declare function generateInstallationId(): string;
/**
 * Generate a project-specific ID from project name
 * Uses a simple hash to anonymize while maintaining consistency
 */
declare function generateProjectId(projectName: string): string;
/**
 * Sanitize error messages to remove any potential PII
 */
declare function sanitizeErrorMessage(error: Error | string): string;
/**
 * Sanitize route to remove any user-specific data
 */
declare function sanitizeRoute(route: string): string;

/**
 * Telemetry Configuration Utilities
 *
 * Manages telemetry settings and opt-out mechanisms
 */

/**
 * Get default telemetry configuration
 * Uses lazy evaluation to avoid accessing process.env at module load time
 */
declare function getDefaultTelemetryConfig(): TelemetryConfig;
/**
 * Check if telemetry is enabled via environment variables
 */
declare function isTelemetryEnabled(): boolean;
/**
 * Get telemetry configuration from environment
 */
declare function getTelemetryConfig(): TelemetryConfig;
/**
 * Check if telemetry should be skipped for this event
 * Used to implement sampling or rate limiting if needed
 */
declare function shouldSkipEvent(eventName: string, sampleRate?: number): boolean;

export { generateInstallationId, generateProjectId, getDefaultTelemetryConfig, getTelemetryConfig, isTelemetryEnabled, sanitizeErrorMessage, sanitizeRoute, shouldSkipEvent };
