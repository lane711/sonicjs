import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderDynamicField, renderFieldGroup, FieldDefinition } from '../components/dynamic-field.template'
import { renderAlert } from '../components/alert.template'

export interface Collection {
  id: string
  name: string
  display_name: string
  description?: string
  schema: any
}

export interface ContentFormData {
  id?: string
  title?: string
  slug?: string
  data?: any
  status?: string
  scheduled_publish_at?: number
  scheduled_unpublish_at?: number
  review_status?: string
  meta_title?: string
  meta_description?: string
  collection: Collection
  fields: FieldDefinition[]
  isEdit?: boolean
  error?: string
  success?: string
  validationErrors?: Record<string, string[]>
  workflowEnabled?: boolean // New flag to indicate if workflow plugin is active
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderContentFormPage(data: ContentFormData): string {
  const isEdit = data.isEdit || !!data.id
  const title = isEdit ? `Edit: ${data.title || 'Content'}` : `New ${data.collection.display_name}`
  
  // Group fields by category
  const coreFields = data.fields.filter(f => ['title', 'slug', 'content'].includes(f.field_name))
  const contentFields = data.fields.filter(f => !['title', 'slug', 'content'].includes(f.field_name) && !f.field_name.startsWith('meta_'))
  const metaFields = data.fields.filter(f => f.field_name.startsWith('meta_'))
  
  // Render field groups
  const coreFieldsHTML = coreFields
    .sort((a, b) => a.field_order - b.field_order)
    .map(field => renderDynamicField(field, {
      value: data.data?.[field.field_name] || '',
      errors: data.validationErrors?.[field.field_name] || []
    }))
  
  const contentFieldsHTML = contentFields
    .sort((a, b) => a.field_order - b.field_order)
    .map(field => renderDynamicField(field, {
      value: data.data?.[field.field_name] || '',
      errors: data.validationErrors?.[field.field_name] || []
    }))
  
  const metaFieldsHTML = metaFields
    .sort((a, b) => a.field_order - b.field_order)
    .map(field => renderDynamicField(field, {
      value: data.data?.[field.field_name] || '',
      errors: data.validationErrors?.[field.field_name] || []
    }))

  const pageContent = `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white">${title}</h1>
          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            ${data.collection.description || `Manage ${data.collection.display_name.toLowerCase()} content`}
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/content?collection=${data.collection.id}" class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to ${data.collection.display_name}
          </a>
        </div>
      </div>

      <!-- Breadcrumb -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-3">
          <li>
            <a href="/admin" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </a>
          </li>
          <li class="flex items-center">
            <svg class="h-5 w-5 text-zinc-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <a href="/admin/content" class="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">Content</a>
          </li>
          <li class="flex items-center">
            <svg class="h-5 w-5 text-zinc-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <a href="/admin/content?collection=${data.collection.id}" class="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">${data.collection.display_name}</a>
          </li>
          <li class="flex items-center">
            <svg class="h-5 w-5 text-zinc-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-medium text-zinc-950 dark:text-white">${isEdit ? 'Edit' : 'New'}</span>
          </li>
        </ol>
      </nav>

      <!-- Alert Messages -->
      ${data.error ? renderAlert({ type: 'error', message: data.error, dismissible: true }) : ''}
      ${data.success ? renderAlert({ type: 'success', message: data.success, dismissible: true }) : ''}

      <!-- Main Form Container -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content Form -->
        <div class="lg:col-span-2">
          <form 
            id="content-form"
            ${isEdit ? `hx-put="/admin/content/${data.id}"` : `hx-post="/admin/content"`}
            hx-target="#form-messages"
            hx-encoding="multipart/form-data"
            class="space-y-6"
          >
            <input type="hidden" name="collection_id" value="${data.collection.id}">
            ${isEdit ? `<input type="hidden" name="id" value="${data.id}">` : ''}
            
            <!-- Core Fields -->
            ${renderFieldGroup('Basic Information', coreFieldsHTML)}
            
            <!-- Content Fields -->
            ${contentFields.length > 0 ? renderFieldGroup('Content Details', contentFieldsHTML) : ''}
            
            <!-- SEO & Meta Fields -->
            ${metaFields.length > 0 ? renderFieldGroup('SEO & Metadata', metaFieldsHTML, true) : ''}
            
            <div id="form-messages"></div>
          </form>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Publishing Options -->
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white mb-4">Publishing</h3>

            ${data.workflowEnabled ? `
              <!-- Workflow Status (when workflow plugin is enabled) -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Status</label>
                <select
                  name="status"
                  form="content-form"
                  class="w-full rounded-lg bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none transition-colors"
                >
                  <option value="draft" ${data.status === 'draft' ? 'selected' : ''}>Draft</option>
                  <option value="review" ${data.status === 'review' ? 'selected' : ''}>Under Review</option>
                  <option value="published" ${data.status === 'published' ? 'selected' : ''}>Published</option>
                  <option value="archived" ${data.status === 'archived' ? 'selected' : ''}>Archived</option>
                </select>
              </div>

              <!-- Scheduled Publishing -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Schedule Publish</label>
                <input
                  type="datetime-local"
                  name="scheduled_publish_at"
                  form="content-form"
                  value="${data.scheduled_publish_at ? new Date(data.scheduled_publish_at).toISOString().slice(0, 16) : ''}"
                  class="w-full rounded-lg bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none transition-colors"
                >
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Leave empty to publish immediately</p>
              </div>

              <!-- Scheduled Unpublishing -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Schedule Unpublish</label>
                <input
                  type="datetime-local"
                  name="scheduled_unpublish_at"
                  form="content-form"
                  value="${data.scheduled_unpublish_at ? new Date(data.scheduled_unpublish_at).toISOString().slice(0, 16) : ''}"
                  class="w-full rounded-lg bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none transition-colors"
                >
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Automatically unpublish at this time</p>
              </div>
            ` : `
              <!-- Simple Status (when workflow plugin is disabled) -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Status</label>
                <select
                  name="status"
                  form="content-form"
                  class="w-full rounded-lg bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none transition-colors"
                >
                  <option value="draft" ${data.status === 'draft' ? 'selected' : ''}>Draft</option>
                  <option value="published" ${data.status === 'published' ? 'selected' : ''}>Published</option>
                </select>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Enable Workflow plugin for advanced status management</p>
              </div>
            `}

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                type="submit"
                form="content-form"
                name="action"
                value="save"
                class="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
              >
                ${isEdit ? 'Update' : 'Save'} Content
              </button>

              <button
                type="submit"
                form="content-form"
                name="action"
                value="save_and_continue"
                class="w-full rounded-lg bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Save & Continue Editing
              </button>

              ${data.user?.role !== 'viewer' ? `
                <button
                  type="submit"
                  form="content-form"
                  name="action"
                  value="save_and_publish"
                  class="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors"
                >
                  ${isEdit ? 'Update' : 'Save'} & Publish
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Content Info -->
          ${isEdit ? `
            <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
              <h3 class="text-lg font-semibold text-zinc-950 dark:text-white mb-4">Content Info</h3>

              <div class="space-y-3 text-sm">
                <div>
                  <span class="text-zinc-500 dark:text-zinc-400">Created:</span>
                  <span class="text-zinc-950 dark:text-white ml-2">${data.data?.created_at ? new Date(data.data.created_at).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div>
                  <span class="text-zinc-500 dark:text-zinc-400">Last Modified:</span>
                  <span class="text-zinc-950 dark:text-white ml-2">${data.data?.updated_at ? new Date(data.data.updated_at).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div>
                  <span class="text-zinc-500 dark:text-zinc-400">Author:</span>
                  <span class="text-zinc-950 dark:text-white ml-2">${data.data?.author || 'Unknown'}</span>
                </div>
                ${data.data?.published_at ? `
                  <div>
                    <span class="text-zinc-500 dark:text-zinc-400">Published:</span>
                    <span class="text-zinc-950 dark:text-white ml-2">${new Date(data.data.published_at).toLocaleDateString()}</span>
                  </div>
                ` : ''}
              </div>

              <div class="mt-4 pt-4 border-t border-zinc-950/5 dark:border-white/10">
                <button
                  type="button"
                  onclick="showVersionHistory('${data.id}')"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  View Version History
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Quick Actions -->
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white mb-4">Quick Actions</h3>

            <div class="space-y-2">
              <button
                type="button"
                onclick="previewContent()"
                class="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Preview Content
              </button>

              <button
                type="button"
                onclick="duplicateContent()"
                class="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Duplicate Content
              </button>

              ${isEdit ? `
                <button
                  type="button"
                  onclick="deleteContent('${data.id}')"
                  class="w-full text-left px-3 py-2 text-sm text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete Content
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TinyMCE CDN -->
    <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
    
    <!-- Dynamic Field Scripts -->
    <script>
      // Field group toggle
      function toggleFieldGroup(groupId) {
        const content = document.getElementById(groupId + '-content');
        const icon = document.getElementById(groupId + '-icon');
        
        if (content.classList.contains('hidden')) {
          content.classList.remove('hidden');
          icon.classList.remove('rotate-[-90deg]');
        } else {
          content.classList.add('hidden');
          icon.classList.add('rotate-[-90deg]');
        }
      }

      // Media field functions
      function openMediaSelector(fieldId) {
        // Open media library modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = \`
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white mb-4">Select Media</h3>
            <div id="media-grid-container" hx-get="/admin/media/selector" hx-trigger="load"></div>
            <div class="mt-4 flex justify-end space-x-2">
              <button onclick="this.closest('.fixed').remove()" class="rounded-lg bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
            </div>
          </div>
        \`;
        document.body.appendChild(modal);
      }

      function clearMediaField(fieldId) {
        document.getElementById(fieldId).value = '';
        document.getElementById(fieldId + '-preview').classList.add('hidden');
      }

      function setMediaField(fieldId, mediaUrl) {
        document.getElementById(fieldId).value = mediaUrl;
        const preview = document.getElementById(fieldId + '-preview');
        preview.innerHTML = \`<img src="\${mediaUrl}" alt="Selected media" class="w-32 h-32 object-cover rounded-lg ring-1 ring-zinc-950/10 dark:ring-white/10">\`;
        preview.classList.remove('hidden');

        // Close modal
        document.querySelector('.fixed.inset-0')?.remove();
      }

      // Custom select options
      function addCustomOption(input, selectId) {
        const value = input.value.trim();
        if (value) {
          const select = document.getElementById(selectId);
          const option = document.createElement('option');
          option.value = value;
          option.text = value;
          option.selected = true;
          select.appendChild(option);
          input.value = '';
        }
      }

      // Quick actions
      function previewContent() {
        const form = document.getElementById('content-form');
        const formData = new FormData(form);
        
        // Open preview in new window
        const preview = window.open('', '_blank');
        preview.document.write('<p>Loading preview...</p>');
        
        fetch('/admin/content/preview', {
          method: 'POST',
          body: formData
        })
        .then(response => response.text())
        .then(html => {
          preview.document.open();
          preview.document.write(html);
          preview.document.close();
        })
        .catch(error => {
          preview.document.write('<p>Error loading preview</p>');
        });
      }

      function duplicateContent() {
        if (confirm('Create a copy of this content?')) {
          const form = document.getElementById('content-form');
          const formData = new FormData(form);
          formData.append('action', 'duplicate');
          
          fetch('/admin/content/duplicate', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              window.location.href = \`/admin/content/\${data.id}/edit\`;
            } else {
              alert('Error duplicating content');
            }
          });
        }
      }

      function deleteContent(contentId) {
        if (confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
          fetch(\`/admin/content/\${contentId}\`, {
            method: 'DELETE'
          })
          .then(response => {
            if (response.ok) {
              window.location.href = '/admin/content';
            } else {
              alert('Error deleting content');
            }
          });
        }
      }

      function showVersionHistory(contentId) {
        // Create and show version history modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = \`
          <div id="version-history-content">
            <div class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          </div>
        \`;
        document.body.appendChild(modal);

        // Load version history
        fetch(\`/admin/content/\${contentId}/versions\`)
        .then(response => response.text())
        .then(html => {
          document.getElementById('version-history-content').innerHTML = html;
        })
        .catch(error => {
          console.error('Error loading version history:', error);
          document.getElementById('version-history-content').innerHTML = '<p class="text-zinc-950 dark:text-white">Error loading version history</p>';
        });
      }

      // Auto-save functionality
      let autoSaveTimeout;
      function scheduleAutoSave() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
          const form = document.getElementById('content-form');
          const formData = new FormData(form);
          formData.append('action', 'autosave');
          
          fetch(form.action, {
            method: 'POST',
            body: formData
          })
          .then(response => {
            if (response.ok) {
              console.log('Auto-saved');
            }
          })
          .catch(error => console.error('Auto-save failed:', error));
        }, 30000); // Auto-save every 30 seconds
      }

      // Bind auto-save to form changes
      document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('content-form');
        form.addEventListener('input', scheduleAutoSave);
        form.addEventListener('change', scheduleAutoSave);
      });
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: title,
    pageTitle: 'Content Management',
    currentPath: '/admin/content',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}