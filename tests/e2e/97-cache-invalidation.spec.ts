/**
 * Cache Invalidation E2E Tests
 *
 * Validates that updating a content item actually invalidates the in-memory
 * and KV API list cache so subsequent GET requests return fresh data.
 *
 * Regression for: invalidation patterns missing `api:` namespace prefix
 * (patterns like `content-filtered:*` never matched stored keys `api:content-filtered:...:v1`)
 */

import { test, expect } from '@playwright/test'
import { loginAsAdmin, ADMIN_CREDENTIALS, TEST_ORIGIN } from './utils/test-helpers'

const API = TEST_ORIGIN
// Collection slugs use underscores; `blog` is not a registered collection.
const COLLECTION = 'blog_post'

test.describe('Cache invalidation — list freshness after item update', () => {
  test('creating item via public API invalidates list cache', async ({ request }) => {
    const loginRes = await request.post(`${API}/auth/sign-in/email`, {
      data: { email: ADMIN_CREDENTIALS.email, password: ADMIN_CREDENTIALS.password },
      headers: { 'Content-Type': 'application/json', Origin: TEST_ORIGIN },
    })
    expect(loginRes.ok()).toBeTruthy()

    // Fetch list — populate cache
    const list1 = await request.get(`${API}/api/${COLLECTION}`)
    expect(list1.status()).toBe(200)
    const data1 = await list1.json()
    const countBefore: number = (data1?.data ?? []).length

    // Create new item
    const stamp = Date.now()
    const createRes = await request.post(`${API}/api/${COLLECTION}`, {
      data: {
        title: `Cache test item ${stamp}`,
        slug: `cache-test-${stamp}`,
        data: {},
      },
      headers: { 'Content-Type': 'application/json', Origin: TEST_ORIGIN },
    })
    expect(createRes.ok()).toBeTruthy()

    // Fetch list again — must reflect new item, not return stale cached count
    const list2 = await request.get(`${API}/api/${COLLECTION}`)
    expect(list2.status()).toBe(200)
    const data2 = await list2.json()
    const countAfter: number = (data2?.data ?? []).length

    expect(countAfter).toBeGreaterThan(countBefore)
  })

  test('admin clear cache endpoint restores fresh list', async ({ page }) => {
    await loginAsAdmin(page)

    // Prime the list cache
    await page.request.get(`${API}/api/${COLLECTION}`)

    // Clear all caches via admin endpoint
    const clearRes = await page.request.post(`${API}/admin/cache/clear`)
    expect(clearRes.status()).toBe(200)
    const clearData = await clearRes.json()
    expect(clearData.success).toBe(true)

    // List should still be fetchable after clear
    const listRes = await page.request.get(`${API}/api/${COLLECTION}`)
    expect(listRes.status()).toBe(200)
  })
})
