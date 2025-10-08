import { describe, it, expect } from 'vitest'
import { QueryFilterBuilder, QueryFilter } from '../utils/query-filter'

describe('QueryFilterBuilder', () => {
  describe('equals operator', () => {
    it('should build equals condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'status', operator: 'equals', value: 'published' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('WHERE')
      expect(result.sql).toContain('status = ?')
      expect(result.params).toEqual(['published'])
      expect(result.errors).toEqual([])
    })

    it('should handle NULL equals', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'deleted_at', operator: 'equals', value: null }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('deleted_at IS NULL')
      expect(result.params).toEqual([])
    })
  })

  describe('not_equals operator', () => {
    it('should build not equals condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'status', operator: 'not_equals', value: 'draft' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('status != ?')
      expect(result.params).toEqual(['draft'])
    })

    it('should handle NULL not equals', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'deleted_at', operator: 'not_equals', value: null }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('deleted_at IS NOT NULL')
    })
  })

  describe('comparison operators', () => {
    it('should build greater_than condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'created_at', operator: 'greater_than', value: 1609459200000 }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('created_at > ?')
      expect(result.params).toEqual([1609459200000])
    })

    it('should build greater_than_equal condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'views', operator: 'greater_than_equal', value: 100 }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('views >= ?')
      expect(result.params).toEqual([100])
    })

    it('should build less_than condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'price', operator: 'less_than', value: 50 }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('price < ?')
      expect(result.params).toEqual([50])
    })

    it('should build less_than_equal condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'priority', operator: 'less_than_equal', value: 5 }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('priority <= ?')
      expect(result.params).toEqual([5])
    })
  })

  describe('like operator', () => {
    it('should build like condition with single word', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'title', operator: 'like', value: 'tutorial' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('title LIKE ?')
      expect(result.params).toEqual(['%tutorial%'])
    })

    it('should build like condition with multiple words', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'title', operator: 'like', value: 'getting started tutorial' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('title LIKE ?')
      expect(result.sql).toContain('AND')
      expect(result.params).toEqual(['%getting%', '%started%', '%tutorial%'])
    })
  })

  describe('contains operator', () => {
    it('should build contains condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'description', operator: 'contains', value: 'javascript' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('description LIKE ?')
      expect(result.params).toEqual(['%javascript%'])
    })
  })

  describe('in operator', () => {
    it('should build in condition with array', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'status', operator: 'in', value: ['published', 'draft', 'review'] }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('status IN (?, ?, ?)')
      expect(result.params).toEqual(['published', 'draft', 'review'])
    })

    it('should build in condition with comma-delimited string', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'category', operator: 'in', value: 'tech,science,education' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('category IN (?, ?, ?)')
      expect(result.params).toEqual(['tech', 'science', 'education'])
    })
  })

  describe('not_in operator', () => {
    it('should build not_in condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'status', operator: 'not_in', value: ['deleted', 'archived'] }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('status NOT IN (?, ?)')
      expect(result.params).toEqual(['deleted', 'archived'])
    })
  })

  describe('all operator', () => {
    it('should build all condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'tags', operator: 'all', value: 'javascript,typescript,react' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('tags LIKE ?')
      expect(result.params).toEqual(['%javascript%', '%typescript%', '%react%'])
    })
  })

  describe('exists operator', () => {
    it('should build exists true condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'thumbnail', operator: 'exists', value: true }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('thumbnail IS NOT NULL')
      expect(result.sql).toContain("thumbnail != ''")
    })

    it('should build exists false condition', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'thumbnail', operator: 'exists', value: false }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('thumbnail IS NULL')
      expect(result.sql).toContain("thumbnail = ''")
    })
  })

  describe('AND/OR logic', () => {
    it('should build AND conditions', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'status', operator: 'equals', value: 'published' },
            { field: 'views', operator: 'greater_than', value: 100 }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('status = ?')
      expect(result.sql).toContain('views > ?')
      expect(result.sql).toContain('AND')
      expect(result.params).toEqual(['published', 100])
    })

    it('should build OR conditions', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          or: [
            { field: 'status', operator: 'equals', value: 'published' },
            { field: 'status', operator: 'equals', value: 'review' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('status = ?')
      expect(result.sql).toContain('OR')
      expect(result.params).toEqual(['published', 'review'])
    })

    it('should build combined AND/OR conditions', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'category', operator: 'equals', value: 'tech' }
          ],
          or: [
            { field: 'status', operator: 'equals', value: 'published' },
            { field: 'status', operator: 'equals', value: 'review' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('category = ?')
      expect(result.sql).toContain('status = ?')
      expect(result.sql).toContain('AND')
      expect(result.sql).toContain('OR')
      expect(result.params).toEqual(['tech', 'published', 'review'])
    })
  })

  describe('sorting', () => {
    it('should build ORDER BY clause', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        sort: [
          { field: 'created_at', order: 'desc' }
        ]
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('ORDER BY created_at DESC')
    })

    it('should build multiple ORDER BY clauses', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        sort: [
          { field: 'priority', order: 'desc' },
          { field: 'created_at', order: 'asc' }
        ]
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('ORDER BY priority DESC, created_at ASC')
    })
  })

  describe('pagination', () => {
    it('should build LIMIT clause', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        limit: 50
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('LIMIT ?')
      expect(result.params).toContain(50)
    })

    it('should build LIMIT and OFFSET clauses', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        limit: 20,
        offset: 40
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain('LIMIT ?')
      expect(result.sql).toContain('OFFSET ?')
      expect(result.params).toEqual([20, 40])
    })
  })

  describe('JSON field access', () => {
    it('should handle JSON field queries', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'data.author', operator: 'equals', value: 'John Doe' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.sql).toContain("json_extract(data, '$.author') = ?")
      expect(result.params).toEqual(['John Doe'])
    })
  })

  describe('parseFromQuery', () => {
    it('should parse filter from query string', () => {
      const query = {
        where: JSON.stringify({
          and: [
            { field: 'status', operator: 'equals', value: 'published' }
          ]
        }),
        limit: '25',
        offset: '50',
        sort: JSON.stringify([
          { field: 'created_at', order: 'desc' }
        ])
      }

      const filter = QueryFilterBuilder.parseFromQuery(query)
      expect(filter.where).toBeDefined()
      expect(filter.limit).toBe(25)
      expect(filter.offset).toBe(50)
      expect(filter.sort).toBeDefined()
    })

    it('should handle max limit', () => {
      const query = {
        limit: '5000' // Should be capped at 1000
      }

      const filter = QueryFilterBuilder.parseFromQuery(query)
      expect(filter.limit).toBe(1000)
    })
  })

  describe('error handling', () => {
    it('should report unsupported spatial operators', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'location', operator: 'near', value: '-122.4194,37.7749,1000' }
          ]
        }
      }

      const result = builder.build('content', filter)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('not supported')
    })
  })

  describe('complex real-world scenarios', () => {
    it('should handle blog post filtering', () => {
      const builder = new QueryFilterBuilder()
      const filter: QueryFilter = {
        where: {
          and: [
            { field: 'status', operator: 'equals', value: 'published' },
            { field: 'category', operator: 'in', value: 'tech,programming,javascript' },
            { field: 'views', operator: 'greater_than_equal', value: 100 }
          ],
          or: [
            { field: 'featured', operator: 'equals', value: true },
            { field: 'promoted', operator: 'equals', value: true }
          ]
        },
        sort: [
          { field: 'views', order: 'desc' },
          { field: 'created_at', order: 'desc' }
        ],
        limit: 10
      }

      const result = builder.build('content', filter)
      expect(result.errors).toEqual([])
      expect(result.sql).toContain('WHERE')
      expect(result.sql).toContain('ORDER BY')
      expect(result.sql).toContain('LIMIT')
      expect(result.params).toContain('published')
      expect(result.params).toContain(100)
    })
  })
})
