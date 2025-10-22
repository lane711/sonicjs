import { init_admin_layout_catalyst_template, init_logo_template } from './chunk-P3VS4DV3.js';

// src/templates/form.template.ts
function renderForm(data) {
  return `
    <form 
      ${data.id ? `id="${data.id}"` : ""}
      ${data.hxPost ? `hx-post="${data.hxPost}"` : data.hxPut ? `hx-put="${data.hxPut}"` : data.action ? `action="${data.action}"` : ""}
      ${data.hxTarget ? `hx-target="${data.hxTarget}"` : ""}
      method="${data.method || "POST"}"
      class="${data.className || "space-y-6"}"
      ${data.fields.some((f) => f.type === "file") ? 'enctype="multipart/form-data"' : ""}
    >
      ${data.title ? `
        <div class="mb-6">
          <h2 class="text-lg font-medium text-gray-1">${data.title}</h2>
          ${data.description ? `<p class="mt-1 text-sm text-gray-4">${data.description}</p>` : ""}
        </div>
      ` : ""}
      
      <div id="form-messages"></div>
      
      ${data.fields.map((field) => renderFormField(field)).join("")}
      
      <div class="flex justify-between items-center pt-6 border-t border-gray-7">
        <div class="flex space-x-4">
          ${data.submitButtons.map((button) => `
            <button 
              type="${button.type || "submit"}"
              ${button.name ? `name="${button.name}"` : ""}
              ${button.value ? `value="${button.value}"` : ""}
              ${button.onclick ? `onclick="${button.onclick}"` : ""}
              class="btn ${button.className || "btn-primary"}"
            >
              ${button.label}
            </button>
          `).join("")}
        </div>
      </div>
    </form>
  `;
}
function renderFormField(field) {
  const fieldId = `field-${field.name}`;
  const required = field.required ? "required" : "";
  const readonly = field.readonly ? "readonly" : "";
  const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : "";
  let fieldHTML = "";
  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "date":
      fieldHTML = `
        <input
          type="${field.type === "date" ? "datetime-local" : field.type}"
          id="${fieldId}"
          name="${field.name}"
          value="${field.value || ""}"
          class="form-input ${field.className || ""}"
          ${placeholder}
          ${required}
          ${readonly}
          ${field.validation?.min !== void 0 ? `min="${field.validation.min}"` : ""}
          ${field.validation?.max !== void 0 ? `max="${field.validation.max}"` : ""}
          ${field.validation?.pattern ? `pattern="${field.validation.pattern}"` : ""}
        >
      `;
      break;
    case "textarea":
      fieldHTML = `
        <textarea 
          id="${fieldId}"
          name="${field.name}" 
          class="form-textarea ${field.className || ""}" 
          rows="${field.rows || 4}"
          ${placeholder}
          ${required}
        >${field.value || ""}</textarea>
      `;
      break;
    case "rich_text":
      const uniqueId = `${field.name}-${Date.now()}`;
      fieldHTML = `
        <div class="markdown-field">
          <textarea id="${uniqueId}" name="${field.name}" class="form-textarea" rows="8">${field.value || ""}</textarea>
          <script>
            if (typeof EasyMDE !== 'undefined') {
              new EasyMDE({
                element: document.getElementById('${uniqueId}'),
                minHeight: '300px',
                spellChecker: false,
                status: ['autosave', 'lines', 'words', 'cursor'],
                autosave: {
                  enabled: true,
                  uniqueId: '${uniqueId}',
                  delay: 1000
                },
                renderingConfig: {
                  singleLineBreaks: false,
                  codeSyntaxHighlighting: true
                }
              });
            }
          </script>
        </div>
      `;
      break;
    case "select":
      fieldHTML = `
        <select 
          id="${fieldId}"
          name="${field.name}" 
          class="form-input ${field.className || ""}" 
          ${required}
        >
          ${field.options ? field.options.map((option) => `
            <option value="${option.value}" ${option.selected || field.value === option.value ? "selected" : ""}>
              ${option.label}
            </option>
          `).join("") : ""}
        </select>
      `;
      break;
    case "multi_select":
      fieldHTML = `
        <select 
          id="${fieldId}"
          name="${field.name}" 
          class="form-input ${field.className || ""}" 
          multiple 
          ${required}
        >
          ${field.options ? field.options.map((option) => `
            <option value="${option.value}" ${option.selected ? "selected" : ""}>
              ${option.label}
            </option>
          `).join("") : ""}
        </select>
      `;
      break;
    case "checkbox":
      fieldHTML = `
        <input
          type="checkbox"
          id="${fieldId}"
          name="${field.name}"
          value="1"
          class="size-4 rounded border border-white/15 bg-white/5 checked:border-transparent checked:bg-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 ${field.className || ""}"
          ${field.value ? "checked" : ""}
          ${required}
        >
        <label for="${fieldId}" class="ml-2 text-sm text-white">${field.label}</label>
      `;
      break;
    default:
      fieldHTML = `
        <input 
          type="text" 
          id="${fieldId}"
          name="${field.name}" 
          value="${field.value || ""}"
          class="form-input ${field.className || ""}" 
          ${placeholder} 
          ${required}
        >
      `;
      break;
  }
  if (field.type === "checkbox") {
    return `
      <div class="form-group">
        <div class="flex items-center">
          ${fieldHTML}
        </div>
        ${field.helpText ? `<p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1 ml-6">${field.helpText}</p>` : ""}
      </div>
    `;
  }
  return `
    <div class="form-group">
      <label for="${fieldId}" class="form-label">
        ${field.label}${field.required ? " *" : ""}
      </label>
      ${fieldHTML}
      ${field.helpText ? `<p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">${field.helpText}</p>` : ""}
    </div>
  `;
}

// src/templates/filter-bar.template.ts
function renderFilterBar(data) {
  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 mb-6">
      <form id="filter-form" class="flex flex-wrap gap-4 items-center">
        ${data.filters.map((filter) => `
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-zinc-500 dark:text-zinc-400">${filter.label}:</label>
            <select
              name="${filter.name}"
              class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none transition-colors"
              onchange="updateFilters()"
            >
              ${filter.options.map((option) => `
                <option value="${option.value}" ${option.selected ? "selected" : ""}>
                  ${option.label}
                </option>
              `).join("")}
            </select>
          </div>
        `).join("")}

        ${data.actions && data.actions.length > 0 ? `
          <div class="flex items-center space-x-2 ml-auto">
            ${data.actions.map((action) => `
              <button
                type="button"
                class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                ${action.onclick ? `onclick="${action.onclick}"` : ""}
                ${action.hxGet ? `hx-get="${action.hxGet}"` : ""}
                ${action.hxTarget ? `hx-target="${action.hxTarget}"` : ""}
              >
                ${action.label}
              </button>
            `).join("")}
          </div>
        ` : ""}
      </form>

      <script>
        function updateFilters() {
          const form = document.getElementById('filter-form');
          const formData = new FormData(form);
          const params = new URLSearchParams(window.location.search);

          // Update params with form values
          for (const [key, value] of formData.entries()) {
            if (value) {
              params.set(key, value);
            } else {
              params.delete(key);
            }
          }

          // Reset to page 1 when filters change
          params.set('page', '1');

          // Update URL and reload
          window.location.href = window.location.pathname + '?' + params.toString();
        }
      </script>
    </div>
  `;
}

// src/templates/index.ts
init_admin_layout_catalyst_template();
init_logo_template();

export { renderFilterBar, renderForm, renderFormField };
//# sourceMappingURL=chunk-LU6J53IX.js.map
//# sourceMappingURL=chunk-LU6J53IX.js.map