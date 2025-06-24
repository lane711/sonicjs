import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout.template'
import { renderForm, FormData, FormField } from '../components/form.template'
import { renderAlert } from '../components/alert.template'

export interface ContentModel {
  name: string
  displayName: string
  fields?: any
}

export interface ContentItem {
  id: string
  title: string
  slug: string
  status: string
  data: any
  collection_id: string
  created_at: string
  updated_at: string
}

export interface ContentEditPageData {
  content: ContentItem
  models: ContentModel[]
  selectedModel?: ContentModel
  error?: string
  user: {
    name: string
    email: string
    role: string
  }
}

export function renderContentEditPage(data: ContentEditPageData): string {
  const { content, models, selectedModel, error, user } = data

  // Create form fields based on the selected model
  const fields: FormField[] = [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      value: content.title,
      placeholder: 'Enter content title'
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      value: content.slug,
      placeholder: 'enter-url-slug'
    }
  ]

  // Add dynamic fields based on model configuration
  if (selectedModel?.fields) {
    Object.entries(selectedModel.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
      const fieldValue = content.data[fieldName] || ''
      
      const field: FormField = {
        name: fieldName,
        label: fieldConfig.label || fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        type: fieldConfig.type === 'rich_text' ? 'rich_text' : 'text',
        required: fieldConfig.required || false,
        value: fieldValue,
        placeholder: fieldConfig.placeholder || `Enter ${fieldName}`
      }
      
      if (fieldConfig.type === 'textarea' || fieldConfig.type === 'rich_text') {
        field.type = fieldConfig.type === 'rich_text' ? 'rich_text' : 'textarea'
      }
      
      fields.push(field)
    })
  }

  // Add status field
  fields.push({
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    value: content.status,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'review', label: 'In Review' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' }
    ]
  })

  const formData: FormData = {
    id: 'edit-content-form',
    hxPost: `/admin/content/${content.id}/edit`,
    hxTarget: '#form-response',
    fields,
    submitButtons: [
      {
        label: 'Update Content',
        type: 'submit',
        className: 'bg-blue-600 hover:bg-blue-700 text-white'
      },
      {
        label: 'Cancel',
        type: 'button',
        className: 'bg-gray-300 hover:bg-gray-400 text-gray-700 ml-2',
        onclick: 'window.history.back()'
      }
    ]
  }

  const pageContent = `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="mb-6">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <a href="/admin" class="text-gray-400 hover:text-gray-500">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              </a>
            </li>
            <li>
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <a href="/admin/content" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">Content</a>
            </li>
            <li>
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="ml-4 text-sm font-medium text-gray-500">Edit: ${content.title}</span>
            </li>
          </ol>
        </nav>
        
        <div class="mt-4">
          <h1 class="text-3xl font-bold text-gray-900">Edit Content</h1>
          <p class="text-gray-600 mt-2">Update the content details below</p>
        </div>
      </div>
      
      ${error ? renderAlert({ type: 'error', message: error }) : ''}
      
      <!-- Content Form -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div id="form-response"></div>
        ${renderForm(formData)}
      </div>
    </div>
  `

  const layoutData: AdminLayoutData = {
    title: `Edit: ${content.title}`,
    pageTitle: 'Edit Content',
    currentPath: '/admin/content',
    user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}