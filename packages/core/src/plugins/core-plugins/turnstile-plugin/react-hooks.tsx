/**
 * React Hooks for Turnstile Integration
 * 
 * These hooks make it easy to integrate Turnstile in React applications.
 * Install: npm install react
 */

import * as React from 'react'
import type { TurnstileConfig } from './headless-helpers'
import { getTurnstileConfig, renderTurnstile, removeTurnstile, resetTurnstile } from './headless-helpers'

/**
 * React Hook for Turnstile integration
 * 
 * @param formId - Form ID or name
 * @returns Turnstile state and components
 * 
 * @example
 * ```tsx
 * function ContactForm() {
 *   const { turnstileToken, TurnstileWidget, isEnabled, isReady } = useTurnstile('contact-form')
 *   const [formData, setFormData] = useState({ name: '', email: '' })
 * 
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault()
 *     
 *     const payload = {
 *       data: {
 *         ...formData,
 *         ...(isEnabled && { turnstile: turnstileToken })
 *       }
 *     }
 * 
 *     const response = await fetch('/api/forms/contact-form/submit', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(payload)
 *     })
 * 
 *     if (response.ok) {
 *       alert('Form submitted!')
 *     }
 *   }
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input 
 *         name="name" 
 *         value={formData.name}
 *         onChange={(e) => setFormData({...formData, name: e.target.value})}
 *       />
 *       <input 
 *         name="email" 
 *         value={formData.email}
 *         onChange={(e) => setFormData({...formData, email: e.target.value})}
 *       />
 *       
 *       <TurnstileWidget />
 *       
 *       <button type="submit" disabled={isEnabled && !isReady}>
 *         Submit
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useTurnstile(formId: string) {
  const [config, setConfig] = React.useState<TurnstileConfig | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const widgetRef = React.useRef<HTMLDivElement>(null)
  const widgetId = React.useRef<string | null>(null)

  // Fetch config on mount
  React.useEffect(() => {
    setIsLoading(true)
    getTurnstileConfig(formId)
      .then((cfg) => {
        setConfig(cfg)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch Turnstile config:', err)
        setError('Failed to load security verification')
        setIsLoading(false)
      })
  }, [formId])

  // Render widget when config is loaded and element is ready
  React.useEffect(() => {
    if (config?.enabled && widgetRef.current && !widgetId.current) {
      renderTurnstile(
        widgetRef.current,
        config,
        (newToken) => {
          setToken(newToken)
          setError(null)
        },
        () => {
          setToken(null)
          setError('Security verification failed')
        }
      ).then((id) => {
        widgetId.current = id
      })
    }

    // Cleanup on unmount
    return () => {
      if (widgetId.current) {
        removeTurnstile(widgetId.current)
        widgetId.current = null
      }
    }
  }, [config])

  /**
   * Reset the Turnstile widget (useful after form submission)
   */
  const reset = React.useCallback(() => {
    if (widgetId.current) {
      resetTurnstile(widgetId.current)
      setToken(null)
      setError(null)
    }
  }, [])

  /**
   * Turnstile Widget Component
   * Renders the Turnstile widget if enabled
   */
  const TurnstileWidget = React.useCallback(() => {
    if (!config?.enabled) return null
    
    return (
      <div className="turnstile-container">
        <div ref={widgetRef} className="turnstile-widget" />
        {error && (
          <div className="turnstile-error" style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {error}
          </div>
        )}
      </div>
    )
  }, [config, error])

  return {
    /** Turnstile configuration */
    config,
    
    /** Current verification token (include in form submission) */
    turnstileToken: token,
    
    /** Whether Turnstile is enabled for this form */
    isEnabled: config?.enabled || false,
    
    /** Whether Turnstile is ready (token received) */
    isReady: Boolean(token),
    
    /** Whether config is still loading */
    isLoading,
    
    /** Any error that occurred */
    error,
    
    /** Reset the widget */
    reset,
    
    /** Turnstile Widget Component */
    TurnstileWidget,
  }
}

/**
 * Simple Turnstile component (no hooks)
 * Use this if you prefer a component-based API
 * 
 * @example
 * ```tsx
 * <Turnstile
 *   formId="contact-form"
 *   onToken={(token) => setTurnstileToken(token)}
 *   onError={() => setTurnstileToken(null)}
 * />
 * ```
 */
export interface TurnstileProps {
  /** Form ID or name */
  formId: string
  
  /** Callback when token is received */
  onToken: (token: string) => void
  
  /** Callback when error occurs */
  onError?: () => void
  
  /** Additional CSS class */
  className?: string
}

export function Turnstile({ formId, onToken, onError, className }: TurnstileProps) {
  const { TurnstileWidget, isLoading, turnstileToken } = useTurnstile(formId)
  
  React.useEffect(() => {
    if (turnstileToken) {
      onToken(turnstileToken)
    }
  }, [turnstileToken, onToken])
  
  if (isLoading) {
    return <div className={className}>Loading security verification...</div>
  }
  
  return <div className={className}><TurnstileWidget /></div>
}
