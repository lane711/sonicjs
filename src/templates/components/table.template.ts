export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  className?: string
  render?: (value: any, row: any) => string
}

export interface TableData<T = any> {
  columns: TableColumn[]
  rows: T[]
  selectable?: boolean
  className?: string
  emptyMessage?: string
}

export function renderTable<T = any>(data: TableData<T>): string {
  if (data.rows.length === 0) {
    return `
      <div class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-2 text-lg">${data.emptyMessage || 'No data available'}</p>
        </div>
      </div>
    `
  }

  return `
    <div class="bg-white rounded-lg shadow-sm overflow-hidden ${data.className || ''}">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              ${data.selectable ? `
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" class="rounded" id="select-all">
                </th>
              ` : ''}
              ${data.columns.map(column => `
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}">
                  ${column.sortable ? `
                    <button class="flex items-center space-x-1 hover:text-gray-700">
                      <span>${column.label}</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                      </svg>
                    </button>
                  ` : column.label}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${data.rows.map(row => {
              if (!row) return ''
              return `
                <tr class="hover:bg-gray-50">
                  ${data.selectable ? `
                    <td class="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" class="rounded row-checkbox" value="${(row as any).id || ''}">
                    </td>
                  ` : ''}
                  ${data.columns.map(column => {
                    const value = (row as any)[column.key]
                    const displayValue = column.render ? column.render(value, row) : value
                    return `
                      <td class="px-6 py-4 whitespace-nowrap ${column.className || ''}">
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
    </div>
  `
}