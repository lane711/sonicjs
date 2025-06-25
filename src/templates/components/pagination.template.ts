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
    <div class="bg-gray-8 px-4 py-3 flex items-center justify-between border-t border-gray-7">
      <!-- Mobile Pagination -->
      <div class="flex-1 flex justify-between sm:hidden">
        ${data.currentPage > 1 ? `
          <a href="${buildUrl(data.currentPage - 1)}" class="btn btn-secondary">
            Previous
          </a>
        ` : `
          <span class="btn btn-secondary opacity-50 cursor-not-allowed">Previous</span>
        `}
        
        ${data.currentPage < data.totalPages ? `
          <a href="${buildUrl(data.currentPage + 1)}" class="btn btn-secondary">
            Next
          </a>
        ` : `
          <span class="btn btn-secondary opacity-50 cursor-not-allowed">Next</span>
        `}
      </div>
      
      <!-- Desktop Pagination -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-3">
            Showing <span class="font-medium">${data.startItem}</span> to 
            <span class="font-medium">${data.endItem}</span> of 
            <span class="font-medium">${data.totalItems}</span> results
          </p>
        </div>
        
        <div class="flex items-center space-x-1">
          <!-- Previous Button -->
          ${data.currentPage > 1 ? `
            <a href="${buildUrl(data.currentPage - 1)}" 
               class="px-3 py-2 text-sm border border-gray-6 bg-gray-7 text-gray-3 rounded-md hover:bg-gray-6 hover:text-gray-1">
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
                   class="px-3 py-2 text-sm border border-gray-6 bg-gray-7 text-gray-3 rounded-md hover:bg-gray-6 hover:text-gray-1">
                  1
                </a>
                ${firstPage > 2 ? `
                  <span class="px-3 py-2 text-sm text-gray-4">...</span>
                ` : ''}
              ` : ''
            })()}
            
            <!-- Page number buttons -->
            ${generatePageNumbers().map(pageNum => `
              ${pageNum === data.currentPage ? `
                <span class="px-3 py-2 text-sm bg-primary text-white border border-primary rounded-md">
                  ${pageNum}
                </span>
              ` : `
                <a href="${buildUrl(pageNum)}" 
                   class="px-3 py-2 text-sm border border-gray-6 bg-gray-7 text-gray-3 rounded-md hover:bg-gray-6 hover:text-gray-1">
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
                  <span class="px-3 py-2 text-sm text-gray-4">...</span>
                ` : ''}
                <a href="${buildUrl(data.totalPages)}" 
                   class="px-3 py-2 text-sm border border-gray-6 bg-gray-7 text-gray-3 rounded-md hover:bg-gray-6 hover:text-gray-1">
                  ${data.totalPages}
                </a>
              ` : ''
            })()}
          ` : ''}
          
          <!-- Next Button -->
          ${data.currentPage < data.totalPages ? `
            <a href="${buildUrl(data.currentPage + 1)}" 
               class="px-3 py-2 text-sm border border-gray-6 bg-gray-7 text-gray-3 rounded-md hover:bg-gray-6 hover:text-gray-1">
              Next
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `
}