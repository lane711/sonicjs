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

// src/templates/table.template.ts
function renderTable(data) {
  const tableId = data.tableId || `table-${Math.random().toString(36).substr(2, 9)}`;
  if (data.rows.length === 0) {
    return `
      <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8 text-center">
        <div class="text-zinc-500 dark:text-zinc-400">
          <svg class="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">${data.emptyMessage || "No data available"}</p>
        </div>
      </div>
    `;
  }
  return `
    <div class="${data.className || ""}" id="${tableId}">
      ${data.title ? `
        <div class="px-4 sm:px-0 mb-4">
          <h3 class="text-base font-semibold text-zinc-950 dark:text-white">${data.title}</h3>
        </div>
      ` : ""}
      <div class="overflow-x-auto">
        <table class="min-w-full sortable-table">
          <thead>
            <tr>
              ${data.selectable ? `
                <th class="px-4 py-3.5 text-center sm:pl-0">
                  <div class="flex items-center justify-center">
                    <div class="group grid size-4 grid-cols-1">
                      <input type="checkbox" id="select-all-${tableId}" class="col-start-1 row-start-1 appearance-none rounded border border-white/10 bg-white/5 checked:border-cyan-500 checked:bg-cyan-500 indeterminate:border-cyan-500 indeterminate:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto row-checkbox" />
                      <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-white/25">
                        <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                        <path d="M3 7H11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:indeterminate]:opacity-100" />
                      </svg>
                    </div>
                  </div>
                </th>
              ` : ""}
              ${data.columns.map((column, index) => {
    const isFirst = index === 0 && !data.selectable;
    const isLast = index === data.columns.length - 1;
    return `
                <th class="px-4 py-3.5 text-left text-sm font-semibold text-zinc-950 dark:text-white ${isFirst ? "sm:pl-0" : ""} ${isLast ? "sm:pr-0" : ""} ${column.className || ""}">
                  ${column.sortable ? `
                    <button
                      class="flex items-center gap-x-2 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors sort-btn text-left"
                      data-column="${column.key}"
                      data-sort-type="${column.sortType || "string"}"
                      data-sort-direction="none"
                      onclick="sortTable('${tableId}', '${column.key}', '${column.sortType || "string"}')"
                    >
                      <span>${column.label}</span>
                      <div class="sort-icons flex flex-col">
                        <svg class="w-3 h-3 sort-up opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                        </svg>
                        <svg class="w-3 h-3 sort-down opacity-30 -mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </button>
                  ` : column.label}
                </th>
              `;
  }).join("")}
            </tr>
          </thead>
          <tbody>
            ${data.rows.map((row) => {
    if (!row) return "";
    const clickableClass = data.rowClickable ? "cursor-pointer" : "";
    const clickHandler = data.rowClickable && data.rowClickUrl ? `onclick="window.location.href='${data.rowClickUrl(row)}'"` : "";
    return `
                <tr class="group border-t border-zinc-950/5 dark:border-white/5 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:via-blue-50/30 hover:to-purple-50/50 dark:hover:from-cyan-900/20 dark:hover:via-blue-900/10 dark:hover:to-purple-900/20 hover:shadow-sm hover:shadow-cyan-500/5 dark:hover:shadow-cyan-400/5 transition-all duration-300 ${clickableClass}" ${clickHandler}>
                  ${data.selectable ? `
                    <td class="px-4 py-4 sm:pl-0" onclick="event.stopPropagation()">
                      <div class="flex items-center justify-center">
                        <div class="group grid size-4 grid-cols-1">
                          <input type="checkbox" value="${row.id || ""}" class="col-start-1 row-start-1 appearance-none rounded border border-white/10 bg-white/5 checked:border-cyan-500 checked:bg-cyan-500 indeterminate:border-cyan-500 indeterminate:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto row-checkbox" />
                          <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-white/25">
                            <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                            <path d="M3 7H11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:indeterminate]:opacity-100" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  ` : ""}
                  ${data.columns.map((column, colIndex) => {
      const value = row[column.key];
      const displayValue = column.render ? column.render(value, row) : value;
      const stopPropagation = column.key === "actions" ? 'onclick="event.stopPropagation()"' : "";
      const isFirst = colIndex === 0 && !data.selectable;
      const isLast = colIndex === data.columns.length - 1;
      return `
                      <td class="px-4 py-4 text-sm text-zinc-500 dark:text-zinc-400 ${isFirst ? "sm:pl-0 font-medium text-zinc-950 dark:text-white" : ""} ${isLast ? "sm:pr-0" : ""} ${column.className || ""}" ${stopPropagation}>
                        ${displayValue || ""}
                      </td>
                    `;
    }).join("")}
                </tr>
              `;
  }).join("")}
          </tbody>
        </table>
      </div>

      <script>
        // Table sorting functionality
        window.sortTable = function(tableId, column, sortType) {
          const tableContainer = document.getElementById(tableId);
          const table = tableContainer.querySelector('.sortable-table');
          const tbody = table.querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const headerBtn = table.querySelector(\`[data-column="\${column}"]\`);

          // Get current sort direction
          let direction = headerBtn.getAttribute('data-sort-direction');

          // Reset all sort indicators
          table.querySelectorAll('.sort-btn').forEach(btn => {
            btn.setAttribute('data-sort-direction', 'none');
            btn.querySelectorAll('.sort-up, .sort-down').forEach(icon => {
              icon.classList.add('opacity-30');
              icon.classList.remove('opacity-100', 'text-zinc-950', 'dark:text-white');
            });
          });

          // Determine new direction
          if (direction === 'none' || direction === 'desc') {
            direction = 'asc';
          } else {
            direction = 'desc';
          }

          // Update current header
          headerBtn.setAttribute('data-sort-direction', direction);
          const upIcon = headerBtn.querySelector('.sort-up');
          const downIcon = headerBtn.querySelector('.sort-down');

          if (direction === 'asc') {
            upIcon.classList.remove('opacity-30');
            upIcon.classList.add('opacity-100', 'text-zinc-950', 'dark:text-white');
            downIcon.classList.add('opacity-30');
            downIcon.classList.remove('opacity-100', 'text-zinc-950', 'dark:text-white');
          } else {
            downIcon.classList.remove('opacity-30');
            downIcon.classList.add('opacity-100', 'text-zinc-950', 'dark:text-white');
            upIcon.classList.add('opacity-30');
            upIcon.classList.remove('opacity-100', 'text-zinc-950', 'dark:text-white');
          }

          // Find column index (accounting for potential select column)
          const headers = Array.from(table.querySelectorAll('th'));
          const selectableOffset = table.querySelector('input[id^="select-all"]') ? 1 : 0;
          const columnIndex = headers.findIndex(th => th.querySelector(\`[data-column="\${column}"]\`)) - selectableOffset;

          // Sort rows
          rows.sort((a, b) => {
            const aCell = a.children[columnIndex + selectableOffset];
            const bCell = b.children[columnIndex + selectableOffset];

            if (!aCell || !bCell) return 0;

            let aValue = aCell.textContent.trim();
            let bValue = bCell.textContent.trim();

            // Handle different sort types
            switch (sortType) {
              case 'number':
                aValue = parseFloat(aValue.replace(/[^0-9.-]/g, '')) || 0;
                bValue = parseFloat(bValue.replace(/[^0-9.-]/g, '')) || 0;
                break;
              case 'date':
                aValue = new Date(aValue).getTime() || 0;
                bValue = new Date(bValue).getTime() || 0;
                break;
              case 'boolean':
                aValue = aValue.toLowerCase() === 'true' || aValue.toLowerCase() === 'published' || aValue.toLowerCase() === 'active';
                bValue = bValue.toLowerCase() === 'true' || bValue.toLowerCase() === 'published' || bValue.toLowerCase() === 'active';
                break;
              default: // string
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
          });

          // Re-append sorted rows
          rows.forEach(row => tbody.appendChild(row));
        };

        // Select all functionality
        document.addEventListener('DOMContentLoaded', function() {
          document.querySelectorAll('[id^="select-all"]').forEach(selectAll => {
            selectAll.addEventListener('change', function() {
              const tableId = this.id.replace('select-all-', '');
              const table = document.getElementById(tableId);
              if (table) {
                const checkboxes = table.querySelectorAll('.row-checkbox');
                checkboxes.forEach(checkbox => {
                  checkbox.checked = this.checked;
                });
              }
            });
          });
        });
      </script>
    </div>
  `;
}

// src/templates/pagination.template.ts
function renderPagination(data) {
  const shouldShowPagination = data.totalPages > 1 || data.showPageSizeSelector !== false && data.totalItems > 0;
  if (!shouldShowPagination) {
    return "";
  }
  const buildUrl = (page, limit) => {
    const params = new URLSearchParams(data.queryParams || {});
    params.set("page", page.toString());
    if (data.itemsPerPage !== 20) {
      params.set("limit", data.itemsPerPage.toString());
    }
    return `${data.baseUrl}?${params.toString()}`;
  };
  const buildPageSizeUrl = (limit) => {
    const params = new URLSearchParams(data.queryParams || {});
    params.set("page", "1");
    params.set("limit", limit.toString());
    return `${data.baseUrl}?${params.toString()}`;
  };
  const generatePageNumbers = () => {
    const maxNumbers = data.maxPageNumbers || 5;
    const half = Math.floor(maxNumbers / 2);
    let start = Math.max(1, data.currentPage - half);
    let end = Math.min(data.totalPages, start + maxNumbers - 1);
    if (end - start + 1 < maxNumbers) {
      start = Math.max(1, end - maxNumbers + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 px-4 py-3 flex items-center justify-between mt-4">
      ${data.totalPages > 1 ? `
        <!-- Mobile Pagination -->
        <div class="flex-1 flex justify-between sm:hidden">
          ${data.currentPage > 1 ? `
            <a href="${buildUrl(data.currentPage - 1)}" class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Previous
            </a>
          ` : `
            <span class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-400 dark:text-zinc-600 shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 opacity-50 cursor-not-allowed">Previous</span>
          `}

          ${data.currentPage < data.totalPages ? `
            <a href="${buildUrl(data.currentPage + 1)}" class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Next
            </a>
          ` : `
            <span class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-400 dark:text-zinc-600 shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 opacity-50 cursor-not-allowed">Next</span>
          `}
        </div>
      ` : ""}

      <!-- Desktop Pagination -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Showing <span class="font-medium text-zinc-950 dark:text-white">${data.startItem}</span> to
            <span class="font-medium text-zinc-950 dark:text-white">${data.endItem}</span> of
            <span class="font-medium text-zinc-950 dark:text-white">${data.totalItems}</span> results
          </p>
          ${data.showPageSizeSelector !== false ? `
            <div class="flex items-center gap-2">
              <label for="page-size" class="text-sm text-zinc-500 dark:text-zinc-400">Per page:</label>
              <div class="grid grid-cols-1">
                <select
                  id="page-size"
                  onchange="window.location.href = this.value"
                  class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-sm text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-zinc-500/30 dark:outline-zinc-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400"
                >
                  ${(data.pageSizeOptions || [10, 20, 50, 100]).map((size) => `
                    <option value="${buildPageSizeUrl(size)}" ${size === data.itemsPerPage ? "selected" : ""}>
                      ${size}
                    </option>
                  `).join("")}
                </select>
                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-zinc-600 dark:text-zinc-400">
                  <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
              </div>
            </div>
          ` : ""}
        </div>

        ${data.totalPages > 1 ? `
          <div class="flex items-center gap-x-1">
            <!-- Previous Button -->
            ${data.currentPage > 1 ? `
            <a href="${buildUrl(data.currentPage - 1)}"
               class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Previous
            </a>
          ` : ""}

          <!-- Page Numbers -->
          ${data.showPageNumbers !== false ? `
            <!-- First page if not in range -->
            ${(() => {
    const pageNumbers = generatePageNumbers();
    const firstPage = pageNumbers.length > 0 ? pageNumbers[0] : null;
    return firstPage && firstPage > 1 ? `
                <a href="${buildUrl(1)}"
                   class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  1
                </a>
                ${firstPage > 2 ? `
                  <span class="px-2 text-sm text-zinc-500 dark:text-zinc-400">...</span>
                ` : ""}
              ` : "";
  })()}

            <!-- Page number buttons -->
            ${generatePageNumbers().map((pageNum) => `
              ${pageNum === data.currentPage ? `
                <span class="rounded-lg bg-zinc-950 dark:bg-white px-3 py-2 text-sm font-semibold text-white dark:text-zinc-950">
                  ${pageNum}
                </span>
              ` : `
                <a href="${buildUrl(pageNum)}"
                   class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  ${pageNum}
                </a>
              `}
            `).join("")}

            <!-- Last page if not in range -->
            ${(() => {
    const pageNumbers = generatePageNumbers();
    const lastPageNum = pageNumbers.length > 0 ? pageNumbers.slice(-1)[0] : null;
    return lastPageNum && lastPageNum < data.totalPages ? `
                ${lastPageNum < data.totalPages - 1 ? `
                  <span class="px-2 text-sm text-zinc-500 dark:text-zinc-400">...</span>
                ` : ""}
                <a href="${buildUrl(data.totalPages)}"
                   class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  ${data.totalPages}
                </a>
              ` : "";
  })()}
          ` : ""}

          <!-- Next Button -->
          ${data.currentPage < data.totalPages ? `
            <a href="${buildUrl(data.currentPage + 1)}"
               class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Next
            </a>
          ` : ""}
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

// src/templates/alert.template.ts
function renderAlert(data) {
  const typeClasses = {
    success: "bg-green-50 dark:bg-green-500/10 border border-green-600/20 dark:border-green-500/20",
    error: "bg-error/10 border border-red-600/20 dark:border-red-500/20",
    warning: "bg-amber-50 dark:bg-amber-500/10 border border-amber-600/20 dark:border-amber-500/20",
    info: "bg-blue-50 dark:bg-blue-500/10 border border-blue-600/20 dark:border-blue-500/20"
  };
  const iconClasses = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400"
  };
  const textClasses = {
    success: "text-green-900 dark:text-green-300",
    error: "text-red-900 dark:text-red-300",
    warning: "text-amber-900 dark:text-amber-300",
    info: "text-blue-900 dark:text-blue-300"
  };
  const messageTextClasses = {
    success: "text-green-700 dark:text-green-400",
    error: "text-red-700 dark:text-red-400",
    warning: "text-amber-700 dark:text-amber-400",
    info: "text-blue-700 dark:text-blue-400"
  };
  const icons = {
    success: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />`,
    error: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />`,
    warning: `<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />`,
    info: `<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />`
  };
  return `
    <div class="rounded-lg p-4 ${typeClasses[data.type]} ${data.className || ""}" ${data.dismissible ? 'id="dismissible-alert"' : ""}>
      <div class="flex">
        ${data.icon !== false ? `
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 ${iconClasses[data.type]}" viewBox="0 0 20 20" fill="currentColor">
              ${icons[data.type]}
            </svg>
          </div>
        ` : ""}
        <div class="${data.icon !== false ? "ml-3" : ""}">
          ${data.title ? `
            <h3 class="text-sm font-semibold ${textClasses[data.type]}">
              ${data.title}
            </h3>
          ` : ""}
          <div class="${data.title ? "mt-1 text-sm" : "text-sm"} ${messageTextClasses[data.type]}">
            <p>${data.message}</p>
          </div>
        </div>
        ${data.dismissible ? `
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button
                type="button"
                class="inline-flex rounded-md p-1.5 ${iconClasses[data.type]} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2"
                onclick="document.getElementById('dismissible-alert').remove()"
              >
                <span class="sr-only">Dismiss</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

// src/templates/confirmation-dialog.template.ts
function renderConfirmationDialog(options) {
  const {
    id,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmClass = "bg-red-500 hover:bg-red-400",
    iconColor = "red",
    onConfirm = ""
  } = options;
  const iconColorClasses = {
    red: "bg-red-500/10 text-red-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    blue: "bg-blue-500/10 text-blue-400"
  };
  return `
    <el-dialog>
      <dialog
        id="${id}"
        aria-labelledby="${id}-title"
        class="fixed inset-0 m-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent p-0 backdrop:bg-transparent"
      >
        <el-dialog-backdrop class="fixed inset-0 bg-gray-900/50 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"></el-dialog-backdrop>

        <div tabindex="0" class="flex min-h-full items-end justify-center p-4 text-center focus:outline focus:outline-0 sm:items-center sm:p-0">
          <el-dialog-panel class="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl outline outline-1 -outline-offset-1 outline-white/10 transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${iconColorClasses[iconColor]} sm:mx-0 sm:size-10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 id="${id}-title" class="text-base font-semibold text-white">${title}</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-400">${message}</p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onclick="${onConfirm}; document.getElementById('${id}').close()"
                command="close"
                commandfor="${id}"
                class="confirm-button inline-flex w-full justify-center rounded-md ${confirmClass} px-3 py-2 text-sm font-semibold text-white sm:ml-3 sm:w-auto"
              >
                ${confirmText}
              </button>
              <button
                type="button"
                command="close"
                commandfor="${id}"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/5 hover:bg-white/20 sm:mt-0 sm:w-auto"
              >
                ${cancelText}
              </button>
            </div>
          </el-dialog-panel>
        </div>
      </dialog>
    </el-dialog>
  `;
}
function getConfirmationDialogScript() {
  return `
    <script src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1" type="module"></script>
    <script>
      function showConfirmDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (dialog) {
          dialog.showModal();
        }
      }
    </script>
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

export { getConfirmationDialogScript, renderAlert, renderConfirmationDialog, renderFilterBar, renderForm, renderFormField, renderPagination, renderTable };
//# sourceMappingURL=chunk-KRJMGD4E.js.map
//# sourceMappingURL=chunk-KRJMGD4E.js.map