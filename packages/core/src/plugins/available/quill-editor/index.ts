import { Plugin } from '../../../types/plugin'
import { PluginBuilder } from '../../sdk/plugin-builder'

/**
 * Quill Rich Text Editor Plugin
 *
 * Provides modern WYSIWYG editing capabilities for richtext fields.
 * When active, this plugin injects the Quill editor into all richtext field types.
 * When inactive, richtext fields fall back to plain textareas.
 */

const builder = PluginBuilder.create({
  name: 'quill-editor',
  version: '1.0.0',
  description: 'Modern rich text editor for content creation'
})

builder.metadata({
  author: {
    name: 'SonicJS Team',
    email: 'team@sonicjs.com'
  },
  license: 'MIT',
  compatibility: '^2.0.0'
})

builder.lifecycle({
  activate: async () => {
    console.info('✅ Quill editor plugin activated')
  },
  deactivate: async () => {
    console.info('❌ Quill editor plugin deactivated')
  }
})

const quillPlugin = builder.build() as Plugin

export default quillPlugin

/**
 * Get Quill CDN script and style tags
 * @returns HTML script and link tags for Quill CDN
 */
export function getQuillScripts(): string {
  return `
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <link href="https://cdn.quilljs.com/1.3.6/quill.bubble.css" rel="stylesheet">
    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
  `
}

/**
 * Get Quill initialization script
 * @param config - Optional configuration object
 * @returns JavaScript initialization code
 */
export function getQuillInitScript(config?: {
  theme?: string
  defaultHeight?: number
  defaultToolbar?: string
  placeholder?: string
}): string {
  const theme = config?.theme || 'snow'
  const defaultHeight = config?.defaultHeight || 300
  const placeholder = config?.placeholder || 'Start writing your content...'

  return `
    // Initialize Quill for all richtext fields
    function initializeQuill() {
      if (typeof Quill !== 'undefined') {
        // Find all textareas that need Quill
        document.querySelectorAll('.richtext-container textarea').forEach((textarea) => {
          // Skip if already initialized
          if (textarea.classList.contains('quill-initialized')) {
            return;
          }

          // Get configuration from data attributes
          const container = textarea.closest('.richtext-container');
          const height = container?.dataset.height || ${defaultHeight};
          const toolbar = container?.dataset.toolbar || 'full';

          // Create editor container
          const editorDiv = document.createElement('div');
          editorDiv.style.height = height + 'px';

          // Store original textarea value
          const initialContent = textarea.value;

          // Hide textarea and insert editor
          textarea.style.display = 'none';
          textarea.classList.add('quill-initialized');
          textarea.parentNode.insertBefore(editorDiv, textarea);

          // Configure toolbar based on setting
          let toolbarConfig;
          if (toolbar === 'simple') {
            toolbarConfig = [
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link']
            ];
          } else if (toolbar === 'minimal') {
            toolbarConfig = [
              ['bold', 'italic'],
              ['link']
            ];
          } else {
            toolbarConfig = [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'align': [] }],
              ['link', 'image', 'code-block'],
              ['clean']
            ];
          }

          // Initialize Quill
          const quill = new Quill(editorDiv, {
            theme: '${theme}',
            placeholder: '${placeholder}',
            modules: {
              toolbar: toolbarConfig
            }
          });

          // Set initial content if exists
          if (initialContent) {
            quill.clipboard.dangerouslyPasteHTML(initialContent);
          }

          // Sync content back to textarea on change
          quill.on('text-change', function() {
            textarea.value = quill.root.innerHTML;
          });

          // Sync on form submit
          const form = textarea.closest('form');
          if (form) {
            form.addEventListener('submit', function() {
              textarea.value = quill.root.innerHTML;
            });
          }
        });
      }
    }

    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeQuill);
    } else {
      // DOM already loaded, initialize immediately
      initializeQuill();
    }

    // Also reinitialize after HTMX swaps (for dynamic content)
    document.addEventListener('htmx:afterSwap', function(event) {
      // Give the DOM a moment to settle
      setTimeout(initializeQuill, 100);
    });
  `
}

/**
 * Check if Quill plugin is active
 * @param pluginService - Plugin service instance
 * @returns Promise<boolean>
 */
export async function isQuillActive(pluginService: any): Promise<boolean> {
  try {
    const status = await pluginService.getPluginStatus('quill-editor')
    return status?.is_active === true
  } catch (error) {
    console.error('Error checking Quill plugin status:', error)
    return false
  }
}
