import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout.template'
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
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          ${renderAlert({
            type: 'warning',
            title: 'No Content Models Available',
            message: 'Please create a collection first before adding content.',
            className: 'mb-4'
          })}
          <div class="text-center">
            <a href="/admin/collections/new" class="btn btn-primary">Create a Collection</a>
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
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Breadcrumb -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <a href="/admin/content" class="text-gray-400 hover:text-gray-500">
              <svg class="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L3 11.414A2 2 0 013 8.586L6.586 5H9a1 1 0 010 2H7.414L4.707 9.707a1 1 0 000 1.414L7.414 14H9a1 1 0 010 2H6.586l-3.293-3.293z" clip-rule="evenodd" />
              </svg>
            </a>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <a href="/admin/content" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">Content</a>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="ml-4 text-sm font-medium text-gray-500">New</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Main Form -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        ${data.error ? renderAlert({ type: 'error', message: data.error, dismissible: true }) : ''}
        ${data.success ? renderAlert({ type: 'success', message: data.success, dismissible: true }) : ''}
        
        ${renderForm(formData)}
        
        <!-- Dynamic Fields Container -->
        <div id="dynamic-fields"></div>
        
        <!-- Cancel Link -->
        <div class="mt-6 pt-6 border-t">
          <a href="/admin/content" class="text-gray-600 hover:text-gray-900">← Cancel and return to content list</a>
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