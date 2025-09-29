import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'
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
        className: 'btn-primary'
      },
      {
        label: 'Cancel',
        type: 'button',
        className: 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 ml-2',
        onclick: 'window.history.back()'
      }
    ]
  }

  const pageContent = `
    <div class="min-h-screen py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header Card -->
        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8 mb-8">
          <!-- Breadcrumb -->
          <nav class="flex mb-6" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-3">
              <li>
                <a href="/admin" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                </a>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-zinc-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <a href="/admin/content" class="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">Content</a>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-zinc-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm font-medium text-zinc-950 dark:text-white">Edit</span>
              </li>
            </ol>
          </nav>

          <!-- Title Section -->
          <div>
            <h1 class="text-4xl font-bold text-zinc-950 dark:text-white mb-3">Edit Content</h1>
            <p class="text-zinc-500 dark:text-zinc-400 text-lg">Editing: <span class="text-zinc-950 dark:text-white font-medium">${content.title}</span></p>
          </div>
        </div>

        ${error ? `
          <div class="mb-6">
            ${renderAlert({ type: 'error', message: error })}
          </div>
        ` : ''}

        <!-- Form Container -->
        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 overflow-hidden">
          <!-- Form Header -->
          <div class="px-8 py-6 border-b border-zinc-950/5 dark:border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-zinc-950 dark:text-white">Content Details</h2>
                <p class="text-sm text-zinc-500 dark:text-zinc-400">Fill in the information below to update your content</p>
              </div>
            </div>
          </div>
          
          <!-- Form Content -->
          <div class="p-8">
            <div id="form-response"></div>
            <style>
              /* Catalyst form styles */
              #edit-content-form .form-group {
                margin-bottom: 1.5rem;
              }

              #edit-content-form .form-label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: 0.5rem;
              }

              #edit-content-form .form-input,
              #edit-content-form .form-textarea,
              #edit-content-form select {
                width: 100%;
                padding: 0.75rem 1rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                transition: all 0.2s;
              }

              #edit-content-form .form-input:focus,
              #edit-content-form .form-textarea:focus,
              #edit-content-form select:focus {
                outline: none;
                box-shadow: 0 0 0 2px rgb(37 99 235);
              }

              #edit-content-form .btn {
                padding: 0.75rem 1.5rem;
                font-weight: 500;
                border-radius: 0.5rem;
                transition: all 0.2s;
                border: none;
                cursor: pointer;
              }

              #edit-content-form .btn-primary {
                background: rgb(37 99 235);
                color: white;
              }

              #edit-content-form .btn-primary:hover {
                background: rgb(29 78 216);
              }
            </style>
            ${renderForm(formData)}
          </div>
        </div>
      </div>
    </div>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: `Edit: ${content.title}`,
    pageTitle: 'Edit Content',
    currentPath: '/admin/content',
    user,
    content: pageContent
  }

  return renderAdminLayoutCatalyst(layoutData)
}