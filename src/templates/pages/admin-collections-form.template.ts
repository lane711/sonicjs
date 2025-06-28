import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderForm, FormData, FormField } from '../components/form.template'
import { renderAlert } from '../components/alert.template'

export interface CollectionFormData {
  id?: string
  name?: string
  display_name?: string
  description?: string
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
          
          ${!isEdit ? `
            <div class="mt-6 backdrop-blur-sm bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-amber-300">
                    Basic Collection Creation
                  </h3>
                  <p class="text-sm text-amber-200 mt-1">
                    This creates a basic collection. Advanced field definitions and schema management will be available in Stage 5.
                  </p>
                </div>
              </div>
            </div>
          ` : ''}
          
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