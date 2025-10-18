export interface FilterOption {
  value: string
  label: string
  selected?: boolean
  color?: string
}

export interface Filter {
  name: string
  label: string
  options: FilterOption[]
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
  bulkActions?: Array<{
    label: string
    value: string
    icon?: string
    className?: string
  }>
}

export function renderFilterBar(data: FilterBarData): string {
  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 mb-6">
      <form id="filter-form" class="flex flex-wrap gap-4 items-center">
        ${data.filters.map(filter => `
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-zinc-500 dark:text-zinc-400">${filter.label}:</label>
            <select
              name="${filter.name}"
              class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none transition-colors"
              onchange="updateFilters()"
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
                type="button"
                class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                ${action.onclick ? `onclick="${action.onclick}"` : ''}
                ${action.hxGet ? `hx-get="${action.hxGet}"` : ''}
                ${action.hxTarget ? `hx-target="${action.hxTarget}"` : ''}
              >
                ${action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
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
  `
}