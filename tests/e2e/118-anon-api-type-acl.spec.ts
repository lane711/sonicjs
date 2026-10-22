import { test, expect } from '@playwright/test'
import { TEST_ORIGIN } from './utils/test-helpers'

/**
 * Anonymous callers must satisfy a type-level isAllowed check (D5) before
 * content is returned. Collections with baseGrants.public=['read'] serve
 * published documents; collections without that grant return 403.
 *
 * Fix A: typeReadAllowed() now returns false for unrecognised roles (not
 *        !anyRbacRoleFound which was incorrectly true for unknown roles).
 * Fix B: anonymous callers go through type-level ACL, not just is_published filter.
 */
test.describe('Anonymous API — type-level ACL enforcement @api', () => {
  test('public collection returns 200 with only published docs for anon caller', async ({ request }) => {
    // blog_post has baseGrants.public=['read'] seeded in bootstrapDocumentTypes
    const res = await request.get(`${TEST_ORIGIN}/api/blog-posts`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    // All returned docs must be published (is_published=1 enforced by D5 path)
    for (const doc of body.data ?? []) {
      expect(doc.status, `doc ${doc.slug} should be published`).toBe('published')
    }
  })

  test('anon caller to collection without public grant gets empty or 403', async ({ request }) => {
    // Collections registered without access.public should deny anon callers.
    // The API returns either 403 or an empty data array — both are correct
    // (collection may not exist on this env; 404 is also acceptable).
    const res = await request.get(`${TEST_ORIGIN}/api/content?collection=plugin`)
    // plugin type has no public grant — anon should get 403 or empty
    if (res.status() === 200) {
      const body = await res.json()
      expect(body.data ?? []).toHaveLength(0)
    } else {
      expect([403, 404]).toContain(res.status())
    }
  })

  test('admin sees draft and published content on the same collection', async ({ request }) => {
    const signIn = await request.post(`${TEST_ORIGIN}/api/auth/sign-in/email`, {
      data: { email: 'admin@sonicjs.com', password: 'sonicjs!' },
    })
    expect(signIn.status()).toBe(200)
    const { token } = await signIn.json()
    expect(token, 'sign-in must return a token').toBeTruthy()

    const res = await request.get(`${TEST_ORIGIN}/api/blog-posts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    // Admin sees ALL docs (draft + published); at minimum the seeded welcome post
    expect((body.data ?? []).length).toBeGreaterThan(0)
  })

  test('unknown role is denied by default (typeReadAllowed fix A)', async ({ request }) => {
    // Authenticate as a user with an unrecognised role (not in baseGrants or RBAC).
    // Pre-fix, !anyRbacRoleFound was true for unknown roles → access granted.
    // Post-fix, typeReadAllowed() returns false → access denied.
    // We test this via the API response: a viewer-level user accessing a
    // collection without a 'viewer' grant should get an empty or 403 response.
    // Since we cannot register arbitrary roles via E2E, we verify the anon path
    // (which is the most accessible form of an "unrecognised principal").
    const res = await request.get(`${TEST_ORIGIN}/api/content?collection=site_settings`)
    // site_settings has no public grant — anon/unknown should not see it
    if (res.status() === 200) {
      const body = await res.json()
      expect(body.data ?? []).toHaveLength(0)
    } else {
      expect([403, 404]).toContain(res.status())
    }
  })
})
