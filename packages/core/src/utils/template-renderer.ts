// Template renderer compatible with Cloudflare Workers
// No filesystem access available

interface TemplateData {
  [key: string]: any
}

export class TemplateRenderer {
  private templateCache = new Map<string, string>()

  constructor() {
    // Cloudflare Workers compatible - no filesystem access
  }

  /**
   * Simple Handlebars-like template engine
   */
  private renderTemplate(template: string, data: TemplateData): string {
    let rendered = template

    // Handle each loops - process outermost loops first for proper nesting
    rendered = rendered.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_match, arrayName, content) => {
      const array = this.getNestedValue(data, arrayName.trim())
      if (!Array.isArray(array)) return ''
      
      return array.map((item, index) => {
        // Create context with array item and special variables
        const itemContext = {
          ...data,
          // Handle primitive items (for {{.}} syntax)
          '.': item,
          // Spread item properties if it's an object
          ...(typeof item === 'object' && item !== null ? item : {}),
          '@index': index,
          '@first': index === 0,
          '@last': index === array.length - 1
        }
        return this.renderTemplate(content, itemContext)
      }).join('')
    })

    // Second pass: Handle conditionals
    let ifCount = 0
    while (rendered.includes('{{#if ') && ifCount < 100) {
      const previousRendered = rendered
      rendered = rendered.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, condition, content) => {
        const value = this.getNestedValue(data, condition.trim())
        // Handle boolean values properly - @first/@last are explicitly boolean
        const isTruthy = value === true || (value && value !== 0 && value !== '' && value !== null && value !== undefined)
        return isTruthy ? this.renderTemplate(content, data) : ''
      })
      if (previousRendered === rendered) break
      ifCount++
    }

    // Third pass: Handle triple braces for raw HTML {{{variable}}}
    rendered = rendered.replace(/\{\{\{([^}]+)\}\}\}/g, (_match, variable) => {
      const value = this.getNestedValue(data, variable.trim())
      return value !== undefined && value !== null ? String(value) : ''
    })

    // Fourth pass: Handle helper functions like {{titleCase field}}
    rendered = rendered.replace(/\{\{([^}#\/]+)\s+([^}]+)\}\}/g, (match, helper, variable) => {
      const helperName = helper.trim()
      const varName = variable.trim()
      
      if (helperName === 'titleCase') {
        const value = this.getNestedValue(data, varName)
        if (value !== undefined && value !== null) {
          return this.titleCase(String(value))
        }
      }
      
      return match // Return original if helper not found
    })

    // Final pass: Handle simple variables {{variable}}
    rendered = rendered.replace(/\{\{([^}#\/]+)\}\}/g, (match, variable) => {
      const trimmed = variable.trim()
      
      // Skip if it's a helper function (has spaces)
      if (trimmed.includes(' ')) {
        return match
      }
      
      const value = this.getNestedValue(data, trimmed)
      if (value === null) return ''
      if (value === undefined) return ''
      return String(value)
    })

    return rendered
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || path === '') return undefined
    
    return path.split('.').reduce((current, key) => {
      if (current === null || current === undefined) return undefined
      return current[key]
    }, obj)
  }

  /**
   * Title case helper function
   */
  private titleCase(str: string): string {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Render a template string with data
   */
  render(template: string, data: TemplateData = {}): string {
    return this.renderTemplate(template, data)
  }

  /**
   * Clear template cache (useful for development)
   */
  clearCache(): void {
    this.templateCache.clear()
  }
}

// Export singleton instance
export const templateRenderer = new TemplateRenderer()

// Utility function to render template strings directly
export function renderTemplate(template: string, data: TemplateData = {}): string {
  return templateRenderer.render(template, data)
}