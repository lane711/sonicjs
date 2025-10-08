/**
 * API Filtering Examples
 *
 * This file demonstrates how to use the SonicJS AI filtering API
 * with JavaScript/TypeScript fetch calls.
 */

const API_BASE_URL = 'https://your-api.com/api'

// Helper function to build query string
function buildQueryString(params) {
  const searchParams = new URLSearchParams()

  if (params.where) {
    searchParams.append('where', JSON.stringify(params.where))
  }

  if (params.sort) {
    searchParams.append('sort', JSON.stringify(params.sort))
  }

  if (params.limit) {
    searchParams.append('limit', params.limit.toString())
  }

  if (params.offset) {
    searchParams.append('offset', params.offset.toString())
  }

  return searchParams.toString()
}

// Example 1: Get all published content
async function getPublishedContent() {
  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'status',
          operator: 'equals',
          value: 'published'
        }
      ]
    },
    limit: 50
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 2: Search for content by title
async function searchByTitle(searchTerm) {
  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'title',
          operator: 'like',
          value: searchTerm
        }
      ]
    },
    sort: [
      {
        field: 'created_at',
        order: 'desc'
      }
    ],
    limit: 20
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 3: Get content by multiple statuses
async function getContentByStatuses(statuses) {
  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'status',
          operator: 'in',
          value: statuses // ['published', 'review', 'scheduled']
        }
      ]
    }
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 4: Get popular content (views > 100)
async function getPopularContent(minViews = 100) {
  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'status',
          operator: 'equals',
          value: 'published'
        },
        {
          field: 'views',
          operator: 'greater_than',
          value: minViews
        }
      ]
    },
    sort: [
      {
        field: 'views',
        order: 'desc'
      }
    ],
    limit: 10
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 5: Get content within a date range
async function getContentByDateRange(startDate, endDate) {
  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'created_at',
          operator: 'greater_than_equal',
          value: startDate
        },
        {
          field: 'created_at',
          operator: 'less_than_equal',
          value: endDate
        }
      ]
    },
    sort: [
      {
        field: 'created_at',
        order: 'desc'
      }
    ]
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 6: Get featured OR promoted content
async function getFeaturedOrPromotedContent() {
  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'status',
          operator: 'equals',
          value: 'published'
        }
      ],
      or: [
        {
          field: 'featured',
          operator: 'equals',
          value: true
        },
        {
          field: 'promoted',
          operator: 'equals',
          value: true
        }
      ]
    }
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 7: Get content with specific tags
async function getContentByTags(tags) {
  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'tags',
          operator: 'all',
          value: tags.join(',') // ['javascript', 'react', 'tutorial']
        },
        {
          field: 'status',
          operator: 'equals',
          value: 'published'
        }
      ]
    }
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 8: Paginated results
async function getPaginatedContent(page = 1, pageSize = 25) {
  const offset = (page - 1) * pageSize

  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'status',
          operator: 'equals',
          value: 'published'
        }
      ]
    },
    sort: [
      {
        field: 'created_at',
        order: 'desc'
      }
    ],
    limit: pageSize,
    offset: offset
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 9: Filter by nested JSON field
async function getContentByAuthor(authorName) {
  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'data.author',
          operator: 'equals',
          value: authorName
        },
        {
          field: 'status',
          operator: 'equals',
          value: 'published'
        }
      ]
    }
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 10: Complex multi-criteria search
async function advancedSearch(criteria) {
  const {
    categories,
    minViews,
    tags,
    searchTerm,
    excludeStatuses,
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit = 20
  } = criteria

  const whereClause = {
    and: [],
    or: []
  }

  // Add category filter if provided
  if (categories && categories.length > 0) {
    whereClause.and.push({
      field: 'category',
      operator: 'in',
      value: categories
    })
  }

  // Add minimum views filter
  if (minViews) {
    whereClause.and.push({
      field: 'views',
      operator: 'greater_than_equal',
      value: minViews
    })
  }

  // Add tags filter (must have all tags)
  if (tags && tags.length > 0) {
    whereClause.and.push({
      field: 'tags',
      operator: 'all',
      value: tags.join(',')
    })
  }

  // Exclude certain statuses
  if (excludeStatuses && excludeStatuses.length > 0) {
    whereClause.and.push({
      field: 'status',
      operator: 'not_in',
      value: excludeStatuses
    })
  }

  // Search in multiple fields (title OR description)
  if (searchTerm) {
    whereClause.or.push(
      {
        field: 'title',
        operator: 'like',
        value: searchTerm
      },
      {
        field: 'description',
        operator: 'contains',
        value: searchTerm
      }
    )
  }

  const queryString = buildQueryString({
    where: whereClause,
    sort: [
      {
        field: sortBy,
        order: sortOrder
      }
    ],
    limit
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 11: Get content that exists vs doesn't exist
async function getContentWithThumbnails() {
  const queryString = buildQueryString({
    where: {
      and: [
        {
          field: 'thumbnail',
          operator: 'exists',
          value: true
        },
        {
          field: 'status',
          operator: 'equals',
          value: 'published'
        }
      ]
    }
  })

  const response = await fetch(`${API_BASE_URL}/content?${queryString}`)
  return response.json()
}

// Example 12: Collection-specific filtering
async function getCollectionContent(collectionName, filters = {}) {
  const queryString = buildQueryString({
    where: filters.where || {},
    sort: filters.sort || [{ field: 'created_at', order: 'desc' }],
    limit: filters.limit || 50,
    offset: filters.offset || 0
  })

  const response = await fetch(`${API_BASE_URL}/collections/${collectionName}/content?${queryString}`)
  return response.json()
}

// Example usage:
async function runExamples() {
  try {
    // Get all published content
    console.log('Published content:', await getPublishedContent())

    // Search for React tutorials
    console.log('React tutorials:', await searchByTitle('react tutorial'))

    // Get popular tech articles
    console.log('Popular content:', await getPopularContent(1000))

    // Get content from last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    const now = Date.now()
    console.log('Recent content:', await getContentByDateRange(thirtyDaysAgo, now))

    // Complex search
    console.log('Advanced search:', await advancedSearch({
      categories: ['tech', 'programming'],
      minViews: 100,
      tags: ['javascript', 'tutorial'],
      searchTerm: 'getting started',
      excludeStatuses: ['draft', 'archived'],
      sortBy: 'views',
      sortOrder: 'desc',
      limit: 10
    }))

    // Get page 2 of results
    console.log('Page 2:', await getPaginatedContent(2, 25))

  } catch (error) {
    console.error('Error:', error)
  }
}

// Export functions for use in your application
export {
  buildQueryString,
  getPublishedContent,
  searchByTitle,
  getContentByStatuses,
  getPopularContent,
  getContentByDateRange,
  getFeaturedOrPromotedContent,
  getContentByTags,
  getPaginatedContent,
  getContentByAuthor,
  advancedSearch,
  getContentWithThumbnails,
  getCollectionContent
}
