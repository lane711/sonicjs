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
    <!-- MDXEditor React and Dependencies -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

    <!-- MDXEditor CSS -->
    <link rel="stylesheet" href="https://unpkg.com/@mdxeditor/editor@latest/dist/style.css">

    <!-- MDXEditor Library -->
    <script src="https://unpkg.com/@mdxeditor/editor@latest/dist/index.umd.js"></script>
  `
}

/**
 * Get MDXEditor initialization script
 * @param config - Optional configuration object
 * @returns JavaScript initialization code
 */
export function getMDXEditorInitScript(config?: {
  theme?: string
  defaultHeight?: number
  toolbar?: string
  placeholder?: string
}): string {
  const theme = config?.theme || 'dark'
  const defaultHeight = config?.defaultHeight || 400
  const toolbar = config?.toolbar || 'full'
  const placeholder = config?.placeholder || 'Start writing your content...'

  return `
    // Initialize MDXEditor for all richtext fields
    function initializeMDXEditor() {
      if (typeof MDXEditor === 'undefined') {
        console.warn('MDXEditor not loaded yet, retrying...');
        setTimeout(initializeMDXEditor, 100);
        return;
      }

      // Find all textareas that need MDXEditor
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
        const editorTheme = '${theme}';

        // Hide the original textarea
        textarea.style.display = 'none';

        // Create MDXEditor container
        const editorContainer = document.createElement('div');
        editorContainer.className = 'mdxeditor-wrapper';
        editorContainer.style.minHeight = height + 'px';
        editorContainer.dataset.theme = editorTheme;
        textarea.parentNode.insertBefore(editorContainer, textarea.nextSibling);

        // Get initial content
        const initialContent = textarea.value || '';

        // Initialize MDXEditor
        try {
          const { MDXEditor: Editor, headingsPlugin, listsPlugin, quotePlugin,
                  thematicBreakPlugin, markdownShortcutPlugin, linkPlugin,
                  linkDialogPlugin, imagePlugin, tablePlugin, codeBlockPlugin,
                  codeMirrorPlugin, diffSourcePlugin, toolbarPlugin,
                  UndoRedo, BoldItalicUnderlineToggles, CodeToggle,
                  ListsToggle, BlockTypeSelect, CreateLink, InsertImage,
                  InsertTable, InsertCodeBlock } = window.MDXEditor;

          // Configure plugins based on toolbar setting
          let plugins = [
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin(),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
            codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', html: 'HTML', ts: 'TypeScript', python: 'Python' } })
          ];

          // Add toolbar plugin based on setting
          if (editorToolbar === 'full') {
            plugins.push(
              toolbarPlugin({
                toolbarContents: () => (
                  window.React.createElement('div', { className: 'mdx-toolbar' },
                    window.React.createElement(UndoRedo, null),
                    window.React.createElement(BoldItalicUnderlineToggles, null),
                    window.React.createElement(CodeToggle, null),
                    window.React.createElement(BlockTypeSelect, null),
                    window.React.createElement(CreateLink, null),
                    window.React.createElement(InsertImage, null),
                    window.React.createElement(ListsToggle, null),
                    window.React.createElement(InsertTable, null),
                    window.React.createElement(InsertCodeBlock, null)
                  )
                )
              })
            );
          } else if (editorToolbar === 'simple') {
            plugins.push(
              toolbarPlugin({
                toolbarContents: () => (
                  window.React.createElement('div', { className: 'mdx-toolbar' },
                    window.React.createElement(BoldItalicUnderlineToggles, null),
                    window.React.createElement(ListsToggle, null),
                    window.React.createElement(CreateLink, null)
                  )
                )
              })
            );
          }

          // Create and render MDXEditor
          const editor = window.React.createElement(Editor, {
            markdown: initialContent,
            plugins: plugins,
            placeholder: '${placeholder}',
            className: editorTheme === 'dark' ? 'dark-theme' : 'light-theme',
            onChange: (markdown) => {
              // Update the hidden textarea with the markdown content
              textarea.value = markdown;
              // Trigger change event for form validation
              textarea.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });

          // Render to DOM
          const root = ReactDOM.createRoot(editorContainer);
          root.render(editor);

          console.log('MDXEditor initialized for field:', textarea.id);
        } catch (error) {
          console.error('Error initializing MDXEditor:', error);
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
