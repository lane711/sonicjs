import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'

export interface FormBuilderPageData {
  id: string
  name: string
  display_name: string
  description?: string
  category?: string
  formio_schema: any
  settings?: any
  is_active?: boolean
  is_public?: boolean
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
}

export function renderFormBuilderPage(data: FormBuilderPageData): string {
  const formioSchema = data.formio_schema || { components: [] }
  const settings = data.settings || {}

  const pageContent = `
    <style>
      /* Form.io Builder Styling to match SonicJS theme */
      .formio-builder {
        background: transparent !important;
        border: none !important;
      }

      .formio-builder .formio-component {
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 0.5rem !important;
      }

      .formio-builder-sidebar {
        background: rgba(255, 255, 255, 0.02) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      /* Hide loading spinner after Form.io loads */
      #builder-loading.hidden {
        display: none;
      }

      /* Builder container */
      #builder-container {
        min-height: 600px;
        background: var(--color-zinc-900);
        border-radius: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1rem;
      }
    </style>

    <div>
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a href="/admin/forms" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            <div>
              <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">
                Form Builder: ${data.display_name}
              </h1>
              <p class="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
                <span class="inline-flex items-center rounded-md bg-cyan-50 dark:bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300 ring-1 ring-inset ring-cyan-700/10 dark:ring-cyan-400/20">
                  ${data.name}
                </span>
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button
              id="preview-btn"
              type="button"
              class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Preview
            </button>

            <button
              id="save-btn"
              type="button"
              class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Save Form
            </button>

            <a
              href="/admin/forms/${data.id}/submissions"
              class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              View Submissions
            </a>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div id="notification-container"></div>

      <!-- Loading State -->
      <div id="builder-loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-zinc-500 dark:text-zinc-400">Loading Form Builder...</p>
        </div>
      </div>

      <!-- Form.io Builder Container -->
      <div id="builder-container" style="display: none;"></div>

      <!-- Preview Modal -->
      <div id="preview-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div class="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
            <h2 class="text-xl font-semibold text-zinc-900 dark:text-white">Form Preview</h2>
            <button
              id="close-preview-btn"
              type="button"
              class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-auto p-6">
            <div id="preview-container"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form.io CSS -->
    <link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css">

    <!-- Form.io JS -->
    <script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>

    <!-- Builder Integration Script -->
    <script>
      (function() {
        const formId = '${data.id}';
        const existingSchema = ${JSON.stringify(formioSchema)};
        let builder;
        let hasUnsavedChanges = false;

        // Initialize Form.io Builder
        async function initBuilder() {
          try {
            // Show builder container, hide loading
            document.getElementById('builder-loading').classList.add('hidden');
            document.getElementById('builder-container').style.display = 'block';

            // Create builder
            builder = await Formio.builder(
              document.getElementById('builder-container'),
              existingSchema,
              {
                builder: {
                  premium: false,
                  data: false,
                  advanced: false,
                  layout: true,
                  basic: true,
                  custom: {
                    title: 'Basic',
                    default: true,
                    weight: 0,
                    components: {}
                  }
                },
                noDefaultSubmitButton: false,
                editForm: {
                  textfield: [
                    {
                      key: 'api',
                      ignore: false
                    }
                  ]
                }
              }
            );

            // Listen for changes
            builder.instance.on('change', (schema) => {
              hasUnsavedChanges = true;
              console.log('Form schema changed');
              
              // Update save button text
              const saveBtn = document.getElementById('save-btn');
              if (saveBtn && !saveBtn.textContent.includes('*')) {
                saveBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Save Form *';
              }
            });

            console.log('Form.io Builder initialized successfully');
          } catch (error) {
            console.error('Error initializing Form.io Builder:', error);
            showNotification('Failed to initialize form builder: ' + error.message, 'error');
          }
        }

        // Save button handler
        document.getElementById('save-btn').addEventListener('click', async () => {
          if (!builder) {
            showNotification('Builder not initialized', 'error');
            return;
          }

          try {
            const schema = builder.schema;
            const saveBtn = document.getElementById('save-btn');
            
            // Disable button during save
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...';

            const response = await fetch(\`/admin/forms/\${formId}\`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                formio_schema: schema
              })
            });

            if (response.ok) {
              hasUnsavedChanges = false;
              showNotification('Form saved successfully!', 'success');
              saveBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Save Form';
            } else {
              const error = await response.json();
              showNotification('Failed to save form: ' + (error.error || 'Unknown error'), 'error');
            }
          } catch (error) {
            console.error('Save error:', error);
            showNotification('Failed to save form: ' + error.message, 'error');
          } finally {
            const saveBtn = document.getElementById('save-btn');
            saveBtn.disabled = false;
          }
        });

        // Preview button handler
        document.getElementById('preview-btn').addEventListener('click', async () => {
          if (!builder) {
            showNotification('Builder not initialized', 'error');
            return;
          }

          try {
            const schema = builder.schema;
            const modal = document.getElementById('preview-modal');
            const container = document.getElementById('preview-container');
            
            // Clear previous preview
            container.innerHTML = '';
            
            // Show modal
            modal.classList.remove('hidden');
            
            // Render form
            await Formio.createForm(container, schema);
          } catch (error) {
            console.error('Preview error:', error);
            showNotification('Failed to generate preview: ' + error.message, 'error');
          }
        });

        // Close preview modal
        document.getElementById('close-preview-btn').addEventListener('click', () => {
          document.getElementById('preview-modal').classList.add('hidden');
        });

        // Close modal on backdrop click
        document.getElementById('preview-modal').addEventListener('click', (e) => {
          if (e.target.id === 'preview-modal') {
            document.getElementById('preview-modal').classList.add('hidden');
          }
        });

        // Warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
          if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
            return '';
          }
        });

        // Show notification helper
        function showNotification(message, type = 'info') {
          const container = document.getElementById('notification-container');
          const colors = {
            success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
            error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
            info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
          };

          const notification = document.createElement('div');
          notification.className = \`mb-4 rounded-lg p-4 border \${colors[type] || colors.info}\`;
          notification.innerHTML = \`
            <div class="flex items-center">
              <svg class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm">\${message}</p>
            </div>
          \`;

          container.appendChild(notification);

          // Auto-remove after 5 seconds
          setTimeout(() => {
            notification.remove();
          }, 5000);
        }

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initBuilder);
        } else {
          initBuilder();
        }
      })();
    </script>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: `Form Builder: ${data.display_name}`,
    content: pageContent,
    user: data.user,
    version: data.version
  }

  return renderAdminLayoutCatalyst(layoutData)
}
