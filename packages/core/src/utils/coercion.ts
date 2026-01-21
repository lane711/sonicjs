/**
 * Type Coercion Utilities
 *
 * Shared utilities for converting values between types
 */

/**
 * Converts a value to a boolean.
 * Handles common truthy representations from form data, database values, and configuration.
 *
 * @param value - The value to convert to boolean
 * @returns true if the value is truthy (1, true, 'true', 'on'), false otherwise
 *
 * @example
 * ```typescript
 * toBoolean(1)         // true
 * toBoolean(true)      // true
 * toBoolean('true')    // true
 * toBoolean('on')      // true
 * toBoolean(0)         // false
 * toBoolean(false)     // false
 * toBoolean('false')   // false
 * toBoolean('off')     // false
 * toBoolean(null)      // false
 * toBoolean(undefined) // false
 * ```
 */
export function toBoolean(value: unknown): boolean {
  return value === 1 || value === true || value === 'true' || value === 'on'
}
