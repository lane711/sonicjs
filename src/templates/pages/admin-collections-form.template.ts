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
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center space-x-2 text-sm text-gray-300 mb-2">
              <a href="/admin" class="hover:text-white transition-colors">
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </a>
              <span>/</span>
              <a href="/admin/collections" class="hover:text-white transition-colors">Collections</a>
              <span>/</span>
              <span class="text-white">${isEdit ? 'Edit' : 'New'}</span>
            </div>
            <h1 class="text-2xl font-bold text-white">${title}</h1>
            <p class="text-gray-300 mt-1">${subtitle}</p>
          </div>
          <a href="/admin/collections" class="inline-flex items-center px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-colors border border-white/10">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Collections
          </a>
        </div>
      </div>

      <!-- Main Form -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
        ${data.error ? renderAlert({ type: 'error', message: data.error, dismissible: true }) : ''}
        ${data.success ? renderAlert({ type: 'success', message: data.success, dismissible: true }) : ''}
        
        ${renderForm(formData)}
        
        ${!isEdit ? `
          <div class="mt-6 bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
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
          <a href="/admin/collections" class="inline-flex items-center px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-colors border border-white/20">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Cancel
          </a>
          
          ${isEdit ? `
            <button 
              type="button"
              hx-delete="/admin/collections/${data.id}"
              hx-confirm="Are you sure you want to delete this collection? This action cannot be undone."
              hx-target="body"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete Collection
            </button>
          ` : ''}
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