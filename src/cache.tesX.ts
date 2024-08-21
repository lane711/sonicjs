// import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'
// import worker from './cache'
// import type { Post } from './model'

describe("Cache API", () => {
  test("ping", async () => {
    expect(0).toBe(0);
  });

  // test("GET *", async () => {
  //   const res = await worker.request("/v1/anything", {}, env);
  //   expect(res.status).toBe(200);
  //   const body = (await res.json()) as { posts: Post[] };
  //   expect(body["posts"]).not.toBeUndefined();
  //   expect(body["posts"].length).toBe(0);
  // });
});
