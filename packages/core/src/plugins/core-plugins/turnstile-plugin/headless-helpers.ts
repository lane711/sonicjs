/**
 * Turnstile Headless Integration Helpers
 * 
 * Use these helpers in your React, Vue, or Angular applications
 * to integrate Cloudflare Turnstile with SonicJS forms.
 * 
 * @module headless-helpers
 * @clientside
 */

/// <reference lib="dom" />

export interface TurnstileConfig {
  enabled: boolean
  siteKey?: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  mode?: 'managed' | 'non-interactive' | 'invisible'
  appearance?: 'always' | 'execute' | 'interaction-only'
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: any) => string
      remove: (widgetId: string) => void
      reset: (widgetId: string) => void
      getResponse: (widgetId: string) => string
    }
  }
}

/**
 * Get Turnstile configuration for a form
 * Use this in your headless frontend to determine if Turnstile is needed
 * 
 * @param formId - Form ID or name
 * @returns Turnstile configuration or null if disabled
 * 
 * @example
 * ```typescript
 * const config = await getTurnstileConfig('contact-form')
 * if (config.enabled) {
 *   // Render Turnstile widget
 * }
 * ```
 */
export async function getTurnstileConfig(formId: string): Promise<TurnstileConfig | null> {
  try {
    const response = await fetch(`/api/forms/${formId}/turnstile-config`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Error fetching Turnstile config:', error)
    return null
  }
}

/**
 * Load Turnstile script if not already loaded
 * @internal
 */
function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile script'))
    document.head.appendChild(script)
  })
}

/**
 * Render Turnstile widget in a DOM element
 * Use this in React/Vue/Angular after mounting your form component
 * 
 * @param element - DOM element to render widget in
 * @param config - Turnstile configuration
 * @param onSuccess - Callback when verification succeeds
 * @param onError - Callback when verification fails or expires
 * @returns Widget ID (use for cleanup)
 * 
 * @example
 * ```typescript
 * const widgetId = await renderTurnstile(
 *   document.getElementById('turnstile'),
 *   config,
 *   (token) => setTurnstileToken(token),
 *   () => setTurnstileToken(null)
 * )
 * 
 * // Later, cleanup:
 * window.turnstile?.remove(widgetId)
 * ```
 */
export async function renderTurnstile(
  element: HTMLElement,
  config: TurnstileConfig,
  onSuccess: (token: string) => void,
  onError?: () => void
): Promise<string | null> {
  if (!config.enabled || !config.siteKey) return null

  try {
    await loadTurnstileScript()

    if (!window.turnstile) {
      throw new Error('Turnstile script failed to load')
    }

    const widgetId = window.turnstile.render(element, {
      sitekey: config.siteKey,
      theme: config.theme || 'auto',
      size: config.size || 'normal',
      mode: config.mode || 'managed',
      appearance: config.appearance || 'always',
      callback: onSuccess,
      'error-callback': onError,
      'expired-callback': onError
    })

    return widgetId
  } catch (error) {
    console.error('Error rendering Turnstile:', error)
    return null
  }
}

/**
 * Reset Turnstile widget (useful after submission)
 * 
 * @param widgetId - Widget ID from renderTurnstile
 * 
 * @example
 * ```typescript
 * // After form submission
 * resetTurnstile(widgetId)
 * ```
 */
export function resetTurnstile(widgetId: string): void {
  if (window.turnstile) {
    window.turnstile.reset(widgetId)
  }
}

/**
 * Remove Turnstile widget (cleanup on unmount)
 * 
 * @param widgetId - Widget ID from renderTurnstile
 * 
 * @example
 * ```typescript
 * // In React useEffect cleanup
 * useEffect(() => {
 *   return () => removeTurnstile(widgetId)
 * }, [widgetId])
 * ```
 */
export function removeTurnstile(widgetId: string): void {
  if (window.turnstile) {
    window.turnstile.remove(widgetId)
  }
}

/**
 * Get current Turnstile response token
 * 
 * @param widgetId - Widget ID from renderTurnstile
 * @returns Current token or empty string
 */
export function getTurnstileResponse(widgetId: string): string {
  if (window.turnstile) {
    return window.turnstile.getResponse(widgetId)
  }
  return ''
}
