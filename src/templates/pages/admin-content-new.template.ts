import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderForm, FormData, FormField } from '../components/form.template'
import { renderAlert } from '../components/alert.template'

export interface ContentModel {
  name: string
  displayName: string
  fields?: Record<string, any>
}

export interface ContentNewPageData {
  models: ContentModel[]
  selectedModel?: ContentModel
  error?: string
  success?: string
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderContentNewPage(data: ContentNewPageData): string {
  // Show no models available state
  if (data.models.length === 0) {
    const pageContent = `
      <div class="min-h-screen py-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            ${renderAlert({
              type: 'warning',
              title: 'No Content Models Available',
              message: 'Please create a collection first before adding content.',
              className: 'mb-4'
            })}
            <div class="text-center">
              <a href="/admin/collections/new" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create a Collection
              </a>
            </div>
          </div>
        </div>
      </div>
    `

    const layoutData: AdminLayoutData = {
      title: 'Create New Content',
      pageTitle: 'Create New Content',
      currentPath: '/admin/content',
      user: data.user,
      content: pageContent
    }

    return renderAdminLayout(layoutData)
  }

  // Generate dynamic fields based on selected model
  const generateModelFields = (model?: ContentModel): FormField[] => {
    if (!model || !model.fields) return []
    
    const fields: FormField[] = []
    
    // Sort fields by position
    const fieldEntries = Object.entries(model.fields).sort(([, a]: any, [, b]: any) => 
      (a.ui?.position || 999) - (b.ui?.position || 999)
    )
    
    fieldEntries.forEach(([fieldName, fieldConfig]: any) => {
      const field: FormField = {
        name: fieldName,
        label: fieldConfig.label || fieldName,
        type: fieldConfig.type,
        required: fieldConfig.required,
        placeholder: fieldConfig.ui?.placeholder || '',
        helpText: fieldConfig.ui?.helpText || fieldConfig.description
      }
      
      // Handle specific field types
      switch (fieldConfig.type) {
        case 'select':
        case 'multi_select':
          field.options = fieldConfig.validation?.options?.map((option: string) => ({
            value: option,
            label: option
          })) || []
          break
          
        case 'number':
          field.validation = {
            min: fieldConfig.validation?.min,
            max: fieldConfig.validation?.max
          }
          break
          
        case 'textarea':
          field.rows = 4
          break
          
        case 'rich_text':
          field.rows = 8
          break
      }
      
      fields.push(field)
    })
    
    return fields
  }

  const selectedModel = data.selectedModel || (data.models.length > 0 ? data.models[0] : null)
  
  // Base form fields
  const baseFields: FormField[] = [
    {
      name: 'modelName',
      label: 'Content Type',
      type: 'select',
      required: true,
      value: selectedModel?.name || '',
      options: data.models.map(model => ({
        value: model.name,
        label: model.displayName,
        selected: model.name === selectedModel?.name
      })),
      className: 'hx-get="/admin/content/form-fields" hx-trigger="change" hx-target="#dynamic-fields"'
    }
  ]

  // Combine base fields with dynamic model fields
  const allFields = [...baseFields, ...generateModelFields(selectedModel || undefined)]

  const formData: FormData = {
    id: 'content-form',
    hxPost: '/admin/content',
    hxTarget: '#form-messages',
    fields: allFields,
    submitButtons: [
      {
        label: 'Save as Draft',
        name: 'status',
        value: 'draft',
        className: 'btn-secondary'
      },
      {
        label: 'Publish',
        name: 'status', 
        value: 'published',
        className: 'btn-primary'
      }
    ],
    title: 'Create New Content',
    description: 'Fill in the details for your new content item.'
  }

  const pageContent = `
    <div class="min-h-screen py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Glass Morphism Header Card -->
        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
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
                <span class="text-sm font-medium text-gray-200">New</span>
              </li>
            </ol>
          </nav>
          
          <!-- Title Section with Gradient -->
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
            <div class="relative">
              <h1 class="text-4xl font-bold text-white mb-3">Create New Content</h1>
              <p class="text-gray-300 text-lg">Fill in the details for your new content item</p>
            </div>
          </div>
        </div>
        
        ${data.error ? `
          <div class="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
            ${renderAlert({ type: 'error', message: data.error })}
          </div>
        ` : ''}
        ${data.success ? `
          <div class="backdrop-blur-xl bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6">
            ${renderAlert({ type: 'success', message: data.success })}
          </div>
        ` : ''}
        
        <!-- Glass Morphism Form Container -->
        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <!-- Form Header with Gradient Background -->
          <div class="relative px-8 py-6 border-b border-white/10">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
            <div class="relative flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-white">Content Details</h2>
                <p class="text-sm text-gray-300">Fill in the information below to create your content</p>
              </div>
            </div>
          </div>
          
          <!-- Form Content -->
          <div class="p-8">
            <div id="form-messages"></div>
            <style>
              /* Glass morphism form styles */
              #content-form .form-group {
                margin-bottom: 1.5rem;
              }
              
              #content-form .form-label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: #e5e7eb;
                margin-bottom: 0.5rem;
              }
              
              #content-form .form-input,
              #content-form .form-textarea,
              #content-form select {
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
              
              #content-form .form-input:focus,
              #content-form .form-textarea:focus,
              #content-form select:focus {
                outline: none;
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
              }
              
              #content-form .form-input::placeholder,
              #content-form .form-textarea::placeholder {
                color: rgba(255, 255, 255, 0.4);
              }
              
              #content-form select option {
                background: #1f2937;
                color: white;
              }
              
              #content-form .btn {
                padding: 0.75rem 1.5rem;
                font-weight: 500;
                border-radius: 0.75rem;
                transition: all 0.2s;
                border: none;
                cursor: pointer;
              }
              
              #content-form .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              
              #content-form .btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
              }
              
              #content-form .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
              }
              
              #content-form .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
              }
              
              /* Help text styling */
              #content-form .text-gray-4 {
                color: rgba(255, 255, 255, 0.5);
              }
              
              /* Form footer styling */
              #content-form .border-t {
                border-top: 1px solid rgba(255, 255, 255, 0.1);
              }
            </style>
            ${renderForm(formData)}
            
            <!-- Dynamic Fields Container -->
            <div id="dynamic-fields"></div>
            
            <!-- Cancel Link -->
            <div class="mt-6 pt-6 border-t border-white/10">
              <a href="/admin/content" class="inline-flex items-center text-gray-300 hover:text-white transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Cancel and return to content list
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <script>
      // Auto-generate slug from title
      function generateSlug(title) {
        return title.toLowerCase()
          .replace(/[^\\w\\s-]/g, '')
          .replace(/\\s+/g, '-')
          .trim();
      }
      
      document.addEventListener('input', function(e) {
        if (e.target.name === 'title') {
          const slugField = document.querySelector('[name="slug"]');
          if (slugField && !slugField.dataset.manual) {
            slugField.value = generateSlug(e.target.value);
          }
        }
      });
      
      document.addEventListener('input', function(e) {
        if (e.target.name === 'slug') {
          e.target.dataset.manual = 'true';
        }
      });
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: 'Create New Content',
    pageTitle: 'Content Management',
    currentPath: '/admin/content',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}