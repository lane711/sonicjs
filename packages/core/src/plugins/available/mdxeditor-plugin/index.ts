import { Plugin } from '../../../types/plugin'
import { PluginBuilder } from '../../sdk/plugin-builder'

/**
 * MDXEditor Rich Text Editor Plugin
 *
 * Provides MDX editing capabilities for richtext fields.
 * When active, this plugin injects the MDXEditor into all richtext field types.
 * When inactive, richtext fields fall back to plain textareas.
 */

const builder = PluginBuilder.create({
  name: 'mdxeditor-plugin',
  version: '1.0.0',
  description: 'Modern React-based MDX editor for content creation'
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
    console.info('✅ MDXEditor plugin activated')
  },
  deactivate: async () => {
    console.info('❌ MDXEditor plugin deactivated')
  }
})

const mdxeditorPlugin = builder.build() as Plugin

export default mdxeditorPlugin

/**
 * Get MDXEditor CDN script tags
 * @returns HTML script and style tags for MDXEditor
 */
export function getMDXEditorScripts(): string {
  return `
    <!-- EasyMDE Markdown Editor (simpler alternative to MDXEditor) -->
    <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
    <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
  `
}

/**
 * Get MDXEditor initialization script
 * @param config - Optional configuration object
 * @returns JavaScript initialization code
 */
export function getMDXEditorInitScript(config?: {
  defaultHeight?: number
  toolbar?: string
  placeholder?: string
}): string {
  const defaultHeight = config?.defaultHeight || 400
  const toolbar = config?.toolbar || 'full'
  const placeholder = config?.placeholder || 'Start writing your content...'

  return `
    // Initialize EasyMDE (Markdown Editor) for all richtext fields
    function initializeMDXEditor() {
      if (typeof EasyMDE === 'undefined') {
        console.warn('EasyMDE not loaded yet, retrying...');
        setTimeout(initializeMDXEditor, 100);
        return;
      }

      // Find all textareas that need EasyMDE
      document.querySelectorAll('.richtext-container textarea').forEach((textarea) => {
        // Skip if already initialized
        if (textarea.dataset.mdxeditorInitialized === 'true') {
          return;
        }

        // Mark as initialized
        textarea.dataset.mdxeditorInitialized = 'true';

        // Get configuration from data attributes
        const container = textarea.closest('.richtext-container');
        const height = container?.dataset.height || ${defaultHeight};
        const editorToolbar = container?.dataset.toolbar || '${toolbar}';

        // Initialize EasyMDE
        try {
          const toolbarButtons = editorToolbar === 'minimal'
            ? ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'preview']
            : ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', 'table', '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'];

          const easyMDE = new EasyMDE({
            element: textarea,
            placeholder: '${placeholder}',
            spellChecker: false,
            minHeight: height + 'px',
            toolbar: toolbarButtons,
            status: ['lines', 'words', 'cursor'],
            renderingConfig: {
              singleLineBreaks: false,
              codeSyntaxHighlighting: true
            }
          });

          // Store reference to editor instance
          textarea.easyMDEInstance = easyMDE;

          console.log('EasyMDE initialized for field:', textarea.id || textarea.name);
        } catch (error) {
          console.error('Error initializing EasyMDE:', error);
          // Show textarea as fallback
          textarea.style.display = 'block';
        }
      });
    }

    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeMDXEditor);
    } else {
      // DOM already loaded, initialize immediately
      initializeMDXEditor();
    }

    // Also reinitialize after HTMX swaps (for dynamic content)
    document.addEventListener('htmx:afterSwap', function(event) {
      // Give the DOM a moment to settle
      setTimeout(initializeMDXEditor, 100);
    });
  `
}

/**
 * Check if MDXEditor plugin is active
 * @param pluginService - Plugin service instance
 * @returns Promise<boolean>
 */
export async function isMDXEditorActive(pluginService: any): Promise<boolean> {
  try {
    const status = await pluginService.getPluginStatus('mdxeditor-plugin')
    return status?.is_active === true
  } catch (error) {
    console.error('Error checking MDXEditor plugin status:', error)
    return false
  }
}
