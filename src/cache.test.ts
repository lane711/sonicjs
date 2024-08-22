import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'
import worker from './cache'
// import type { Post } from './model'

describe("Cache API", () => {
  test("ping", async () => {
    expect(0).toBe(0);
  });

  test("GET *", async () => {
    const res = await worker.request("/v1/posts?limit=1", {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data[0].title.length).toBeGreaterThan(10);
  });
});
