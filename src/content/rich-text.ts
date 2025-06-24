// Markdown editor configuration and utilities
export interface MarkdownConfig {
  toolbar?: string[]
  height?: number
  autosave?: {
    enabled: boolean
    delay?: number
    uniqueId: string
  }
  spellChecker?: boolean
  status?: string[] | false
  placeholder?: string
  imageUploadUrl?: string
  maxImageSize?: number
  allowedImageTypes?: string[]
}

// Default EasyMDE configuration
export const defaultMarkdownConfig: MarkdownConfig = {
  toolbar: [
    'bold', 'italic', 'strikethrough', '|',
    'heading', 'heading-smaller', 'heading-bigger', '|',
    'code', 'quote', 'unordered-list', 'ordered-list', '|',
    'link', 'image', 'table', '|',
    'preview', 'side-by-side', 'fullscreen', '|',
    'guide'
  ],
  height: 400,
  autosave: {
    enabled: true,
    delay: 1000,
    uniqueId: 'default-markdown-editor'
  },
  spellChecker: false,
  status: ['autosave', 'lines', 'words', 'cursor'],
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}

// Minimal editor configuration for simple text
export const minimalMarkdownConfig: MarkdownConfig = {
  toolbar: ['bold', 'italic', '|', 'link', '|', 'preview'],
  height: 200,
  spellChecker: false,
  status: false
}

// Blog editor configuration
export const blogMarkdownConfig: MarkdownConfig = {
  toolbar: [
    'bold', 'italic', 'strikethrough', '|',
    'heading', 'heading-smaller', 'heading-bigger', '|',
    'quote', 'unordered-list', 'ordered-list', '|',
    'link', 'image', '|',
    'preview', 'side-by-side', 'fullscreen'
  ],
  height: 500,
  autosave: {
    enabled: true,
    delay: 1000,
    uniqueId: 'blog-markdown-editor'
  },
  spellChecker: true,
  status: ['autosave', 'lines', 'words']
}

// Markdown processing utilities
export class MarkdownProcessor {
  // Extract plain text from Markdown
  static extractText(markdown: string): string {
    return markdown
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove blockquotes
      .replace(/^>\s+/gm, '')
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      .trim()
  }

  // Generate excerpt from markdown content
  static generateExcerpt(markdown: string, maxLength: number = 160): string {
    const text = this.extractText(markdown)
    if (text.length <= maxLength) return text
    
    const trimmed = text.substring(0, maxLength)
    const lastSpace = trimmed.lastIndexOf(' ')
    
    return lastSpace > 0 ? trimmed.substring(0, lastSpace) + '...' : trimmed + '...'
  }

  // Count words in markdown content
  static countWords(markdown: string): number {
    const text = this.extractText(markdown)
    return text.split(/\s+/).filter(word => word.length > 0).length
  }

  // Estimate reading time (assumes 200 words per minute)
  static estimateReadingTime(markdown: string): number {
    const wordCount = this.countWords(markdown)
    return Math.ceil(wordCount / 200)
  }

  // Extract all images from markdown content
  static extractImages(markdown: string): Array<{ alt: string; url: string }> {
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
    const images: Array<{ alt: string; url: string }> = []
    let match
    
    while ((match = imgRegex.exec(markdown)) !== null) {
      images.push({
        alt: match[1] || '',
        url: match[2] || ''
      })
    }
    
    return images
  }

  // Extract all links from markdown content
  static extractLinks(markdown: string): Array<{ url: string; text: string }> {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const links: Array<{ url: string; text: string }> = []
    let match
    
    while ((match = linkRegex.exec(markdown)) !== null) {
      links.push({
        text: match[1] || '',
        url: match[2] || ''
      })
    }
    
    return links
  }

  // Generate table of contents from markdown headings
  static generateTableOfContents(markdown: string): Array<{ level: number; text: string; id: string }> {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const toc: Array<{ level: number; text: string; id: string }> = []
    let match
    
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1]?.length || 1
      const text = match[2]?.trim() || ''
      const id = text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      toc.push({ level, text, id })
    }
    
    return toc
  }

  // Convert markdown to HTML (basic implementation)
  static toHTML(markdown: string): string {
    return markdown
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold/Italic
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      // Line breaks
      .replace(/\n/g, '<br>')
  }

  // Sanitize markdown content
  static sanitize(markdown: string): string {
    // Remove potentially dangerous content
    return markdown
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }
}

// Markdown field component for forms
export function generateMarkdownHTML(fieldName: string, value: string = '', config: MarkdownConfig = defaultMarkdownConfig): string {
  const uniqueId = `${fieldName}-${Date.now()}`
  
  return `
    <div class="markdown-field">
      <textarea id="${uniqueId}" name="${fieldName}">${value}</textarea>
      <script>
        if (typeof EasyMDE !== 'undefined') {
          new EasyMDE({
            element: document.getElementById('${uniqueId}'),
            toolbar: ${JSON.stringify(config.toolbar)},
            ${config.height ? `minHeight: '${config.height}px',` : ''}
            ${config.placeholder ? `placeholder: '${config.placeholder}',` : ''}
            ${config.spellChecker !== undefined ? `spellChecker: ${config.spellChecker},` : ''}
            ${config.status ? `status: ${JSON.stringify(config.status)},` : 'status: false,'}
            ${config.autosave ? `autosave: {
              enabled: ${config.autosave.enabled},
              uniqueId: '${config.autosave.uniqueId || uniqueId}',
              delay: ${config.autosave.delay || 1000}
            },` : ''}
            renderingConfig: {
              singleLineBreaks: false,
              codeSyntaxHighlighting: true
            }
          });
        } else {
          console.warn('EasyMDE not loaded. Please include EasyMDE library.');
        }
      </script>
    </div>
  `
}