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
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl px-4 py-3 flex items-center justify-between mt-4">
      <!-- Mobile Pagination -->
      <div class="flex-1 flex justify-between sm:hidden">
        ${data.currentPage > 1 ? `
          <a href="${buildUrl(data.currentPage - 1)}" class="inline-flex items-center px-3 py-1 border border-white/20 text-sm leading-4 font-medium rounded-md text-gray-300 bg-white/10 hover:bg-white/20 hover:text-white transition-colors">
            Previous
          </a>
        ` : `
          <span class="inline-flex items-center px-3 py-1 border border-white/20 text-sm leading-4 font-medium rounded-md text-gray-500 bg-white/5 opacity-50 cursor-not-allowed">Previous</span>
        `}
        
        ${data.currentPage < data.totalPages ? `
          <a href="${buildUrl(data.currentPage + 1)}" class="inline-flex items-center px-3 py-1 border border-white/20 text-sm leading-4 font-medium rounded-md text-gray-300 bg-white/10 hover:bg-white/20 hover:text-white transition-colors">
            Next
          </a>
        ` : `
          <span class="inline-flex items-center px-3 py-1 border border-white/20 text-sm leading-4 font-medium rounded-md text-gray-500 bg-white/5 opacity-50 cursor-not-allowed">Next</span>
        `}
      </div>
      
      <!-- Desktop Pagination -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-300">
            Showing <span class="font-medium text-white">${data.startItem}</span> to 
            <span class="font-medium text-white">${data.endItem}</span> of 
            <span class="font-medium text-white">${data.totalItems}</span> results
          </p>
        </div>
        
        <div class="flex items-center space-x-1">
          <!-- Previous Button -->
          ${data.currentPage > 1 ? `
            <a href="${buildUrl(data.currentPage - 1)}" 
               class="px-3 py-2 text-sm border border-white/20 bg-white/10 text-gray-300 rounded-md hover:bg-white/20 hover:text-white transition-colors">
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
                   class="px-3 py-2 text-sm border border-white/20 bg-white/10 text-gray-300 rounded-md hover:bg-white/20 hover:text-white transition-colors">
                  1
                </a>
                ${firstPage > 2 ? `
                  <span class="px-3 py-2 text-sm text-gray-500">...</span>
                ` : ''}
              ` : ''
            })()}
            
            <!-- Page number buttons -->
            ${generatePageNumbers().map(pageNum => `
              ${pageNum === data.currentPage ? `
                <span class="px-3 py-2 text-sm bg-blue-500/30 text-white border border-blue-500/50 rounded-md">
                  ${pageNum}
                </span>
              ` : `
                <a href="${buildUrl(pageNum)}" 
                   class="px-3 py-2 text-sm border border-white/20 bg-white/10 text-gray-300 rounded-md hover:bg-white/20 hover:text-white transition-colors">
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
                  <span class="px-3 py-2 text-sm text-gray-500">...</span>
                ` : ''}
                <a href="${buildUrl(data.totalPages)}" 
                   class="px-3 py-2 text-sm border border-white/20 bg-white/10 text-gray-300 rounded-md hover:bg-white/20 hover:text-white transition-colors">
                  ${data.totalPages}
                </a>
              ` : ''
            })()}
          ` : ''}
          
          <!-- Next Button -->
          ${data.currentPage < data.totalPages ? `
            <a href="${buildUrl(data.currentPage + 1)}" 
               class="px-3 py-2 text-sm border border-white/20 bg-white/10 text-gray-300 rounded-md hover:bg-white/20 hover:text-white transition-colors">
              Next
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `
}