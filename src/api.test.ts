import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'
import worker from '../src/api'
import type { Post } from './model'

describe('Blog API', () => {
  test('GET /posts', async () => {
    const res = await worker.request('/posts', {}, env)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { posts: Post[] }
    expect(body['posts']).not.toBeUndefined()
    expect(body['posts'].length).toBe(0)
  })

  let newPostId = ''

  test('POST /posts', async () => {
    const payload = JSON.stringify({ title: 'Morning', body: 'Good Morning' })
    const res = await worker.request(
      '/posts',
      {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' }
      },
      env
    )
    expect(res.status).toBe(201)
    const body = (await res.json()) as { post: Post }
    const newPost = body['post']
    expect(newPost.title).toBe('Morning')
    expect(newPost.body).toBe('Good Morning')
    newPostId = newPost.id
  })

  test('GET /posts', async () => {
    const res = await worker.request('/posts', {}, env)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { posts: Post[] }
    expect(body['posts']).not.toBeUndefined()
    expect(body['posts'].length).toBe(1)
  })

  test('POST /posts/:id', async () => {
    const res = await worker.request(`/posts/${newPostId}`, {}, env)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { post: Post }
    const post = body['post'] as Post
    expect(post.id).toBe(newPostId)
    expect(post.title).toBe('Morning')
  })

  test('PUT /posts/:id', async () => {
    const payload = JSON.stringify({ title: 'Night', body: 'Good Night' })
    const res = await worker.request(
      `/posts/${newPostId}`,
      {
        method: 'PUT',
        body: payload,
        headers: { 'Content-Type': 'application/json' }
      },
      env
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: Boolean }
    expect(body['ok']).toBeTruthy()
  })

  test('GET /posts/:id', async () => {
    const res = await worker.request(`/posts/${newPostId}`, {}, env)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { post: Post }
    const post = body['post']
    expect(post.title).toBe('Night')
    expect(post.body).toBe('Good Night')
  })

  test('DELETE /posts/:id', async () => {
    const res = await worker.request(
      `/posts/${newPostId}`,
      {
        method: 'DELETE'
      },
      env
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: Boolean }
    expect(body['ok']).toBeTruthy()
  })

  test('GET /posts/:id', async () => {
    const res = await worker.request(`/posts/${newPostId}`, {}, env)
    expect(res.status).toBe(404)
  })
})
