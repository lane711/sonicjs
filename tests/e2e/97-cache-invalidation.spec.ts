/**
 * Cache Invalidation E2E Tests
 *
 * Validates that updating a content item actually invalidates the in-memory
 * and KV API list cache so subsequent GET requests return fresh data.
 *
 * Regression for: invalidation patterns missing `api:` namespace prefix
 * (patterns like `content-filtered:*` never matched stored keys `api:content-filtered:...:v1`)
 */

import { test, expect } from './fixtures'
import { loginAsAdmin, ADMIN_CREDENTIALS, TEST_ORIGIN } from './utils/test-helpers'

const API = TEST_ORIGIN
// Collection slugs use underscores; `blog` is not a registered collection.
const COLLECTION = 'blog_post'

test.describe('Cache invalidation — list freshness after item update @api', () => {
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
    const idsBefore: string[] = (data1?.data ?? []).map((i: any) => i.id)

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
    const createdId = (await createRes.json())?.data?.id
    expect(createdId).toBeTruthy()
    expect(idsBefore).not.toContain(createdId)

    // Fetch list again — must contain the new item, not a stale cached page.
    // Checked by id rather than by row count: the list is capped at 50 per page, so once the
    // collection holds a full page the count stops growing and a count assertion passes or
    // fails on how much seed data happens to exist. The item is on page one because document
    // lists are ordered newest-first.
    const list2 = await request.get(`${API}/api/${COLLECTION}`)
    expect(list2.status()).toBe(200)
    const data2 = await list2.json()
    expect((data2?.data ?? []).map((i: any) => i.id)).toContain(createdId)
  })

  test('updating item via public API invalidates list cache', async ({ request }) => {
    const loginRes = await request.post(`${API}/auth/sign-in/email`, {
      data: { email: ADMIN_CREDENTIALS.email, password: ADMIN_CREDENTIALS.password },
      headers: { 'Content-Type': 'application/json', Origin: TEST_ORIGIN },
    })
    expect(loginRes.ok()).toBeTruthy()

    // Create the item this test will edit, so it never depends on seeded content.
    const stamp = Date.now()
    const createRes = await request.post(`${API}/api/${COLLECTION}`, {
      data: { title: `Cache update target ${stamp}`, slug: `cache-update-${stamp}`, data: {} },
      headers: { 'Content-Type': 'application/json', Origin: TEST_ORIGIN },
    })
    expect(createRes.ok()).toBeTruthy()
    const created = (await createRes.json())?.data
    expect(created?.id).toBeTruthy()

    // Prime the list cache with the pre-update title.
    const list1 = await request.get(`${API}/api/${COLLECTION}`)
    expect(list1.status()).toBe(200)
    expect(((await list1.json())?.data ?? []).some((i: any) => i.id === created.id)).toBe(true)

    const newTitle = `Cache update target ${stamp} (updated)`
    const updateRes = await request.put(`${API}/api/${COLLECTION}/${created.id}`, {
      data: { title: newTitle },
      headers: { 'Content-Type': 'application/json', Origin: TEST_ORIGIN },
    })
    expect(updateRes.ok()).toBeTruthy()

    // The very next read must be fresh — no stale-while-revalidate serve of the old title.
    const list2 = await request.get(`${API}/api/${COLLECTION}`)
    expect(list2.status()).toBe(200)
    const updated = ((await list2.json())?.data ?? []).find((i: any) => i.id === created.id)
    expect(updated).toBeDefined()
    expect(updated?.title).toBe(newTitle)
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
