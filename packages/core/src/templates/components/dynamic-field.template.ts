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
  pluginStatuses?: {
    quillEnabled?: boolean
    mdxeditorEnabled?: boolean
    tinymceEnabled?: boolean
  }
  collectionId?: string
  contentId?: string
}

export function renderDynamicField(field: FieldDefinition, options: FieldRenderOptions = {}): string {
  const { value = '', errors = [], disabled = false, className = '', pluginStatuses = {}, collectionId = '', contentId = '' } = options
  const opts = field.field_options || {}
  const required = field.is_required ? 'required' : ''
  const baseClasses = `w-full rounded-lg px-3 py-2 text-sm text-zinc-950 dark:text-white bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow ${className}`
  const errorClasses = errors.length > 0 ? 'ring-pink-600 dark:ring-pink-500 focus:ring-pink-600 dark:focus:ring-pink-500' : ''

  const fieldId = `field-${field.field_name}`
  const fieldName = field.field_name

  // Check if this is a plugin-based field type and if the plugin is inactive
  // If so, fall back to textarea with a warning
  let fallbackToTextarea = false
  let fallbackWarning = ''

  if (field.field_type === 'quill' && !pluginStatuses.quillEnabled) {
    fallbackToTextarea = true
    fallbackWarning = '⚠️ Quill Editor plugin is inactive. Using textarea fallback.'
  } else if (field.field_type === 'mdxeditor' && !pluginStatuses.mdxeditorEnabled) {
    fallbackToTextarea = true
    fallbackWarning = '⚠️ MDXEditor plugin is inactive. Using textarea fallback.'
  } else if (field.field_type === 'tinymce' && !pluginStatuses.tinymceEnabled) {
    fallbackToTextarea = true
    fallbackWarning = '⚠️ TinyMCE plugin is inactive. Using textarea fallback.'
  }

  // If falling back to textarea, render it with a warning
  if (fallbackToTextarea) {
    return `
      <div>
        ${fallbackWarning ? `<div class="mb-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 text-xs rounded-lg border border-amber-200 dark:border-amber-800">${fallbackWarning}</div>` : ''}
        <textarea
          id="${fieldId}"
          name="${fieldName}"
          rows="${opts.rows || opts.height ? Math.floor(opts.height / 25) : 10}"
          placeholder="${opts.placeholder || ''}"
          maxlength="${opts.maxLength || ''}"
          class="${baseClasses} ${errorClasses} resize-y"
          ${required}
          ${disabled ? 'disabled' : ''}
        >${escapeHtml(value)}</textarea>
      </div>
    `
  }

  let fieldHTML = ''

  switch (field.field_type) {
    case 'text':
      let patternHelp = ''
      let autoSlugScript = ''
      
      if (opts.pattern) {
        if (opts.pattern === '^[a-z0-9-]+$' || opts.pattern === '^[a-zA-Z0-9_-]+$') {
          patternHelp = '<p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Use letters, numbers, underscores, and hyphens only</p>'

          // Add auto-slug generation for slug fields
          if (fieldName === 'slug') {
            patternHelp += '<button type="button" class="mt-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300" onclick="generateSlugFromTitle(\'${fieldId}\')">Generate from title</button>'
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
          patternHelp = '<p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Must match required format</p>'
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

    case 'textarea':
      fieldHTML = `
        <textarea
          id="${fieldId}"
          name="${fieldName}"
          rows="${opts.rows || 6}"
          placeholder="${opts.placeholder || ''}"
          maxlength="${opts.maxLength || ''}"
          class="${baseClasses} ${errorClasses} resize-y"
          ${required}
          ${disabled ? 'disabled' : ''}
        >${escapeHtml(value)}</textarea>
      `
      break

    case 'richtext':
      fieldHTML = `
        <div class="richtext-container" data-height="${opts.height || 300}" data-toolbar="${opts.toolbar || 'full'}">
          <textarea
            id="${fieldId}"
            name="${fieldName}"
            class="${baseClasses} ${errorClasses} min-h-[${opts.height || 300}px]"
            ${required}
            ${disabled ? 'disabled' : ''}
          >${escapeHtml(value)}</textarea>
        </div>
      `
      break

    case 'quill':
      // Quill WYSIWYG Editor
      fieldHTML = `
        <div class="quill-editor-container" data-field-id="${fieldId}">
          <!-- Quill Editor Container -->
          <div
            id="${fieldId}-editor"
            class="quill-editor bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            data-theme="${opts.theme || 'snow'}"
            data-toolbar="${opts.toolbar || 'full'}"
            data-placeholder="${opts.placeholder || 'Enter content...'}"
            data-height="${opts.height || 300}"
          >${value}</div>

          <!-- Hidden input to store the actual content for form submission -->
          <input
            type="hidden"
            id="${fieldId}"
            name="${fieldName}"
            value="${escapeHtml(value)}"
          >
        </div>
      `
      break

    case 'mdxeditor':
      // MDXEditor Rich Text Editor - renders same container as richtext
      // The MDXEditor plugin initialization script will handle the editor initialization
      fieldHTML = `
        <div class="richtext-container" data-height="${opts.height || 300}" data-toolbar="${opts.toolbar || 'full'}">
          <textarea
            id="${fieldId}"
            name="${fieldName}"
            class="${baseClasses} ${errorClasses} min-h-[${opts.height || 300}px]"
            ${required}
            ${disabled ? 'disabled' : ''}
          >${escapeHtml(value)}</textarea>
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

    case 'datetime':
      fieldHTML = `
        <input
          type="datetime-local"
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

    case 'slug':
      // Slug fields with auto-generation and duplicate detection
      const slugPattern = opts.pattern || '^[a-z0-9-]+$'
      const collectionIdValue = collectionId || opts.collectionId || ''
      const contentIdValue = contentId || opts.contentId || ''
      const isEditMode = !!value
      
      fieldHTML = `
        <div class="slug-field-container">
          <input
            type="text"
            id="${fieldId}"
            name="${fieldName}"
            value="${escapeHtml(value)}"
            placeholder="${opts.placeholder || 'url-friendly-slug'}"
            maxlength="${opts.maxLength || 100}"
            data-pattern="${slugPattern}"
            data-collection-id="${collectionIdValue}"
            data-content-id="${contentIdValue}"
            data-is-edit-mode="${isEditMode}"
            class="${baseClasses} ${errorClasses}"
            ${required}
            ${disabled ? 'disabled' : ''}
          >
          <div id="${fieldId}-status" class="slug-status mt-1 text-sm min-h-[20px]"></div>
          <button 
            type="button" 
            class="regenerate-slug-btn mt-2 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors"
            onclick="window.regenerateSlugFromTitle_${fieldId.replace(/-/g, '_')}()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Regenerate from title
          </button>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Use lowercase letters, numbers, and hyphens only</p>
        </div>
        
        <script>
          (function() {
            const slugField = document.getElementById('${fieldId}');
            const statusDiv = document.getElementById('${fieldId}-status');
            const isEditMode = slugField.dataset.isEditMode === 'true';
            const pattern = new RegExp('${slugPattern}');
            const collectionId = slugField.dataset.collectionId;
            const contentId = slugField.dataset.contentId;
            
            let checkTimeout;
            let lastCheckedSlug = '';
            let manuallyEdited = false;
            
            // Shared slug generation function
            function generateSlug(text) {
              if (!text) return '';
              
              return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\\u0300-\\u036f]/g, '')
                .replace(/[^a-z0-9\\s_-]/g, '')
                .replace(/\\s+/g, '-')
                .replace(/[-_]+/g, '-')
                .replace(/^[-_]+|[-_]+$/g, '')
                .substring(0, 100);
            }
            
            // Check if slug is available
            async function checkSlugAvailability(slug) {
              if (!slug || !collectionId) return;
              
              // Don't check if it's the same as last time
              if (slug === lastCheckedSlug) return;
              lastCheckedSlug = slug;
              
              try {
                // Show checking status
                statusDiv.innerHTML = '<span class="text-gray-400">⏳ Checking availability...</span>';
                
                // Build URL
                let url = \`/api/content/check-slug?collectionId=\${encodeURIComponent(collectionId)}&slug=\${encodeURIComponent(slug)}\`;
                if (contentId) {
                  url += \`&excludeId=\${encodeURIComponent(contentId)}\`;
                }
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.available) {
                  statusDiv.innerHTML = '<span class="text-green-500 dark:text-green-400">✓ Available</span>';
                  slugField.setCustomValidity('');
                } else {
                  statusDiv.innerHTML = \`<span class="text-red-500 dark:text-red-400">✗ \${data.message || 'Already in use'}</span>\`;
                  slugField.setCustomValidity(data.message || 'This slug is already in use');
                }
              } catch (error) {
                console.error('Error checking slug:', error);
                statusDiv.innerHTML = '<span class="text-yellow-500 dark:text-yellow-400">⚠ Could not verify</span>';
              }
            }
            
            // Format validation and duplicate checking
            slugField.addEventListener('input', function() {
              const value = this.value;
              
              // Mark as manually edited if user types directly
              if (document.activeElement === this) {
                manuallyEdited = true;
              }
              
              // Clear status if empty
              if (!value) {
                statusDiv.innerHTML = '';
                this.setCustomValidity('');
                return;
              }
              
              // Pattern validation
              if (!pattern.test(value)) {
                this.setCustomValidity('Please use only lowercase letters, numbers, and hyphens.');
                statusDiv.innerHTML = '<span class="text-red-500 dark:text-red-400">✗ Invalid format</span>';
                return;
              }
              
              // Debounce the availability check
              clearTimeout(checkTimeout);
              checkTimeout = setTimeout(() => {
                checkSlugAvailability(value);
              }, 500); // Wait 500ms after user stops typing
            });
            
            // Initial check if field has value
            if (slugField.value) {
              checkSlugAvailability(slugField.value);
            }
            
            // Auto-generate only in create mode
            // Wait for all fields to be rendered before attaching listeners
            if (!isEditMode) {
              // Use setTimeout to ensure all fields in the form are rendered
              setTimeout(() => {
                const titleField = document.querySelector('input[name="title"]');
                if (titleField) {
                  titleField.addEventListener('input', function() {
                    if (!manuallyEdited) {
                      const slug = generateSlug(this.value);
                      slugField.value = slug;
                      
                      // Trigger validation and duplicate check
                      slugField.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  });
                }
              }, 0);
            }
            
            // Global function for regenerate button
            window.regenerateSlugFromTitle_${fieldId.replace(/-/g, '_')} = function() {
              const titleField = document.querySelector('input[name="title"]');
              if (titleField && slugField) {
                const slug = generateSlug(titleField.value);
                slugField.value = slug;
                manuallyEdited = false;
                
                // Trigger validation and duplicate check
                slugField.dispatchEvent(new Event('input', { bubbles: true }));
              }
            };
          })();
        </script>
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
    <div class="form-group">
      <label for="${fieldId}" class="block text-sm/6 font-medium text-zinc-950 dark:text-white mb-2">
        ${escapeHtml(field.field_label)}
        ${field.is_required ? '<span class="text-pink-600 dark:text-pink-400 ml-1">*</span>' : ''}
      </label>
      ${fieldHTML}
      ${errors.length > 0 ? `
        <div class="mt-2 text-sm text-pink-600 dark:text-pink-400">
          ${errors.map(error => `<div>${escapeHtml(error)}</div>`).join('')}
        </div>
      ` : ''}
      ${opts.helpText ? `
        <div class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          ${escapeHtml(opts.helpText)}
        </div>
      ` : ''}
    </div>
  `
}

export function renderFieldGroup(title: string, fields: string[], collapsible: boolean = false): string {
  const groupId = title.toLowerCase().replace(/\s+/g, '-')

  return `
    <div class="field-group rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 mb-6">
      <div class="field-group-header border-b border-zinc-950/5 dark:border-white/10 px-6 py-4 ${collapsible ? 'cursor-pointer' : ''}" ${collapsible ? `onclick="toggleFieldGroup('${groupId}')"` : ''}>
        <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white flex items-center">
          ${escapeHtml(title)}
          ${collapsible ? `
            <svg id="${groupId}-icon" class="w-5 h-5 ml-2 transform transition-transform text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          ` : ''}
        </h3>
      </div>
      <div id="${groupId}-content" class="field-group-content px-6 py-6 space-y-6 ${collapsible ? 'collapsible' : ''}">
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