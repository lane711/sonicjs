export interface FilterOption {
  value: string
  label: string
  selected?: boolean
}

export interface Filter {
  name: string
  label: string
  options: FilterOption[]
  hxTarget?: string
  hxInclude?: string
}

export interface FilterBarData {
  filters: Filter[]
  actions?: Array<{
    label: string
    className?: string
    onclick?: string
    hxGet?: string
    hxTarget?: string
  }>
}

export function renderFilterBar(data: FilterBarData): string {
  return `
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6 mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        ${data.filters.map(filter => `
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-300">${filter.label}:</label>
            <select 
              name="${filter.name}" 
              class="backdrop-blur-md bg-black/40 border border-white/20 rounded-md px-3 py-1 text-gray-300 focus:border-blue-400 focus:outline-none transition-colors"
              ${filter.hxTarget ? `hx-get="/admin/content" hx-trigger="change" hx-target="${filter.hxTarget}"` : ''}
              ${filter.hxInclude ? `hx-include="${filter.hxInclude}"` : ''}
            >
              ${filter.options.map(option => `
                <option value="${option.value}" ${option.selected ? 'selected' : ''}>
                  ${option.label}
                </option>
              `).join('')}
            </select>
          </div>
        `).join('')}
        
        ${data.actions && data.actions.length > 0 ? `
          <div class="flex items-center space-x-2 ml-auto">
            ${data.actions.map(action => `
              <button 
                class="inline-flex items-center px-3 py-1 border border-white/20 text-sm leading-4 font-medium rounded-md text-gray-300 bg-white/10 hover:bg-white/20 hover:text-white transition-colors"
                ${action.onclick ? `onclick="${action.onclick}"` : ''}
                ${action.hxGet ? `hx-get="${action.hxGet}"` : ''}
                ${action.hxTarget ? `hx-target="${action.hxTarget}"` : ''}
              >
                ${action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `
}