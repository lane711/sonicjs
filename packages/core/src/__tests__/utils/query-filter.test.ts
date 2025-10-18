import { describe, it, expect } from 'vitest'
import { QueryFilterBuilder, buildQuery, type QueryFilter } from '../../utils/query-filter'

describe('QueryFilterBuilder', () => {
  it('should build basic SELECT query', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {}

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users')
    expect(result.params).toEqual([])
    expect(result.errors).toEqual([])
  })

  it('should build query with equals condition', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'name', operator: 'equals', value: 'John' }
        ]
      }
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (name = ?)')
    expect(result.params).toEqual(['John'])
  })

  it('should build query with multiple AND conditions', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'age', operator: 'greater_than', value: 18 },
          { field: 'status', operator: 'equals', value: 'active' }
        ]
      }
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (age > ? AND status = ?)')
    expect(result.params).toEqual([18, 'active'])
  })

  it('should build query with OR conditions', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        or: [
          { field: 'role', operator: 'equals', value: 'admin' },
          { field: 'role', operator: 'equals', value: 'editor' }
        ]
      }
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (role = ? OR role = ?)')
    expect(result.params).toEqual(['admin', 'editor'])
  })

  it('should support LIKE operator', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'email', operator: 'like', value: 'test user' }
        ]
      }
    }

    const result = builder.build('users', filter)

    // LIKE with multiple words creates AND conditions
    expect(result.sql).toContain('email LIKE ?')
    expect(result.params).toContain('%test%')
    expect(result.params).toContain('%user%')
  })

  it('should support contains operator', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'description', operator: 'contains', value: 'example' }
        ]
      }
    }

    const result = builder.build('posts', filter)

    expect(result.sql).toBe('SELECT * FROM posts WHERE (description LIKE ?)')
    expect(result.params).toEqual(['%example%'])
  })

  it('should support IN operator with array', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'status', operator: 'in', value: ['active', 'pending'] }
        ]
      }
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (status IN (?, ?))')
    expect(result.params).toEqual(['active', 'pending'])
  })

  it('should support NOT IN operator', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'role', operator: 'not_in', value: ['admin', 'superadmin'] }
        ]
      }
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (role NOT IN (?, ?))')
    expect(result.params).toEqual(['admin', 'superadmin'])
  })

  it('should handle NULL values with equals operator', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'deleted_at', operator: 'equals', value: null }
        ]
      }
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (deleted_at IS NULL)')
    expect(result.params).toEqual([])
  })

  it('should handle NULL values with not_equals operator', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'email', operator: 'not_equals', value: null }
        ]
      }
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (email IS NOT NULL)')
    expect(result.params).toEqual([])
  })

  it('should support exists operator', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'bio', operator: 'exists', value: true }
        ]
      }
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (bio IS NOT NULL AND bio != \'\')')
  })

  it('should add ORDER BY clause', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      sort: [
        { field: 'created_at', order: 'desc' }
      ]
    }

    const result = builder.build('posts', filter)

    expect(result.sql).toBe('SELECT * FROM posts ORDER BY created_at DESC')
  })

  it('should add multiple ORDER BY clauses', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      sort: [
        { field: 'status', order: 'asc' },
        { field: 'created_at', order: 'desc' }
      ]
    }

    const result = builder.build('posts', filter)

    expect(result.sql).toBe('SELECT * FROM posts ORDER BY status ASC, created_at DESC')
  })

  it('should add LIMIT clause', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      limit: 10
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users LIMIT ?')
    expect(result.params).toEqual([10])
  })

  it('should add OFFSET clause', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      offset: 20
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users OFFSET ?')
    expect(result.params).toEqual([20])
  })

  it('should build complex query with all features', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'status', operator: 'equals', value: 'active' },
          { field: 'age', operator: 'greater_than', value: 18 }
        ]
      },
      sort: [
        { field: 'created_at', order: 'desc' }
      ],
      limit: 10,
      offset: 20
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (status = ? AND age > ?) ORDER BY created_at DESC LIMIT ? OFFSET ?')
    expect(result.params).toEqual(['active', 18, 10, 20])
  })

  it('should handle offset of 0 (falsy value)', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      limit: 10,
      offset: 0
    }

    const result = builder.build('users', filter)

    // Offset 0 is falsy, so it won't be included in the query
    expect(result.sql).toBe('SELECT * FROM users LIMIT ?')
    expect(result.params).toEqual([10])
  })

  it('should report errors for unsupported operators', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'location', operator: 'near', value: [0, 0] }
        ]
      }
    }

    const result = builder.build('places', filter)

    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('near')
  })

  it('should sanitize field names', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'user_name', operator: 'equals', value: 'test' }
        ]
      }
    }

    const result = builder.build('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (user_name = ?)')
  })

  it('should handle JSON field access', () => {
    const builder = new QueryFilterBuilder()
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'data.title', operator: 'equals', value: 'Test' }
        ]
      }
    }

    const result = builder.build('posts', filter)

    expect(result.sql).toContain('json_extract(data, \'$.title\')')
  })
})

describe('buildQuery helper', () => {
  it('should build query using helper function', () => {
    const filter: QueryFilter = {
      where: {
        and: [
          { field: 'name', operator: 'equals', value: 'John' }
        ]
      },
      limit: 5
    }

    const result = buildQuery('users', filter)

    expect(result.sql).toBe('SELECT * FROM users WHERE (name = ?) LIMIT ?')
    expect(result.params).toEqual(['John', 5])
  })

  it('should parse filter from query string', () => {
    const query = {
      status: 'active',
      limit: '10',
      offset: '20',
      sort: JSON.stringify([{ field: 'id', order: 'asc' }])
    }

    const filter = QueryFilterBuilder.parseFromQuery(query)

    expect(filter.where?.and).toContainEqual({
      field: 'status',
      operator: 'equals',
      value: 'active'
    })
    expect(filter.limit).toBe(10)
    expect(filter.offset).toBe(20)
    expect(filter.sort).toEqual([{ field: 'id', order: 'asc' }])
  })
})
