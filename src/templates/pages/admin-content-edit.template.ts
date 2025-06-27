import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
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
        <!-- Glass Morphism Header Card -->
        <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-8 mb-8">
          <!-- Breadcrumb -->
          <nav class="flex mb-6" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-3">
              <li>
                <a href="/admin" class="text-gray-300 hover:text-white transition-colors">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                </a>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <a href="/admin/content" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">Content</a>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm font-medium text-gray-200">Edit</span>
              </li>
            </ol>
          </nav>
          
          <!-- Title Section with Gradient -->
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"></div>
            <div class="relative">
              <h1 class="text-4xl font-bold text-white mb-3">Edit Content</h1>
              <p class="text-gray-300 text-lg">Editing: <span class="text-white font-medium">${content.title}</span></p>
            </div>
          </div>
        </div>
        
        ${error ? `
          <div class="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
            ${renderAlert({ type: 'error', message: error })}
          </div>
        ` : ''}
        
        <!-- Glass Morphism Form Container -->
        <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl overflow-hidden">
          <!-- Form Header with Gradient Background -->
          <div class="relative px-8 py-6 border-b border-white/10">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
            <div class="relative flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-white">Content Details</h2>
                <p class="text-sm text-gray-300">Fill in the information below to update your content</p>
              </div>
            </div>
          </div>
          
          <!-- Form Content -->
          <div class="p-8">
            <div id="form-response"></div>
            <style>
              /* Glass morphism form styles */
              #edit-content-form .form-group {
                margin-bottom: 1.5rem;
              }
              
              #edit-content-form .form-label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: #e5e7eb;
                margin-bottom: 0.5rem;
              }
              
              #edit-content-form .form-input,
              #edit-content-form .form-textarea,
              #edit-content-form select {
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
              
              #edit-content-form .form-input:focus,
              #edit-content-form .form-textarea:focus,
              #edit-content-form select:focus {
                outline: none;
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
              }
              
              #edit-content-form .form-input::placeholder,
              #edit-content-form .form-textarea::placeholder {
                color: rgba(255, 255, 255, 0.4);
              }
              
              #edit-content-form select option {
                background: #1f2937;
                color: white;
              }
              
              #edit-content-form .btn {
                padding: 0.75rem 1.5rem;
                font-weight: 500;
                border-radius: 0.75rem;
                transition: all 0.2s;
                border: none;
                cursor: pointer;
              }
              
              #edit-content-form .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              
              #edit-content-form .btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
              }
              
              #edit-content-form .markdown-field .CodeMirror {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem;
                color: white;
              }
              
              #edit-content-form .markdown-field .CodeMirror-cursor {
                border-color: white;
              }
              
              #edit-content-form .markdown-field .editor-toolbar {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.75rem 0.75rem 0 0;
              }
              
              #edit-content-form .markdown-field .editor-toolbar a {
                color: rgba(255, 255, 255, 0.7) !important;
              }
              
              #edit-content-form .markdown-field .editor-toolbar a:hover,
              #edit-content-form .markdown-field .editor-toolbar a.active {
                background: rgba(255, 255, 255, 0.1);
                color: white !important;
              }
              
              /* Help text styling */
              #edit-content-form .text-gray-4 {
                color: rgba(255, 255, 255, 0.5);
              }
              
              /* Form footer styling */
              #edit-content-form .border-t {
                border-top: 1px solid rgba(255, 255, 255, 0.1);
              }
            </style>
            ${renderForm(formData)}
          </div>
        </div>
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