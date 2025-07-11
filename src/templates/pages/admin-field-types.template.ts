import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'

export interface FieldTypeDefinition {
  name: string
  displayName: string
  description: string
  category: string
  icon: string
  dataType: string
  supportedOptions: FieldOption[]
  validations: ValidationRule[]
  examples: FieldExample[]
  useCases: string[]
  htmlInputType?: string
  requiresScript?: boolean
  storageFormat: string
}

export interface FieldOption {
  name: string
  type: string
  required: boolean
  defaultValue?: any
  description: string
  validation?: string
  examples?: string[]
}

export interface ValidationRule {
  name: string
  description: string
  implementation: string
  example: string
}

export interface FieldExample {
  title: string
  configuration: any
  sampleValue: any
  renderedOutput: string
}

export interface FieldTypesPageData {
  fieldTypes: FieldTypeDefinition[]
  user?: {
    name: string
    email: string
    role: string
  }
}

export function getFieldTypeDefinitions(): FieldTypeDefinition[] {
  return [
    {
      name: 'text',
      displayName: 'Text',
      description: 'Single-line text input for short strings, names, titles, etc.',
      category: 'Basic',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
      </svg>`,
      dataType: 'string',
      htmlInputType: 'text',
      storageFormat: 'VARCHAR(255)',
      supportedOptions: [
        {
          name: 'placeholder',
          type: 'string',
          required: false,
          description: 'Placeholder text shown when field is empty',
          examples: ['Enter your name', 'e.g. My Article Title']
        },
        {
          name: 'maxLength',
          type: 'number',
          required: false,
          description: 'Maximum number of characters allowed',
          validation: 'Must be positive integer',
          examples: ['50', '255', '500']
        },
        {
          name: 'pattern',
          type: 'string',
          required: false,
          description: 'Regular expression pattern for validation',
          examples: ['^[a-zA-Z0-9_-]+$', '^[a-z0-9-]+$']
        },
        {
          name: 'helpText',
          type: 'string',
          required: false,
          description: 'Help text displayed below the field',
          examples: ['Use only letters, numbers, and hyphens']
        }
      ],
      validations: [
        {
          name: 'Required',
          description: 'Field must have a value',
          implementation: 'HTML5 required attribute + server-side check',
          example: 'if (!value || value.trim() === "") throw new Error("Field is required")'
        },
        {
          name: 'Max Length',
          description: 'Value cannot exceed specified character limit',
          implementation: 'HTML maxlength attribute + server-side validation',
          example: 'if (value.length > maxLength) throw new Error("Too long")'
        },
        {
          name: 'Pattern Matching',
          description: 'Value must match regular expression pattern',
          implementation: 'JavaScript regex validation + HTML5 pattern',
          example: 'if (!pattern.test(value)) throw new Error("Invalid format")'
        }
      ],
      examples: [
        {
          title: 'Basic Text Field',
          configuration: { placeholder: 'Enter title', maxLength: 100 },
          sampleValue: 'My Blog Post Title',
          renderedOutput: '<input type="text" placeholder="Enter title" maxlength="100">'
        },
        {
          title: 'Slug Field with Pattern',
          configuration: { pattern: '^[a-z0-9-]+$', placeholder: 'my-url-slug' },
          sampleValue: 'my-blog-post-slug',
          renderedOutput: '<input type="text" pattern="^[a-z0-9-]+$" placeholder="my-url-slug">'
        }
      ],
      useCases: [
        'Article titles and headings',
        'Names and labels',
        'URLs and slugs',
        'Short descriptions',
        'Tags and keywords'
      ]
    },
    {
      name: 'richtext',
      displayName: 'Rich Text',
      description: 'WYSIWYG editor for formatted content with HTML support',
      category: 'Content',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>`,
      dataType: 'string',
      storageFormat: 'TEXT',
      requiresScript: true,
      supportedOptions: [
        {
          name: 'height',
          type: 'number',
          required: false,
          defaultValue: 300,
          description: 'Editor height in pixels',
          examples: ['200', '400', '600']
        },
        {
          name: 'toolbar',
          type: 'string',
          required: false,
          defaultValue: 'full',
          description: 'Toolbar configuration - "simple" or "full"',
          examples: ['simple', 'full']
        },
        {
          name: 'allowImages',
          type: 'boolean',
          required: false,
          defaultValue: true,
          description: 'Allow image insertion in editor'
        }
      ],
      validations: [
        {
          name: 'Required',
          description: 'Editor content cannot be empty',
          implementation: 'Check for non-empty HTML content excluding tags',
          example: 'if (stripHtml(value).trim() === "") throw new Error("Content required")'
        },
        {
          name: 'HTML Sanitization',
          description: 'Remove dangerous HTML tags and attributes',
          implementation: 'Server-side HTML sanitization library',
          example: 'sanitizeHtml(value, allowedTags, allowedAttributes)'
        }
      ],
      examples: [
        {
          title: 'Article Content Editor',
          configuration: { height: 400, toolbar: 'full' },
          sampleValue: '<h2>Introduction</h2><p>This is <strong>rich</strong> content...</p>',
          renderedOutput: 'TinyMCE editor with full toolbar'
        },
        {
          title: 'Simple Comment Editor',
          configuration: { height: 150, toolbar: 'simple' },
          sampleValue: '<p>A simple comment with <em>basic</em> formatting.</p>',
          renderedOutput: 'TinyMCE editor with limited toolbar'
        }
      ],
      useCases: [
        'Article and blog post content',
        'Product descriptions',
        'About pages and long-form content',
        'Email templates',
        'Documentation'
      ]
    },
    {
      name: 'number',
      displayName: 'Number',
      description: 'Numeric input with validation for integers and decimals',
      category: 'Basic',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
      </svg>`,
      dataType: 'number',
      htmlInputType: 'number',
      storageFormat: 'DECIMAL(10,2)',
      supportedOptions: [
        {
          name: 'min',
          type: 'number',
          required: false,
          description: 'Minimum allowed value',
          examples: ['0', '1', '-100']
        },
        {
          name: 'max',
          type: 'number',
          required: false,
          description: 'Maximum allowed value',
          examples: ['100', '999', '10000']
        },
        {
          name: 'step',
          type: 'number',
          required: false,
          defaultValue: 1,
          description: 'Step increment for number controls',
          examples: ['1', '0.01', '5', '10']
        },
        {
          name: 'placeholder',
          type: 'string',
          required: false,
          description: 'Placeholder text',
          examples: ['Enter amount', '0.00']
        }
      ],
      validations: [
        {
          name: 'Required',
          description: 'Field must have a numeric value',
          implementation: 'Check for non-null, non-undefined numeric value',
          example: 'if (value === null || value === undefined) throw new Error("Required")'
        },
        {
          name: 'Min/Max Range',
          description: 'Value must be within specified range',
          implementation: 'Numeric comparison validation',
          example: 'if (value < min || value > max) throw new Error("Out of range")'
        },
        {
          name: 'Step Validation',
          description: 'Value must be a valid step increment',
          implementation: 'Modulo operation to check step alignment',
          example: 'if ((value - min) % step !== 0) throw new Error("Invalid step")'
        }
      ],
      examples: [
        {
          title: 'Price Field',
          configuration: { min: 0, step: 0.01, placeholder: '0.00' },
          sampleValue: 29.99,
          renderedOutput: '<input type="number" min="0" step="0.01" placeholder="0.00">'
        },
        {
          title: 'Age Field',
          configuration: { min: 0, max: 150, step: 1 },
          sampleValue: 25,
          renderedOutput: '<input type="number" min="0" max="150" step="1">'
        }
      ],
      useCases: [
        'Prices and monetary values',
        'Quantities and counts',
        'Ages and years',
        'Ratings and scores',
        'Measurements and dimensions'
      ]
    },
    {
      name: 'boolean',
      displayName: 'Boolean (Checkbox)',
      description: 'True/false toggle using checkbox input',
      category: 'Basic',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      dataType: 'boolean',
      htmlInputType: 'checkbox',
      storageFormat: 'BOOLEAN',
      supportedOptions: [
        {
          name: 'checkboxLabel',
          type: 'string',
          required: false,
          description: 'Label text displayed next to checkbox',
          examples: ['Enable notifications', 'I agree to terms', 'Published']
        },
        {
          name: 'defaultValue',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Default checked state'
        }
      ],
      validations: [
        {
          name: 'Required (when needed)',
          description: 'Checkbox must be checked for required boolean fields',
          implementation: 'Check if value is true when field is required',
          example: 'if (required && !value) throw new Error("Must be checked")'
        }
      ],
      examples: [
        {
          title: 'Published Status',
          configuration: { checkboxLabel: 'Published', defaultValue: false },
          sampleValue: true,
          renderedOutput: '<input type="checkbox" checked> <label>Published</label>'
        },
        {
          title: 'Terms Agreement',
          configuration: { checkboxLabel: 'I agree to the terms of service' },
          sampleValue: false,
          renderedOutput: '<input type="checkbox"> <label>I agree to the terms of service</label>'
        }
      ],
      useCases: [
        'Published/Draft status',
        'Feature toggles',
        'User preferences',
        'Terms and conditions',
        'Enable/disable options'
      ]
    },
    {
      name: 'date',
      displayName: 'Date',
      description: 'Date picker for selecting calendar dates',
      category: 'Basic',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>`,
      dataType: 'string',
      htmlInputType: 'date',
      storageFormat: 'DATE',
      supportedOptions: [
        {
          name: 'min',
          type: 'string',
          required: false,
          description: 'Minimum allowed date (YYYY-MM-DD format)',
          examples: ['2024-01-01', '1900-01-01']
        },
        {
          name: 'max',
          type: 'string',
          required: false,
          description: 'Maximum allowed date (YYYY-MM-DD format)',
          examples: ['2030-12-31', '2024-12-31']
        },
        {
          name: 'defaultToday',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Set today as default value'
        }
      ],
      validations: [
        {
          name: 'Required',
          description: 'Date must be selected',
          implementation: 'Check for valid date value',
          example: 'if (!value || !isValidDate(value)) throw new Error("Date required")'
        },
        {
          name: 'Date Range',
          description: 'Date must be within specified range',
          implementation: 'Date comparison validation',
          example: 'if (date < minDate || date > maxDate) throw new Error("Date out of range")'
        },
        {
          name: 'Format Validation',
          description: 'Date must be in correct format',
          implementation: 'ISO date string validation',
          example: 'if (!/\\d{4}-\\d{2}-\\d{2}/.test(value)) throw new Error("Invalid format")'
        }
      ],
      examples: [
        {
          title: 'Birth Date',
          configuration: { min: '1900-01-01', max: '2024-12-31' },
          sampleValue: '1990-05-15',
          renderedOutput: '<input type="date" min="1900-01-01" max="2024-12-31">'
        },
        {
          title: 'Event Date',
          configuration: { min: '2024-01-01', defaultToday: true },
          sampleValue: '2024-07-15',
          renderedOutput: '<input type="date" min="2024-01-01" value="2024-07-10">'
        }
      ],
      useCases: [
        'Birth dates and anniversaries',
        'Event and meeting dates',
        'Deadlines and due dates',
        'Publication dates',
        'Historical dates'
      ]
    },
    {
      name: 'select',
      displayName: 'Select (Dropdown)',
      description: 'Dropdown menu for selecting from predefined options',
      category: 'Selection',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
      </svg>`,
      dataType: 'string|array',
      storageFormat: 'VARCHAR(255) or JSON',
      supportedOptions: [
        {
          name: 'options',
          type: 'array',
          required: true,
          description: 'Array of options with value and label',
          examples: ['[{value: "red", label: "Red"}, {value: "blue", label: "Blue"}]']
        },
        {
          name: 'multiple',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Allow multiple selections'
        },
        {
          name: 'allowCustom',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Allow users to add custom options'
        },
        {
          name: 'searchable',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Enable search/filter functionality'
        }
      ],
      validations: [
        {
          name: 'Required',
          description: 'At least one option must be selected',
          implementation: 'Check for non-empty selection',
          example: 'if (!value || (Array.isArray(value) && value.length === 0)) throw new Error("Selection required")'
        },
        {
          name: 'Valid Option',
          description: 'Selected value must be in allowed options',
          implementation: 'Check against predefined option values',
          example: 'if (!allowedValues.includes(value)) throw new Error("Invalid selection")'
        },
        {
          name: 'Multiple Selection Limit',
          description: 'Number of selections must be within limits',
          implementation: 'Array length validation for multiple select',
          example: 'if (values.length > maxSelections) throw new Error("Too many selections")'
        }
      ],
      examples: [
        {
          title: 'Status Dropdown',
          configuration: { 
            options: [
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' }
            ]
          },
          sampleValue: 'published',
          renderedOutput: '<select><option value="draft">Draft</option><option value="published" selected>Published</option></select>'
        },
        {
          title: 'Multi-select Tags',
          configuration: {
            multiple: true,
            options: [
              { value: 'tech', label: 'Technology' },
              { value: 'design', label: 'Design' },
              { value: 'marketing', label: 'Marketing' }
            ]
          },
          sampleValue: ['tech', 'design'],
          renderedOutput: '<select multiple><option value="tech" selected>Technology</option><option value="design" selected>Design</option></select>'
        }
      ],
      useCases: [
        'Status and state selection',
        'Category and tag assignment',
        'Country and region selection',
        'Priority and importance levels',
        'Role and permission assignment'
      ]
    },
    {
      name: 'media',
      displayName: 'Media',
      description: 'File upload and selection for images, videos, and documents',
      category: 'Media',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>`,
      dataType: 'string',
      storageFormat: 'VARCHAR(500)',
      requiresScript: true,
      supportedOptions: [
        {
          name: 'allowedTypes',
          type: 'array',
          required: false,
          defaultValue: ['image/*'],
          description: 'Allowed file MIME types',
          examples: ['["image/*"]', '["image/jpeg", "image/png"]', '["video/*", "image/*"]']
        },
        {
          name: 'maxFileSize',
          type: 'number',
          required: false,
          defaultValue: 10485760,
          description: 'Maximum file size in bytes',
          examples: ['1048576', '5242880', '10485760']
        },
        {
          name: 'multiple',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Allow multiple file selection'
        },
        {
          name: 'autoUpload',
          type: 'boolean',
          required: false,
          defaultValue: true,
          description: 'Automatically upload files on selection'
        }
      ],
      validations: [
        {
          name: 'Required',
          description: 'Media file must be selected',
          implementation: 'Check for valid file URL or path',
          example: 'if (!value || !isValidUrl(value)) throw new Error("Media file required")'
        },
        {
          name: 'File Type',
          description: 'File must be of allowed type',
          implementation: 'MIME type validation',
          example: 'if (!allowedTypes.includes(file.type)) throw new Error("Invalid file type")'
        },
        {
          name: 'File Size',
          description: 'File size must be within limits',
          implementation: 'File size validation',
          example: 'if (file.size > maxFileSize) throw new Error("File too large")'
        }
      ],
      examples: [
        {
          title: 'Profile Image',
          configuration: { allowedTypes: ['image/jpeg', 'image/png'], maxFileSize: 2097152 },
          sampleValue: '/media/profile-image.jpg',
          renderedOutput: 'Media selector with image preview'
        },
        {
          title: 'Document Attachment',
          configuration: { allowedTypes: ['application/pdf', 'application/msword'], multiple: true },
          sampleValue: ['/media/document1.pdf', '/media/document2.docx'],
          renderedOutput: 'Media selector for multiple documents'
        }
      ],
      useCases: [
        'Featured images and thumbnails',
        'Profile pictures and avatars',
        'Document attachments',
        'Gallery and portfolio images',
        'Video and audio content'
      ]
    }
  ]
}

export function renderFieldTypesPage(data: FieldTypesPageData): string {
  const pageContent = `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">Field Types Reference</h1>
          <p class="mt-2 text-sm text-gray-300">Complete reference for all available field types, their options, and validations</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button 
            onclick="exportFieldTypes()" 
            class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/20 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/30 transition-all"
          >
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Export Reference
          </button>
        </div>
      </div>

      <!-- Categories Filter -->
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-white">Filter by Category</h3>
          <button 
            onclick="showAllFieldTypes()" 
            class="text-sm text-blue-400 hover:text-blue-300"
          >
            Show All
          </button>
        </div>
        <div class="flex flex-wrap gap-2" id="category-filters">
          ${getUniqueCategories(data.fieldTypes).map(category => `
            <button 
              onclick="filterByCategory('${category}')"
              class="px-3 py-1 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all category-filter"
              data-category="${category}"
            >
              ${category}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Field Types Grid -->
      <div class="grid gap-6" id="field-types-container">
        ${data.fieldTypes.map(fieldType => renderFieldTypeCard(fieldType)).join('')}
      </div>
    </div>

    <!-- Scripts -->
    <script>
      function filterByCategory(category) {
        const cards = document.querySelectorAll('.field-type-card');
        const filters = document.querySelectorAll('.category-filter');
        
        // Update filter button states
        filters.forEach(f => f.classList.remove('bg-blue-500/30', 'border-blue-400'));
        document.querySelector(\`[data-category="\${category}"]\`)?.classList.add('bg-blue-500/30', 'border-blue-400');
        
        // Filter cards
        cards.forEach(card => {
          const cardCategory = card.dataset.category;
          if (cardCategory === category) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      }

      function showAllFieldTypes() {
        const cards = document.querySelectorAll('.field-type-card');
        const filters = document.querySelectorAll('.category-filter');
        
        filters.forEach(f => f.classList.remove('bg-blue-500/30', 'border-blue-400'));
        cards.forEach(card => card.style.display = 'block');
      }

      function toggleSection(fieldType, section) {
        const element = document.getElementById(\`\${fieldType}-\${section}\`);
        const icon = document.getElementById(\`\${fieldType}-\${section}-icon\`);
        
        if (element.style.display === 'none') {
          element.style.display = 'block';
          icon.style.transform = 'rotate(180deg)';
        } else {
          element.style.display = 'none';
          icon.style.transform = 'rotate(0deg)';
        }
      }

      function copyExample(text) {
        navigator.clipboard.writeText(text).then(() => {
          // Simple feedback
          const button = event.target;
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          setTimeout(() => button.textContent = originalText, 1000);
        });
      }

      function exportFieldTypes() {
        const data = ${JSON.stringify(data.fieldTypes, null, 2)};
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sonicjs-field-types-reference.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: 'Field Types Reference',
    pageTitle: 'Field Types Reference',
    currentPath: '/admin/field-types',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}

function getUniqueCategories(fieldTypes: FieldTypeDefinition[]): string[] {
  const categories = new Set<string>()
  fieldTypes.forEach(ft => categories.add(ft.category))
  return Array.from(categories).sort()
}

function renderFieldTypeCard(fieldType: FieldTypeDefinition): string {
  return `
    <div class="field-type-card backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6" data-category="${fieldType.category}">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
            ${fieldType.icon}
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">${fieldType.displayName}</h3>
            <p class="text-sm text-gray-400">${fieldType.category} • ${fieldType.dataType}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-md font-mono">${fieldType.name}</span>
          ${fieldType.requiresScript ? '<span class="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-md">Script</span>' : ''}
        </div>
      </div>

      <!-- Description -->
      <p class="text-gray-300 mb-6">${fieldType.description}</p>

      <!-- Storage & Technical Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-800/50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-gray-300 mb-1">Storage Format</h4>
          <code class="text-xs text-green-400">${fieldType.storageFormat}</code>
        </div>
        ${fieldType.htmlInputType ? `
          <div class="bg-gray-800/50 rounded-lg p-3">
            <h4 class="text-sm font-medium text-gray-300 mb-1">HTML Input Type</h4>
            <code class="text-xs text-blue-400">${fieldType.htmlInputType}</code>
          </div>
        ` : ''}
      </div>

      <!-- Collapsible Sections -->
      <div class="space-y-4">
        <!-- Options -->
        <div class="border border-white/10 rounded-lg">
          <button 
            class="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-all"
            onclick="toggleSection('${fieldType.name}', 'options')"
          >
            <span class="font-medium text-white">Configuration Options (${fieldType.supportedOptions.length})</span>
            <svg id="${fieldType.name}-options-icon" class="w-4 h-4 text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div id="${fieldType.name}-options" style="display: none;" class="px-3 pb-3">
            <div class="space-y-3">
              ${fieldType.supportedOptions.map(option => `
                <div class="bg-gray-800/30 rounded-lg p-3">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <code class="text-blue-400 font-medium">${option.name}</code>
                      <span class="ml-2 text-xs text-gray-500">${option.type}</span>
                      ${option.required ? '<span class="ml-1 text-red-400 text-xs">required</span>' : ''}
                    </div>
                    ${option.defaultValue !== undefined ? `<span class="text-xs text-gray-400">default: <code class="text-green-400">${JSON.stringify(option.defaultValue)}</code></span>` : ''}
                  </div>
                  <p class="text-sm text-gray-300 mb-2">${option.description}</p>
                  ${option.examples ? `
                    <div class="text-xs text-gray-400">
                      Examples: ${option.examples.map(ex => `<code class="text-purple-400">${ex}</code>`).join(', ')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Validations -->
        <div class="border border-white/10 rounded-lg">
          <button 
            class="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-all"
            onclick="toggleSection('${fieldType.name}', 'validations')"
          >
            <span class="font-medium text-white">Validation Rules (${fieldType.validations.length})</span>
            <svg id="${fieldType.name}-validations-icon" class="w-4 h-4 text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div id="${fieldType.name}-validations" style="display: none;" class="px-3 pb-3">
            <div class="space-y-3">
              ${fieldType.validations.map(validation => `
                <div class="bg-gray-800/30 rounded-lg p-3">
                  <h5 class="text-yellow-400 font-medium mb-1">${validation.name}</h5>
                  <p class="text-sm text-gray-300 mb-2">${validation.description}</p>
                  <div class="text-xs text-gray-400 mb-2">Implementation: ${validation.implementation}</div>
                  <div class="bg-gray-900/50 rounded p-2">
                    <code class="text-xs text-green-400">${validation.example}</code>
                    <button 
                      onclick="copyExample('${validation.example.replace(/'/g, "\\'")}')"
                      class="ml-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Examples -->
        <div class="border border-white/10 rounded-lg">
          <button 
            class="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-all"
            onclick="toggleSection('${fieldType.name}', 'examples')"
          >
            <span class="font-medium text-white">Usage Examples (${fieldType.examples.length})</span>
            <svg id="${fieldType.name}-examples-icon" class="w-4 h-4 text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div id="${fieldType.name}-examples" style="display: none;" class="px-3 pb-3">
            <div class="space-y-3">
              ${fieldType.examples.map(example => `
                <div class="bg-gray-800/30 rounded-lg p-3">
                  <h5 class="text-purple-400 font-medium mb-2">${example.title}</h5>
                  <div class="grid gap-2 text-xs">
                    <div>
                      <span class="text-gray-400">Configuration:</span>
                      <div class="bg-gray-900/50 rounded p-2 mt-1">
                        <code class="text-blue-400">${JSON.stringify(example.configuration, null, 2)}</code>
                      </div>
                    </div>
                    <div>
                      <span class="text-gray-400">Sample Value:</span>
                      <div class="bg-gray-900/50 rounded p-2 mt-1">
                        <code class="text-green-400">${JSON.stringify(example.sampleValue)}</code>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Use Cases -->
        <div class="border border-white/10 rounded-lg">
          <button 
            class="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-all"
            onclick="toggleSection('${fieldType.name}', 'usecases')"
          >
            <span class="font-medium text-white">Common Use Cases</span>
            <svg id="${fieldType.name}-usecases-icon" class="w-4 h-4 text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div id="${fieldType.name}-usecases" style="display: none;" class="px-3 pb-3">
            <ul class="space-y-1">
              ${fieldType.useCases.map(useCase => `
                <li class="text-sm text-gray-300 flex items-center">
                  <svg class="w-3 h-3 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  ${useCase}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
}