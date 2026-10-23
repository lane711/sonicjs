import { test, expect } from '@playwright/test'

test.describe('public surface hardening @smoke @api', () => {
  test('GET /api/system/stats requires auth', async ({ request }) => {
    const res = await request.get('/api/system/stats')
    expect(res.status()).toBe(401)
  })

  test('GET /api/system/env requires auth', async ({ request }) => {
    const res = await request.get('/api/system/env')
    expect(res.status()).toBe(401)
  })

  test('GET /api/system/health stays public', async ({ request }) => {
    const res = await request.get('/api/system/health')
    expect(res.status()).not.toBe(401)
  })

  test('oversized form submission is rejected with 413', async ({ request }) => {
    // The body-size guard runs before the form lookup, so any identifier works.
    const res = await request.post('/api/forms/anything/submit', {
      headers: { 'content-type': 'application/json' },
      data: { data: { blob: 'x'.repeat(600 * 1024) } }, // > 512KB ceiling
    })
    expect(res.status()).toBe(413)
  })
})
