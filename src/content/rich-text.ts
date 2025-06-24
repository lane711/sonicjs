// Rich text editor configuration and utilities
export interface RichTextConfig {
  toolbar: string[]
  plugins: string[]
  height?: number
  menubar?: boolean
  statusbar?: boolean
  branding?: boolean
  imageUploadUrl?: string
  maxImageSize?: number
  allowedImageTypes?: string[]
}

// Default TinyMCE configuration
export const defaultRichTextConfig: RichTextConfig = {
  toolbar: [
    'undo redo | blocks fontfamily fontsize',
    'bold italic underline strikethrough | link image media table mergetags',
    'align lineheight | checklist numlist bullist indent outdent',
    'emoticons charmap | removeformat | code fullscreen preview'
  ],
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
  ],
  height: 400,
  menubar: false,
  statusbar: true,
  branding: false,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}

// Minimal editor configuration for simple text
export const minimalRichTextConfig: RichTextConfig = {
  toolbar: ['bold italic underline | link | removeformat'],
  plugins: ['link'],
  height: 200,
  menubar: false,
  statusbar: false,
  branding: false
}

// Blog editor configuration
export const blogRichTextConfig: RichTextConfig = {
  toolbar: [
    'undo redo | blocks fontsize',
    'bold italic underline | link image media',
    'align | bullist numlist | outdent indent',
    'code removeformat | fullscreen preview'
  ],
  plugins: [
    'lists', 'link', 'image', 'preview', 'code', 'fullscreen',
    'media', 'table', 'help', 'wordcount'
  ],
  height: 500,
  menubar: false,
  statusbar: true,
  branding: false
}

// Rich text processing utilities
export class RichTextProcessor {
  // Clean HTML content (remove scripts, unsafe attributes, etc.)
  static sanitize(html: string): string {
    // This is a basic implementation - in production you'd want to use a proper HTML sanitizer
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/javascript:/gi, '')
      .replace(/<iframe(?![^>]*src="https:\/\/(www\.)?(youtube\.com|vimeo\.com))[^>]*>.*?<\/iframe>/gi, '')
  }

  // Extract plain text from HTML
  static extractText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  // Generate excerpt from rich text content
  static generateExcerpt(html: string, maxLength: number = 160): string {
    const text = this.extractText(html)
    if (text.length <= maxLength) return text
    
    const trimmed = text.substring(0, maxLength)
    const lastSpace = trimmed.lastIndexOf(' ')
    
    return lastSpace > 0 ? trimmed.substring(0, lastSpace) + '...' : trimmed + '...'
  }

  // Count words in rich text content
  static countWords(html: string): number {
    const text = this.extractText(html)
    return text.split(/\s+/).filter(word => word.length > 0).length
  }

  // Estimate reading time (assumes 200 words per minute)
  static estimateReadingTime(html: string): number {
    const wordCount = this.countWords(html)
    return Math.ceil(wordCount / 200)
  }

  // Extract all images from rich text content
  static extractImages(html: string): string[] {
    const imgRegex = /<img[^>]+src="([^">]+)"/gi
    const images: string[] = []
    let match
    
    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1])
    }
    
    return images
  }

  // Extract all links from rich text content
  static extractLinks(html: string): Array<{ url: string; text: string }> {
    const linkRegex = /<a[^>]+href="([^">]+)"[^>]*>(.*?)<\/a>/gi
    const links: Array<{ url: string; text: string }> = []
    let match
    
    while ((match = linkRegex.exec(html)) !== null) {
      links.push({
        url: match[1],
        text: this.extractText(match[2])
      })
    }
    
    return links
  }

  // Generate table of contents from headings
  static generateTableOfContents(html: string): Array<{ level: number; text: string; id: string }> {
    const headingRegex = /<h([1-6])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[1-6]>/gi
    const toc: Array<{ level: number; text: string; id: string }> = []
    let match
    
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1])
      const text = this.extractText(match[3])
      let id = match[2]
      
      // Generate ID if not present
      if (!id) {
        id = text.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
      }
      
      toc.push({ level, text, id })
    }
    
    return toc
  }

  // Add IDs to headings for table of contents
  static addHeadingIds(html: string): string {
    return html.replace(/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, level, attrs, content) => {
      // Check if ID already exists
      if (attrs.includes('id=')) return match
      
      const text = this.extractText(content)
      const id = text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      return `<h${level}${attrs} id="${id}">${content}</h${level}>`
    })
  }

  // Optimize images in rich text content
  static optimizeImages(html: string, baseUrl: string = ''): string {
    return html.replace(/<img([^>]*)>/gi, (match, attrs) => {
      // Add loading="lazy" if not present
      if (!attrs.includes('loading=')) {
        attrs += ' loading="lazy"'
      }
      
      // Add alt attribute if missing
      if (!attrs.includes('alt=')) {
        attrs += ' alt=""'
      }
      
      // Convert relative URLs to absolute if baseUrl provided
      if (baseUrl && attrs.includes('src="') && !attrs.includes('src="http')) {
        attrs = attrs.replace(/src="([^"]+)"/i, (srcMatch, src) => {
          if (src.startsWith('/')) {
            return `src="${baseUrl}${src}"`
          }
          return srcMatch
        })
      }
      
      return `<img${attrs}>`
    })
  }
}

// Rich text field component for forms
export function generateRichTextHTML(fieldName: string, value: string = '', config: RichTextConfig = defaultRichTextConfig): string {
  const configJson = JSON.stringify({
    selector: `#${fieldName}`,
    ...config,
    setup: `function(editor) {
      editor.on('change', function() {
        editor.save();
      });
    }`
  })

  return `
    <div class="rich-text-field">
      <textarea id="${fieldName}" name="${fieldName}">${value}</textarea>
      <script>
        if (typeof tinymce !== 'undefined') {
          tinymce.init(${configJson});
        } else {
          // Load TinyMCE if not already loaded
          const script = document.createElement('script');
          script.src = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js';
          script.onload = function() {
            tinymce.init(${configJson});
          };
          document.head.appendChild(script);
        }
      </script>
    </div>
  `
}