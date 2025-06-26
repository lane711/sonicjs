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
    // Handle simple variables {{variable}}
    let rendered = template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const trimmed = variable.trim()
      
      // Handle triple braces for raw HTML {{{variable}}}
      if (match.startsWith('{{{') && match.endsWith('}}}')) {
        return this.getNestedValue(data, trimmed) || ''
      }
      
      // Handle conditionals {{#if condition}}
      if (trimmed.startsWith('#if ')) {
        return '' // Will be handled by the #if processor
      }
      
      // Handle each loops {{#each array}}
      if (trimmed.startsWith('#each ')) {
        return '' // Will be handled by the #each processor
      }
      
      // Regular variable substitution
      const value = this.getNestedValue(data, trimmed)
      return value !== undefined ? String(value) : ''
    })

    // Handle triple braces for raw HTML {{{variable}}}
    rendered = rendered.replace(/\{\{\{([^}]+)\}\}\}/g, (match, variable) => {
      const value = this.getNestedValue(data, variable.trim())
      return value !== undefined ? String(value) : ''
    })

    // Handle #if conditionals
    rendered = rendered.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      const value = this.getNestedValue(data, condition.trim())
      return value ? content : ''
    })

    // Handle #each loops
    rendered = rendered.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
      const array = this.getNestedValue(data, arrayName.trim())
      if (!Array.isArray(array)) return ''
      
      return array.map((item, index) => {
        // Create context with array item and special variables
        const itemContext = {
          ...data,
          ...item,
          '@index': index,
          '@first': index === 0,
          '@last': index === array.length - 1
        }
        return this.renderTemplate(content, itemContext)
      }).join('')
    })

    return rendered
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * Render a template string with data
   */
  render(template: string, data: TemplateData = {}): string {
    // Add helper functions to data
    const templateData = {
      ...data,
      titleCase: (str: string) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    
    return this.renderTemplate(template, templateData)
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
  const renderer = new TemplateRenderer()
  return renderer['renderTemplate'](template, data)
}