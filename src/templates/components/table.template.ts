export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  className?: string
  sortType?: 'string' | 'number' | 'date' | 'boolean'
  render?: (value: any, row: any) => string
}

export interface TableData<T = any> {
  columns: TableColumn[]
  rows: T[]
  selectable?: boolean
  className?: string
  emptyMessage?: string
  tableId?: string
  title?: string
  rowClickable?: boolean
  rowClickUrl?: (row: T) => string
}

export function renderTable<T = any>(data: TableData<T>): string {
  const tableId = data.tableId || `table-${Math.random().toString(36).substr(2, 9)}`
  
  if (data.rows.length === 0) {
    return `
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-8 text-center">
        <div class="text-gray-400">
          <svg class="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-2 text-lg text-gray-300">${data.emptyMessage || 'No data available'}</p>
        </div>
      </div>
    `
  }

  return `
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl overflow-hidden ${data.className || ''}" id="${tableId}">
      ${data.title ? `
        <div class="px-6 py-4 border-b border-white/10">
          <h3 class="text-lg font-semibold text-white">${data.title}</h3>
        </div>
      ` : ''}
      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-white/10 sortable-table">
          <thead class="bg-white/5">
            <tr>
              ${data.selectable ? `
                <th class="px-6 py-3 text-left">
                  <input type="checkbox" class="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 row-checkbox" id="select-all-${tableId}">
                </th>
              ` : ''}
              ${data.columns.map((column, index) => `
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${column.className || ''}">
                  ${column.sortable ? `
                    <button 
                      class="flex items-center space-x-1 hover:text-white transition-colors sort-btn w-full text-left"
                      data-column="${column.key}"
                      data-sort-type="${column.sortType || 'string'}"
                      data-sort-direction="none"
                      onclick="sortTable('${tableId}', '${column.key}', '${column.sortType || 'string'}')"
                    >
                      <span>${column.label}</span>
                      <div class="sort-icons flex flex-col ml-auto">
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
              `).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            ${data.rows.map(row => {
              if (!row) return ''
              const clickableClass = data.rowClickable ? 'cursor-pointer' : ''
              const clickHandler = data.rowClickable && data.rowClickUrl ? `onclick="window.location.href='${data.rowClickUrl(row)}'"` : ''
              return `
                <tr class="hover:bg-white/5 transition-colors ${clickableClass}" ${clickHandler}>
                  ${data.selectable ? `
                    <td class="px-6 py-4 whitespace-nowrap" onclick="event.stopPropagation()">
                      <input type="checkbox" class="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 row-checkbox" value="${(row as any).id || ''}">
                    </td>
                  ` : ''}
                  ${data.columns.map(column => {
                    const value = (row as any)[column.key]
                    const displayValue = column.render ? column.render(value, row) : value
                    const stopPropagation = column.key === 'actions' ? 'onclick="event.stopPropagation()"' : ''
                    return `
                      <td class="px-6 py-4 whitespace-nowrap text-gray-300 ${column.className || ''}" ${stopPropagation}>
                        ${displayValue || ''}
                      </td>
                    `
                  }).join('')}
                </tr>
              `
            }).join('')}
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
              icon.classList.remove('opacity-100', 'text-blue-400');
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
            upIcon.classList.add('opacity-100', 'text-blue-400');
            downIcon.classList.add('opacity-30');
            downIcon.classList.remove('opacity-100', 'text-blue-400');
          } else {
            downIcon.classList.remove('opacity-30');
            downIcon.classList.add('opacity-100', 'text-blue-400');
            upIcon.classList.add('opacity-30');
            upIcon.classList.remove('opacity-100', 'text-blue-400');
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
  `
}