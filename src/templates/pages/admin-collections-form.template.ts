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

      className: isEdit ? 'bg-gray-50 text-gray-500' : ''
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
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Breadcrumb -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <a href="/admin" class="text-gray-400 hover:text-gray-500">
              <svg class="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </a>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <a href="/admin/collections" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">Collections</a>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="ml-4 text-sm font-medium text-gray-500">${isEdit ? 'Edit' : 'New'}</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Main Form -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        ${data.error ? renderAlert({ type: 'error', message: data.error, dismissible: true }) : ''}
        ${data.success ? renderAlert({ type: 'success', message: data.success, dismissible: true }) : ''}
        
        ${renderForm(formData)}
        
        ${!isEdit ? `
          <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <h3 class="text-sm font-medium text-yellow-800">
                  Basic Collection Creation
                </h3>
                <p class="text-sm text-yellow-700 mt-1">
                  This creates a basic collection. Advanced field definitions and schema management will be available in Stage 5.
                </p>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Action Buttons -->
        <div class="mt-6 pt-6 border-t flex justify-between">
          <a href="/admin/collections" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Cancel
          </a>
          
          ${isEdit ? `
            <button 
              type="button"
              hx-delete="/admin/collections/${data.id}"
              hx-confirm="Are you sure you want to delete this collection? This action cannot be undone."
              hx-target="body"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
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