import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderForm, FormData, FormField } from '../components/form.template'
import { renderAlert } from '../components/alert.template'

export interface CollectionField {
  id: string
  field_name: string
  field_type: string
  field_label: string
  field_options: any
  field_order: number
  is_required: boolean
  is_searchable: boolean
}

export interface CollectionFormData {
  id?: string
  name?: string
  display_name?: string
  description?: string
  fields?: CollectionField[]
  isEdit?: boolean
  error?: string
  success?: string
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderCollectionFormPage(data: CollectionFormData): string {
  const isEdit = data.isEdit || !!data.id
  const title = isEdit ? 'Edit Collection' : 'Create New Collection'
  const subtitle = isEdit 
    ? `Update collection: ${data.display_name}`
    : 'Define a new content collection with custom fields and settings.'

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Collection Name',
      type: 'text',
      value: data.name || '',
      placeholder: 'blog_posts',

      helpText: 'Lowercase letters, numbers, and underscores only',

      className: isEdit ? 'bg-white/5 text-gray-400 cursor-not-allowed' : 'bg-white/10 text-white'
    },
    {
      name: 'displayName',
      label: 'Display Name',
      type: 'text',
      value: data.display_name || '',
      placeholder: 'Blog Posts',

    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      value: data.description || '',
      placeholder: 'Description of this collection...',
      rows: 3
    }
  ]

  // Make name field readonly for edit
  if (isEdit && fields.length > 0 && fields[0]) {
    fields[0].placeholder = undefined
    fields[0].helpText = 'Collection name cannot be changed'
  }

  const formData: FormData = {
    id: 'collection-form',
    ...(isEdit 
      ? { hxPut: `/admin/collections/${data.id}` }
      : { hxPost: '/admin/collections' }
    ),
    hxTarget: '#form-messages',
    fields: fields,
    submitButtons: [
      {
        label: isEdit ? 'Update Collection' : 'Create Collection',
        type: 'submit',
        className: 'btn-primary'
      }
    ],
    title: title,
    description: subtitle
  }

  const pageContent = `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">${title}</h1>
          <p class="mt-2 text-sm text-gray-300">${subtitle}</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/collections" class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Collections
          </a>
        </div>
      </div>

      <!-- Breadcrumb -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-3">
          <li>
            <a href="/admin" class="text-gray-300 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </a>
          </li>
          <li class="flex items-center">
            <svg class="h-5 w-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <a href="/admin/collections" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">Collections</a>
          </li>
          <li class="flex items-center">
            <svg class="h-5 w-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-medium text-gray-200">${isEdit ? 'Edit' : 'New'}</span>
          </li>
        </ol>
      </nav>

      <!-- Form Container -->
      <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        <!-- Form Header -->
        <div class="relative px-8 py-6 border-b border-white/10">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div class="relative flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-white">Collection Details</h2>
              <p class="text-sm text-gray-300">Configure your collection settings below</p>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="p-8">
          <div id="form-messages"></div>
          ${data.error ? renderAlert({ type: 'error', message: data.error, dismissible: true }) : ''}
          ${data.success ? renderAlert({ type: 'success', message: data.success, dismissible: true }) : ''}
          
          <!-- Form Styling -->
          <style>
            #collection-form .form-group {
              margin-bottom: 1.5rem;
            }
            
            #collection-form .form-label {
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: #e5e7eb;
              margin-bottom: 0.5rem;
            }
            
            #collection-form .form-input,
            #collection-form .form-textarea {
              width: 100%;
              padding: 0.75rem 1rem;
              background: rgba(255, 255, 255, 0.05);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 0.75rem;
              color: white;
              font-size: 0.875rem;
              transition: all 0.2s;
            }
            
            #collection-form .form-input:focus,
            #collection-form .form-textarea:focus {
              outline: none;
              background: rgba(255, 255, 255, 0.1);
              border-color: rgba(255, 255, 255, 0.3);
              box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
            }
            
            #collection-form .form-input::placeholder,
            #collection-form .form-textarea::placeholder {
              color: rgba(255, 255, 255, 0.4);
            }
            
            #collection-form .btn {
              padding: 0.75rem 1.5rem;
              font-weight: 500;
              border-radius: 0.75rem;
              transition: all 0.2s;
              border: none;
              cursor: pointer;
            }
            
            #collection-form .btn-primary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            
            #collection-form .btn-primary:hover {
              transform: translateY(-1px);
              box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
          </style>
          
          ${renderForm(formData)}
          
          ${isEdit ? `
            <!-- Fields Management Section -->
            <div class="mt-8 pt-8 border-t border-white/10">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-lg font-semibold text-white">Collection Fields</h3>
                  <p class="text-sm text-gray-300 mt-1">Define the fields that content in this collection will have</p>
                </div>
                <button 
                  type="button" 
                  onclick="showAddFieldModal()"
                  class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Field
                </button>
              </div>
              
              <!-- Fields List -->
              <div id="fields-list" class="space-y-3">
                ${(data.fields || []).map(field => `
                  <div class="field-item backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 p-4" data-field-id="${field.id}">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4">
                        <div class="drag-handle cursor-move text-gray-400 hover:text-white">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                          </svg>
                        </div>
                        <div>
                          <div class="flex items-center space-x-2">
                            <span class="text-white font-medium">${field.field_label}</span>
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
                              ${field.field_type}
                            </span>
                            ${field.is_required ? `
                              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-300">
                                Required
                              </span>
                            ` : ''}
                          </div>
                          <div class="text-sm text-gray-400 mt-1">
                            Field name: <code class="text-gray-300">${field.field_name}</code>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button 
                          type="button" 
                          onclick="editField('${field.id}')"
                          class="inline-flex items-center px-3 py-1 text-sm text-blue-300 hover:text-blue-200 transition-colors"
                        >
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          Edit
                        </button>
                        <button 
                          type="button" 
                          onclick="deleteField('${field.id}')"
                          class="inline-flex items-center px-3 py-1 text-sm text-red-300 hover:text-red-200 transition-colors"
                        >
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
                
                ${(data.fields || []).length === 0 ? `
                  <div class="text-center py-8 text-gray-400">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p class="text-lg font-medium">No fields defined</p>
                    <p class="text-sm mt-1">Add your first field to get started</p>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : `
            <div class="mt-6 backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-blue-300">
                    Create Collection First
                  </h3>
                  <p class="text-sm text-blue-200 mt-1">
                    After creating the collection, you'll be able to add and configure custom fields.
                  </p>
                </div>
              </div>
            </div>
          `}
          
          <!-- Action Buttons -->
          <div class="mt-6 pt-6 border-t border-white/10 flex justify-between">
            <a href="/admin/collections" class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all">
              <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Cancel
            </a>
            
            ${isEdit ? `
              <button 
                type="button"
                hx-delete="/admin/collections/${data.id}"
                hx-confirm="Are you sure you want to delete this collection? This action cannot be undone."
                hx-target="body"
                class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-red-500/80 px-4 py-2 text-sm font-semibold text-white border border-red-500/20 hover:bg-red-500 transition-all"
              >
                <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete Collection
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Field Modal -->
    <div id="field-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 hidden">
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl w-full max-w-lg mx-4">
        <div class="relative px-6 py-4 border-b border-white/10">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div class="relative flex items-center justify-between">
            <h3 id="modal-title" class="text-lg font-semibold text-white">Add Field</h3>
            <button onclick="closeFieldModal()" class="text-gray-300 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <form id="field-form" class="p-6 space-y-4">
          <input type="hidden" id="field-id" name="field_id">
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Field Name</label>
            <input 
              type="text" 
              id="field-name" 
              name="field_name" 
              required
              pattern="[a-z0-9_]+"
              class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="field_name"
            >
            <p class="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and underscores only</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Field Type</label>
            <select 
              id="field-type" 
              name="field_type" 
              required
              class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
            >
              <option value="">Select field type...</option>
              <option value="text">Text</option>
              <option value="richtext">Rich Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="media">Media</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Field Label</label>
            <input 
              type="text" 
              id="field-label" 
              name="field_label" 
              required
              class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="Field Label"
            >
          </div>

          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input type="checkbox" id="field-required" name="is_required" value="1" class="mr-2 rounded">
              <span class="text-sm text-gray-300">Required</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="field-searchable" name="is_searchable" value="1" class="mr-2 rounded">
              <span class="text-sm text-gray-300">Searchable</span>
            </label>
          </div>

          <div id="field-options-container" class="hidden">
            <label class="block text-sm font-medium text-gray-300 mb-2">Field Options (JSON)</label>
            <textarea 
              id="field-options" 
              name="field_options" 
              rows="3"
              class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
              placeholder='{"maxLength": 200, "placeholder": "Enter text..."}'
            ></textarea>
            <p class="text-xs text-gray-400 mt-1">JSON configuration for field-specific options</p>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button 
              type="button" 
              onclick="closeFieldModal()"
              class="px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <span id="submit-text">Add Field</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <script>
      const collectionId = '${data.id || ''}';
      console.log('Collection ID for field management:', collectionId);
      
      if (!collectionId) {
        console.error('Collection ID is missing! Field management will not work.');
      }
      
      let currentEditingField = null;

      // Field modal functions
      function showAddFieldModal() {
        document.getElementById('modal-title').textContent = 'Add Field';
        document.getElementById('submit-text').textContent = 'Add Field';
        document.getElementById('field-form').reset();
        document.getElementById('field-id').value = '';
        document.getElementById('field-name').disabled = false;
        currentEditingField = null;
        document.getElementById('field-modal').classList.remove('hidden');
      }

      function editField(fieldId) {
        const fieldItem = document.querySelector(\`[data-field-id="\${fieldId}"]\`);
        if (!fieldItem) return;

        // Find the field data from the collection's fields array
        const field = ${JSON.stringify(data.fields || [])}.find(f => f.id === fieldId);
        if (!field) return;

        // Set up the modal for editing
        document.getElementById('modal-title').textContent = 'Edit Field';
        document.getElementById('submit-text').textContent = 'Update Field';
        document.getElementById('field-id').value = fieldId;
        currentEditingField = fieldId;

        // Populate form with existing field data
        document.getElementById('field-name').value = field.field_name;
        document.getElementById('field-name').disabled = true;
        document.getElementById('field-label').value = field.field_label;
        document.getElementById('field-type').value = field.field_type;
        document.getElementById('field-required').checked = field.is_required == 1;
        document.getElementById('field-searchable').checked = field.is_searchable == 1;
        
        // Handle field options
        if (field.field_options) {
          document.getElementById('field-options').value = field.field_options;
        } else {
          document.getElementById('field-options').value = '';
        }

        // Show/hide options container based on field type
        const fieldType = field.field_type;
        const optionsContainer = document.getElementById('field-options-container');
        if (fieldType === 'select' || fieldType === 'media') {
          optionsContainer.classList.remove('hidden');
        } else {
          optionsContainer.classList.add('hidden');
        }

        document.getElementById('field-modal').classList.remove('hidden');
      }

      function closeFieldModal() {
        document.getElementById('field-modal').classList.add('hidden');
        currentEditingField = null;
      }

      function deleteField(fieldId) {
        if (!confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
          return;
        }

        fetch(\`/admin/collections/\${collectionId}/fields/\${fieldId}\`, {
          method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            location.reload();
          } else {
            alert('Error deleting field: ' + data.error);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error deleting field');
        });
      }

      // Field form submission
      document.getElementById('field-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!collectionId) {
          alert('Error: Collection ID is missing. Cannot save field.');
          return;
        }
        
        const formData = new FormData(this);
        const isEditing = currentEditingField !== null;
        
        const url = isEditing 
          ? \`/admin/collections/\${collectionId}/fields/\${currentEditingField}\`
          : \`/admin/collections/\${collectionId}/fields\`;
        
        const method = isEditing ? 'PUT' : 'POST';
        
        console.log('Submitting field form:', { url, method, isEditing });
        
        fetch(url, {
          method: method,
          body: formData
        })
        .then(response => {
          console.log('Field submission response status:', response.status);
          if (!response.ok) {
            throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Field submission response data:', data);
          if (data.success) {
            console.log('Field saved successfully, reloading page...');
            location.reload();
          } else {
            alert('Error saving field: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(error => {
          console.error('Field submission error:', error);
          alert('Error saving field: ' + error.message);
        });
      });

      // Field type change handler
      document.getElementById('field-type').addEventListener('change', function() {
        const optionsContainer = document.getElementById('field-options-container');
        const fieldOptions = document.getElementById('field-options');
        
        // Show/hide options based on field type
        if (['select', 'media', 'richtext'].includes(this.value)) {
          optionsContainer.classList.remove('hidden');
          
          // Set default options based on type
          switch (this.value) {
            case 'select':
              fieldOptions.value = '{"options": ["Option 1", "Option 2"], "multiple": false}';
              break;
            case 'media':
              fieldOptions.value = '{"accept": "image/*", "maxSize": "10MB"}';
              break;
            case 'richtext':
              fieldOptions.value = '{"toolbar": "full", "height": 400}';
              break;
          }
        } else {
          optionsContainer.classList.add('hidden');
          fieldOptions.value = '{}';
        }
      });

      // Close modal on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !document.getElementById('field-modal').classList.contains('hidden')) {
          closeFieldModal();
        }
      });

      // Close modal on backdrop click
      document.getElementById('field-modal').addEventListener('click', function(e) {
        if (e.target === this) {
          closeFieldModal();
        }
      });
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: title,
    pageTitle: 'Collections',
    currentPath: '/admin/collections',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}