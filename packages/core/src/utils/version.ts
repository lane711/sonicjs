/**
 * Version utility
 *
 * Provides the current version of @sonicjs-cms/core package
 */

// This will be replaced at build time by tsup with the actual version
export const SONICJS_VERSION = '2.0.0-beta.2'

/**
 * Get the current SonicJS core version
 */
export function getCoreVersion(): string {
  return SONICJS_VERSION
}
