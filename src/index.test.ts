import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'
import app from '.'


describe('Blog API', () => {
  test('GET /posts', async () => {
    const res = await app.request('/', {}, env)
    expect(res.status).toBe(200)
    // const body = (await res.json()) as { posts: Post[] }
    // expect(body['posts']).not.toBeUndefined()
    // expect(body['posts'].length).toBe(0)
  })
});
