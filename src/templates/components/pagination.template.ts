export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startItem: number
  endItem: number
  baseUrl: string
  queryParams?: Record<string, string>
  showPageNumbers?: boolean
  maxPageNumbers?: number
}

export function renderPagination(data: PaginationData): string {
  if (data.totalPages <= 1) {
    return ''
  }

  const buildUrl = (page: number): string => {
    const params = new URLSearchParams(data.queryParams || {})
    params.set('page', page.toString())
    return `${data.baseUrl}?${params.toString()}`
  }

  const generatePageNumbers = (): number[] => {
    const maxNumbers = data.maxPageNumbers || 5
    const half = Math.floor(maxNumbers / 2)
    let start = Math.max(1, data.currentPage - half)
    let end = Math.min(data.totalPages, start + maxNumbers - 1)

    // Adjust start if we're near the end
    if (end - start + 1 < maxNumbers) {
      start = Math.max(1, end - maxNumbers + 1)
    }

    const pages: number[] = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 px-4 py-3 flex items-center justify-between mt-4">
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

      <!-- Desktop Pagination -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Showing <span class="font-medium text-zinc-950 dark:text-white">${data.startItem}</span> to
            <span class="font-medium text-zinc-950 dark:text-white">${data.endItem}</span> of
            <span class="font-medium text-zinc-950 dark:text-white">${data.totalItems}</span> results
          </p>
        </div>

        <div class="flex items-center gap-x-1">
          <!-- Previous Button -->
          ${data.currentPage > 1 ? `
            <a href="${buildUrl(data.currentPage - 1)}"
               class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Previous
            </a>
          ` : ''}

          <!-- Page Numbers -->
          ${data.showPageNumbers !== false ? `
            <!-- First page if not in range -->
            ${(() => {
              const pageNumbers = generatePageNumbers()
              const firstPage = pageNumbers.length > 0 ? pageNumbers[0] : null
              return firstPage && firstPage > 1 ? `
                <a href="${buildUrl(1)}"
                   class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  1
                </a>
                ${firstPage > 2 ? `
                  <span class="px-2 text-sm text-zinc-500 dark:text-zinc-400">...</span>
                ` : ''}
              ` : ''
            })()}

            <!-- Page number buttons -->
            ${generatePageNumbers().map(pageNum => `
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
            `).join('')}

            <!-- Last page if not in range -->
            ${(() => {
              const pageNumbers = generatePageNumbers()
              const lastPageNum = pageNumbers.length > 0 ? pageNumbers.slice(-1)[0] : null
              return lastPageNum && lastPageNum < data.totalPages ? `
                ${lastPageNum < data.totalPages - 1 ? `
                  <span class="px-2 text-sm text-zinc-500 dark:text-zinc-400">...</span>
                ` : ''}
                <a href="${buildUrl(data.totalPages)}"
                   class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  ${data.totalPages}
                </a>
              ` : ''
            })()}
          ` : ''}

          <!-- Next Button -->
          ${data.currentPage < data.totalPages ? `
            <a href="${buildUrl(data.currentPage + 1)}"
               class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Next
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `
}