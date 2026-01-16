import type { TurnstileSettings } from '../services/turnstile'

/**
 * Escape HTML attribute values to prevent XSS
 */
function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Generate Turnstile widget HTML
 * @param settings - Turnstile settings from database
 * @param containerId - Optional custom container ID (default: 'turnstile-widget')
 * @returns HTML string for Turnstile widget
 */
export function renderTurnstileWidget(
  settings: TurnstileSettings, 
  containerId: string = 'turnstile-widget'
): string {
  if (!settings.enabled || !settings.siteKey) {
    return ''
  }

  const theme = settings.theme || 'auto'
  const size = settings.size || 'normal'
  const mode = settings.mode || 'managed'
  const appearance = settings.appearance || 'always'

  return `
    <!-- Cloudflare Turnstile Widget -->
    <div
      id="${escapeHtmlAttr(containerId)}"
      class="cf-turnstile"
      data-sitekey="${escapeHtmlAttr(settings.siteKey)}"
      data-theme="${escapeHtmlAttr(theme)}"
      data-size="${escapeHtmlAttr(size)}"
      data-action="submit"
      data-appearance="${escapeHtmlAttr(appearance)}"
      ${mode !== 'managed' ? `data-execution="${escapeHtmlAttr(mode)}"` : ''}
      data-callback="onTurnstileSuccess"
      data-error-callback="onTurnstileError"
    ></div>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <script>
      window.onTurnstileSuccess = function(token) {
        console.log('Turnstile verification successful');
      };
      
      window.onTurnstileError = function(error) {
        console.error('Turnstile error:', error);
      };
    </script>
  `
}

/**
 * Generate inline widget (renders immediately)
 */
export function renderInlineTurnstile(siteKey: string, options?: {
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  containerId?: string
}): string {
  const theme = options?.theme || 'auto'
  const size = options?.size || 'normal'
  const containerId = options?.containerId || 'turnstile-widget'

  return `
    <div
      id="${escapeHtmlAttr(containerId)}"
      class="cf-turnstile mb-3"
      data-sitekey="${escapeHtmlAttr(siteKey)}"
      data-theme="${escapeHtmlAttr(theme)}"
      data-size="${escapeHtmlAttr(size)}"
    ></div>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  `
}

/**
 * Get Turnstile script tag only (for manual rendering)
 */
export function getTurnstileScript(): string {
  return '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>'
}

/**
 * Generate explicit rendering JavaScript
 */
export function renderExplicitTurnstile(siteKey: string, options?: {
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  containerId?: string
  callback?: string
}): string {
  const theme = options?.theme || 'auto'
  const size = options?.size || 'normal'
  const containerId = options?.containerId || 'turnstile-widget'
  const callback = options?.callback || 'onTurnstileSuccess'

  // Validate callback name to prevent code injection (only allow valid JS identifiers)
  const safeCallback = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(callback) ? callback : 'onTurnstileSuccess'

  return `
    <div id="${escapeHtmlAttr(containerId)}"></div>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
    <script>
      window.onloadTurnstileCallback = function() {
        turnstile.render(${JSON.stringify('#' + containerId)}, {
          sitekey: ${JSON.stringify(siteKey)},
          theme: ${JSON.stringify(theme)},
          size: ${JSON.stringify(size)},
          callback: function(token) {
            window.${safeCallback}?.(token);
          }
        });
      };
    </script>
  `
}
