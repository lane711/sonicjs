# Query Filter System

The Query Filter system provides a powerful, flexible way to filter content in SonicJS AI. It supports all major SQL operations and translates them into safe, parameterized queries.

## Features

- ✅ **14 Filter Operators**: equals, not_equals, greater_than, greater_than_equal, less_than, less_than_equal, like, contains, in, not_in, all, exists, and more
- ✅ **AND/OR Logic**: Combine filters with complex boolean logic
- ✅ **SQL Injection Safe**: All queries use parameterized statements
- ✅ **JSON Field Support**: Query nested JSON fields using dot notation
- ✅ **Sorting**: Multi-field sorting with ASC/DESC
- ✅ **Pagination**: Built-in LIMIT and OFFSET support
- ✅ **Type Safe**: Full TypeScript support
- ✅ **Tested**: Comprehensive test coverage (29 tests)

## Quick Start

```typescript
import { QueryFilterBuilder, QueryFilter } from './utils/query-filter'

// Create a filter
const filter: QueryFilter = {
  where: {
    and: [
      { field: 'status', operator: 'equals', value: 'published' },
      { field: 'views', operator: 'greater_than', value: 100 }
    ]
  },
  sort: [
    { field: 'views', order: 'desc' }
  ],
  limit: 10
}

// Build SQL query
const builder = new QueryFilterBuilder()
const result = builder.build('content', filter)

// result.sql => "SELECT * FROM content WHERE (status = ? AND views > ?) ORDER BY views DESC LIMIT ?"
// result.params => ['published', 100, 10]
```

## Supported Operators

### Equality Operators

- **equals**: Exact match (handles NULL)
- **not_equals**: Not equal (handles NULL)

### Comparison Operators

- **greater_than**: `>` for numbers/dates
- **greater_than_equal**: `>=` for numbers/dates
- **less_than**: `<` for numbers/dates
- **less_than_equal**: `<=` for numbers/dates

### String Operators

- **like**: Case-insensitive, all words must be present
- **contains**: Case-insensitive substring match

### Array Operators

- **in**: Value in comma-delimited list or array
- **not_in**: Value not in comma-delimited list or array
- **all**: Contains all values in list

### Existence Operators

- **exists**: Field exists (true) or doesn't exist (false)

### Spatial Operators (Not Supported in SQLite)

- **near**: Distance-based (requires spatial extension)
- **within**: Points within area (requires spatial extension)
- **intersects**: Points intersecting area (requires spatial extension)

## Usage Examples

### Simple Equality

```typescript
const filter: QueryFilter = {
  where: {
    and: [
      { field: 'status', operator: 'equals', value: 'published' }
    ]
  }
}
// SQL: WHERE (status = ?)
// Params: ['published']
```

### Multiple Conditions (AND)

```typescript
const filter: QueryFilter = {
  where: {
    and: [
      { field: 'status', operator: 'equals', value: 'published' },
      { field: 'category', operator: 'equals', value: 'tech' },
      { field: 'views', operator: 'greater_than', value: 100 }
    ]
  }
}
// SQL: WHERE (status = ? AND category = ? AND views > ?)
// Params: ['published', 'tech', 100]
```

### OR Logic

```typescript
const filter: QueryFilter = {
  where: {
    or: [
      { field: 'featured', operator: 'equals', value: true },
      { field: 'promoted', operator: 'equals', value: true }
    ]
  }
}
// SQL: WHERE (featured = ? OR promoted = ?)
// Params: [true, true]
```

### Combined AND/OR

```typescript
const filter: QueryFilter = {
  where: {
    and: [
      { field: 'category', operator: 'equals', value: 'tech' }
    ],
    or: [
      { field: 'featured', operator: 'equals', value: true },
      { field: 'promoted', operator: 'equals', value: true }
    ]
  }
}
// SQL: WHERE (category = ?) AND (featured = ? OR promoted = ?)
// Params: ['tech', true, true]
```

### IN Operator (Array)

```typescript
const filter: QueryFilter = {
  where: {
    and: [
      {
        field: 'status',
        operator: 'in',
        value: ['published', 'review', 'scheduled']
      }
    ]
  }
}
// SQL: WHERE (status IN (?, ?, ?))
// Params: ['published', 'review', 'scheduled']
```

### IN Operator (Comma-Delimited String)

```typescript
const filter: QueryFilter = {
  where: {
    and: [
      {
        field: 'category',
        operator: 'in',
        value: 'tech,science,education'
      }
    ]
  }
}
// SQL: WHERE (category IN (?, ?, ?))
// Params: ['tech', 'science', 'education']
```

### LIKE Operator (Multi-Word)

```typescript
const filter: QueryFilter = {
  where: {
    and: [
      {
        field: 'title',
        operator: 'like',
        value: 'getting started tutorial'
      }
    ]
  }
}
// SQL: WHERE ((title LIKE ? AND title LIKE ? AND title LIKE ?))
// Params: ['%getting%', '%started%', '%tutorial%']
```

### Sorting

```typescript
const filter: QueryFilter = {
  sort: [
    { field: 'priority', order: 'desc' },
    { field: 'created_at', order: 'asc' }
  ]
}
// SQL: ORDER BY priority DESC, created_at ASC
```

### Pagination

```typescript
const filter: QueryFilter = {
  limit: 25,
  offset: 50
}
// SQL: LIMIT ? OFFSET ?
// Params: [25, 50]
```

### JSON Fields

```typescript
const filter: QueryFilter = {
  where: {
    and: [
      {
        field: 'data.author',
        operator: 'equals',
        value: 'John Doe'
      }
    ]
  }
}
// SQL: WHERE (json_extract(data, '$.author') = ?)
// Params: ['John Doe']
```

## API Integration

The query filter system is integrated into the Content API:

### Parse from Query String

```typescript
const query = {
  where: '{"and":[{"field":"status","operator":"equals","value":"published"}]}',
  sort: '[{"field":"created_at","order":"desc"}]',
  limit: '25',
  offset: '50'
}

const filter = QueryFilterBuilder.parseFromQuery(query)
```

### Build and Execute

```typescript
const builder = new QueryFilterBuilder()
const result = builder.build('content', filter)

// Check for errors
if (result.errors.length > 0) {
  console.error('Filter errors:', result.errors)
}

// Execute query
const stmt = db.prepare(result.sql)
const boundStmt = result.params.length > 0
  ? stmt.bind(...result.params)
  : stmt

const { results } = await boundStmt.all()
```

## Security

The query filter system is designed with security as a top priority:

1. **Parameterized Queries**: All values use `?` placeholders
2. **Field Name Sanitization**: Only alphanumeric and underscores allowed
3. **No String Interpolation**: SQL is never built with string concatenation
4. **Type Validation**: All operators validate their input types
5. **Max Limit Enforcement**: Default max of 1000 results

## Testing

The system has comprehensive test coverage:

```bash
npm test -- src/tests/query-filter.test.ts
```

Tests cover:
- All 14 operators
- AND/OR logic
- NULL handling
- Sorting
- Pagination
- JSON fields
- Error handling
- Real-world scenarios

## Performance Tips

1. **Use Indexed Fields**: Filter on database-indexed fields for best performance
2. **Limit Results**: Always specify a `limit` to prevent large result sets
3. **Avoid LIKE on Large Fields**: Use full-text search for large text fields
4. **Use IN Instead of OR**: `IN` is faster than multiple `OR` conditions
5. **Index JSON Fields**: Create indexes on frequently queried JSON paths

## Error Handling

The builder returns errors in the `errors` array:

```typescript
const result = builder.build('content', filter)

if (result.errors.length > 0) {
  console.error('Filter errors:', result.errors)
  // e.g., ["'near' operator not supported in SQLite..."]
}
```

## TypeScript Types

```typescript
type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_equal'
  | 'less_than'
  | 'less_than_equal'
  | 'like'
  | 'contains'
  | 'in'
  | 'not_in'
  | 'all'
  | 'exists'
  | 'near'
  | 'within'
  | 'intersects'

interface FilterCondition {
  field: string
  operator: FilterOperator
  value: any
}

interface FilterGroup {
  and?: FilterCondition[]
  or?: FilterCondition[]
}

interface QueryFilter {
  where?: FilterGroup
  limit?: number
  offset?: number
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }[]
}
```

## Contributing

When adding new operators:

1. Add the operator type to `FilterOperator`
2. Add a case in `buildCondition()`
3. Implement the build method
4. Add comprehensive tests
5. Update documentation

## License

Part of SonicJS AI - See main project license
