/**
 * Version utility
 *
 * Provides the current version of @sonicjs-cms/core package
 */

import pkg from '../../package.json'

export const SONICJS_VERSION = pkg.version

/**
 * Get the current SonicJS core version
 */
export function getCoreVersion(): string {
  return SONICJS_VERSION
}
