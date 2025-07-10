export interface FieldDefinition {
  id: string
  field_name: string
  field_type: string
  field_label: string
  field_options: any // JSON options
  field_order: number
  is_required: boolean
  is_searchable: boolean
}

export interface FieldRenderOptions {
  value?: any
  errors?: string[]
  disabled?: boolean
  className?: string
}

export function renderDynamicField(field: FieldDefinition, options: FieldRenderOptions = {}): string {
  const { value = '', errors = [], disabled = false, className = '' } = options
  const opts = field.field_options || {}
  const required = field.is_required ? 'required' : ''
  const baseClasses = `w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all ${className}`
  const errorClasses = errors.length > 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
  
  const fieldId = `field-${field.field_name}`
  const fieldName = field.field_name
  
  let fieldHTML = ''
  
  switch (field.field_type) {
    case 'text':
      let patternHelp = ''
      let autoSlugScript = ''
      
      if (opts.pattern) {
        if (opts.pattern === '^[a-z0-9-]+$' || opts.pattern === '^[a-zA-Z0-9_-]+$') {
          patternHelp = '<p class="mt-1 text-xs text-gray-400">Use letters, numbers, underscores, and hyphens only</p>'
          
          // Add auto-slug generation for slug fields
          if (fieldName === 'slug') {
            patternHelp += '<button type="button" class="mt-1 text-xs text-blue-400 hover:text-blue-300" onclick="generateSlugFromTitle(\'${fieldId}\')">Generate from title</button>'
            autoSlugScript = `
              <script>
                function generateSlugFromTitle(slugFieldId) {
                  const titleField = document.querySelector('input[name="title"]');
                  const slugField = document.getElementById(slugFieldId);
                  if (titleField && slugField) {
                    const slug = titleField.value
                      .toLowerCase()
                      .replace(/[^a-z0-9\\s_-]/g, '')
                      .replace(/\\s+/g, '-')
                      .replace(/[-_]+/g, '-')
                      .replace(/^[-_]|[-_]$/g, '');
                    slugField.value = slug;
                  }
                }
                
                // Auto-generate slug when title changes
                document.addEventListener('DOMContentLoaded', function() {
                  const titleField = document.querySelector('input[name="title"]');
                  const slugField = document.getElementById('${fieldId}');
                  if (titleField && slugField && !slugField.value) {
                    titleField.addEventListener('input', function() {
                      if (!slugField.value) {
                        generateSlugFromTitle('${fieldId}');
                      }
                    });
                  }
                });
              </script>
            `
          }
        } else {
          patternHelp = '<p class="mt-1 text-xs text-gray-400">Must match required format</p>'
        }
      }
      
      fieldHTML = `
        <input 
          type="text" 
          id="${fieldId}"
          name="${fieldName}"
          value="${escapeHtml(value)}"
          placeholder="${opts.placeholder || ''}"
          maxlength="${opts.maxLength || ''}"
          ${opts.pattern ? `data-pattern="${opts.pattern}"` : ''}
          class="${baseClasses} ${errorClasses}"
          ${required}
          ${disabled ? 'disabled' : ''}
        >
        ${patternHelp}
        ${autoSlugScript}
        ${opts.pattern ? `
        <script>
          (function() {
            const field = document.getElementById('${fieldId}');
            const pattern = new RegExp('${opts.pattern}');
            
            field.addEventListener('input', function() {
              if (this.value && !pattern.test(this.value)) {
                if ('${opts.pattern}' === '^[a-zA-Z0-9_-]+$' || '${opts.pattern}' === '^[a-z0-9-]+$') {
                  this.setCustomValidity('Please use only letters, numbers, underscores, and hyphens.');
                } else {
                  this.setCustomValidity('Please enter a valid format.');
                }
              } else {
                this.setCustomValidity('');
              }
            });
            
            field.addEventListener('blur', function() {
              this.reportValidity();
            });
          })();
        </script>
        ` : ''}
      `
      break
      
    case 'richtext':
      fieldHTML = `
        <div class="richtext-container">
          <textarea 
            id="${fieldId}"
            name="${fieldName}"
            class="${baseClasses} ${errorClasses} min-h-[${opts.height || 300}px]"
            ${required}
            ${disabled ? 'disabled' : ''}
          >${escapeHtml(value)}</textarea>
          <script>
            // Initialize TinyMCE for this field
            if (typeof tinymce !== 'undefined') {
              tinymce.init({
                selector: '#${fieldId}',
                skin: 'oxide-dark',
                content_css: 'dark',
                height: ${opts.height || 300},
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: '${opts.toolbar === 'simple' ? 'bold italic underline | bullist numlist | link' : 
                  'undo redo | blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'}',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; color: #fff; background-color: #1f2937; }',
                setup: function(editor) {
                  editor.on('change', function() {
                    editor.save();
                  });
                }
              });
            }
          </script>
        </div>
      `
      break
      
    case 'number':
      fieldHTML = `
        <input 
          type="number" 
          id="${fieldId}"
          name="${fieldName}"
          value="${value}"
          min="${opts.min || ''}"
          max="${opts.max || ''}"
          step="${opts.step || ''}"
          placeholder="${opts.placeholder || ''}"
          class="${baseClasses} ${errorClasses}"
          ${required}
          ${disabled ? 'disabled' : ''}
        >
      `
      break
      
    case 'boolean':
      const checked = value === true || value === 'true' || value === '1' ? 'checked' : ''
      fieldHTML = `
        <div class="flex items-center space-x-3">
          <input 
            type="checkbox" 
            id="${fieldId}"
            name="${fieldName}"
            value="true"
            class="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
            ${checked}
            ${disabled ? 'disabled' : ''}
          >
          <label for="${fieldId}" class="text-sm text-gray-300">
            ${opts.checkboxLabel || field.field_label}
          </label>
        </div>
        <input type="hidden" name="${fieldName}_submitted" value="1">
      `
      break
      
    case 'date':
      fieldHTML = `
        <input 
          type="date" 
          id="${fieldId}"
          name="${fieldName}"
          value="${value}"
          min="${opts.min || ''}"
          max="${opts.max || ''}"
          class="${baseClasses} ${errorClasses}"
          ${required}
          ${disabled ? 'disabled' : ''}
        >
      `
      break
      
    case 'select':
      const options = opts.options || []
      const multiple = opts.multiple ? 'multiple' : ''
      const selectedValues = Array.isArray(value) ? value : [value]
      
      fieldHTML = `
        <select 
          id="${fieldId}"
          name="${fieldName}${opts.multiple ? '[]' : ''}"
          class="${baseClasses} ${errorClasses}"
          ${multiple}
          ${required}
          ${disabled ? 'disabled' : ''}
        >
          ${!required && !opts.multiple ? '<option value="">Choose an option...</option>' : ''}
          ${options.map((option: any) => {
            const optionValue = typeof option === 'string' ? option : option.value
            const optionLabel = typeof option === 'string' ? option : option.label
            const selected = selectedValues.includes(optionValue) ? 'selected' : ''
            return `<option value="${escapeHtml(optionValue)}" ${selected}>${escapeHtml(optionLabel)}</option>`
          }).join('')}
        </select>
        ${opts.allowCustom ? `
          <div class="mt-2">
            <input 
              type="text" 
              placeholder="Add custom option..."
              class="${baseClasses.replace('border-white/10', 'border-white/5')} text-sm"
              onkeypress="if(event.key==='Enter'){addCustomOption(this, '${fieldId}');event.preventDefault();}"
            >
          </div>
        ` : ''}
      `
      break
      
    case 'media':
      fieldHTML = `
        <div class="media-field-container">
          <input type="hidden" id="${fieldId}" name="${fieldName}" value="${value}">
          <div class="media-preview ${value ? '' : 'hidden'}" id="${fieldId}-preview">
            ${value ? `<img src="${value}" alt="Selected media" class="w-32 h-32 object-cover rounded-lg border border-white/20">` : ''}
          </div>
          <div class="media-actions mt-2 space-x-2">
            <button 
              type="button" 
              onclick="openMediaSelector('${fieldId}')"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
              ${disabled ? 'disabled' : ''}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Select Media
            </button>
            ${value ? `
              <button 
                type="button" 
                onclick="clearMediaField('${fieldId}')"
                class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                ${disabled ? 'disabled' : ''}
              >
                Remove
              </button>
            ` : ''}
          </div>
        </div>
      `
      break
      
    default:
      fieldHTML = `
        <input 
          type="text" 
          id="${fieldId}"
          name="${fieldName}"
          value="${escapeHtml(value)}"
          class="${baseClasses} ${errorClasses}"
          ${required}
          ${disabled ? 'disabled' : ''}
        >
      `
  }
  
  return `
    <div class="form-group mb-6">
      <label for="${fieldId}" class="block text-sm font-medium text-gray-300 mb-2">
        ${escapeHtml(field.field_label)}
        ${field.is_required ? '<span class="text-red-400 ml-1">*</span>' : ''}
      </label>
      ${fieldHTML}
      ${errors.length > 0 ? `
        <div class="mt-2 text-sm text-red-400">
          ${errors.map(error => `<div>${escapeHtml(error)}</div>`).join('')}
        </div>
      ` : ''}
      ${opts.helpText ? `
        <div class="mt-2 text-sm text-gray-400">
          ${escapeHtml(opts.helpText)}
        </div>
      ` : ''}
    </div>
  `
}

export function renderFieldGroup(title: string, fields: string[], collapsible: boolean = false): string {
  const groupId = title.toLowerCase().replace(/\s+/g, '-')
  
  return `
    <div class="field-group backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
      <div class="field-group-header ${collapsible ? 'cursor-pointer' : ''}" ${collapsible ? `onclick="toggleFieldGroup('${groupId}')"` : ''}>
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
          ${escapeHtml(title)}
          ${collapsible ? `
            <svg id="${groupId}-icon" class="w-5 h-5 ml-2 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          ` : ''}
        </h3>
      </div>
      <div id="${groupId}-content" class="field-group-content ${collapsible ? 'collapsible' : ''}">
        ${fields.join('')}
      </div>
    </div>
  `
}

function escapeHtml(text: string): string {
  if (typeof text !== 'string') return String(text || '')
  return text.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char] || char))
}