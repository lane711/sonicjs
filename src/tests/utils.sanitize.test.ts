import { describe, it, expect } from 'vitest'
import { escapeHtml, sanitizeInput, sanitizeObject } from '../utils/sanitize'

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
      '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
    )
  })

  it('should escape ampersand', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should escape less than', () => {
    expect(escapeHtml('5 < 10')).toBe('5 &lt; 10')
  })

  it('should escape greater than', () => {
    expect(escapeHtml('10 > 5')).toBe('10 &gt; 5')
  })

  it('should escape double quotes', () => {
    expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;')
  })

  it('should escape single quotes', () => {
    expect(escapeHtml("It's nice")).toBe('It&#039;s nice')
  })

  it('should handle mixed special characters', () => {
    expect(escapeHtml('<a href="url">Link & "text"</a>')).toBe(
      '&lt;a href=&quot;url&quot;&gt;Link &amp; &quot;text&quot;&lt;/a&gt;'
    )
  })

  it('should return empty string for non-string input', () => {
    expect(escapeHtml(null as any)).toBe('')
    expect(escapeHtml(undefined as any)).toBe('')
    expect(escapeHtml(123 as any)).toBe('')
    expect(escapeHtml({} as any)).toBe('')
  })

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('should not modify safe text', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })
})

describe('sanitizeInput', () => {
  it('should sanitize HTML and trim whitespace', () => {
    expect(sanitizeInput('  <script>alert()</script>  ')).toBe(
      '&lt;script&gt;alert()&lt;/script&gt;'
    )
  })

  it('should handle null input', () => {
    expect(sanitizeInput(null)).toBe('')
  })

  it('should handle undefined input', () => {
    expect(sanitizeInput(undefined)).toBe('')
  })

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })

  it('should sanitize and trim', () => {
    expect(sanitizeInput('  <div>Test</div>  ')).toBe('&lt;div&gt;Test&lt;/div&gt;')
  })

  it('should convert non-string to string', () => {
    expect(sanitizeInput('123')).toBe('123')
  })

  it('should handle strings with only whitespace', () => {
    expect(sanitizeInput('   ')).toBe('')
  })
})

describe('sanitizeObject', () => {
  it('should sanitize specified string fields', () => {
    const obj = {
      name: '<script>alert()</script>',
      email: 'test@example.com',
      age: 25
    }

    const sanitized = sanitizeObject(obj, ['name', 'email'])

    expect(sanitized.name).toBe('&lt;script&gt;alert()&lt;/script&gt;')
    expect(sanitized.email).toBe('test@example.com')
    expect(sanitized.age).toBe(25)
  })

  it('should only sanitize string fields', () => {
    const obj = {
      title: '<h1>Title</h1>',
      count: 42,
      active: true
    }

    const sanitized = sanitizeObject(obj, ['title', 'count' as any, 'active' as any])

    expect(sanitized.title).toBe('&lt;h1&gt;Title&lt;/h1&gt;')
    expect(sanitized.count).toBe(42)
    expect(sanitized.active).toBe(true)
  })

  it('should handle empty fields array', () => {
    const obj = { name: '<script></script>', email: 'test@example.com' }
    const sanitized = sanitizeObject(obj, [])

    expect(sanitized).toEqual(obj)
  })

  it('should not mutate original object', () => {
    const obj = { name: '<script>alert()</script>' }
    const sanitized = sanitizeObject(obj, ['name'])

    expect(obj.name).toBe('<script>alert()</script>')
    expect(sanitized.name).toBe('&lt;script&gt;alert()&lt;/script&gt;')
  })

  it('should handle objects with nested properties', () => {
    const obj = {
      user: {
        name: '<script>XSS</script>'
      },
      title: '<h1>Title</h1>'
    }

    const sanitized = sanitizeObject(obj, ['title'])

    expect(sanitized.title).toBe('&lt;h1&gt;Title&lt;/h1&gt;')
    expect(sanitized.user.name).toBe('<script>XSS</script>') // Not sanitized
  })

  it('should sanitize multiple fields', () => {
    const obj = {
      firstName: '  <b>John</b>  ',
      lastName: '  <i>Doe</i>  ',
      age: 30
    }

    const sanitized = sanitizeObject(obj, ['firstName', 'lastName'])

    expect(sanitized.firstName).toBe('&lt;b&gt;John&lt;/b&gt;')
    expect(sanitized.lastName).toBe('&lt;i&gt;Doe&lt;/i&gt;')
  })

  it('should handle fields that do not exist', () => {
    const obj = { name: 'John' }
    const sanitized = sanitizeObject(obj, ['name', 'nonexistent' as any])

    expect(sanitized.name).toBe('John')
    expect(sanitized.nonexistent).toBeUndefined()
  })
})
