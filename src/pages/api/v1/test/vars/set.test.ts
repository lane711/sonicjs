// import { describe, expect, test, vi } from 'vitest';
// import { GET } from './set';
// import type { APIContext } from 'astro';
// import type { Runtime } from '@astrojs/cloudflare';
// import type { AstroCookies } from 'astro';

// describe('Vars Set Endpoint', () => {
//   const createMockContext = (url: string): APIContext => ({
//     locals: {
//       runtime: {
//         env: {
//           CF_PAGES: '1',
//           CF_PAGES_BRANCH: 'main',
//           CF_PAGES_COMMIT_SHA: '450099b920e1ea178a5bf0c48619c40d25ecd4ae',
//           CF_PAGES_URL: 'https://2c1d1144.sonicjs-emx.pages.dev',
//           D1DATA: { fetcher: {} },
//           KVDATA: {},
//           TESTING_MODE: true
//         },
//         cf: {
//           fetch: vi.fn().mockResolvedValue(new Response()),
//         } as any,
//         caches: {
//           default: {
//             match: vi.fn(),
//             put: vi.fn(),
//             delete: vi.fn()
//           },
//           open: vi.fn().mockResolvedValue({
//             match: vi.fn(),
//             put: vi.fn(),
//             delete: vi.fn()
//           })
//         },
//         ctx: {
//           waitUntil: vi.fn(),
//           passThroughOnException: vi.fn(),
//           props: {}
//         }
//       }
//     },
//     request: new Request(url),
//     site: new URL('http://localhost'),
//     generator: 'test',
//     params: {},
//     redirect: vi.fn(),
//     cookies: {
//       get: vi.fn(),
//       set: vi.fn(),
//       delete: vi.fn(),
//       has: vi.fn(),
//       headers: vi.fn().mockReturnValue(new Headers()),
//       merge: vi.fn()
//     } as unknown as AstroCookies,
//     url: new URL(url),
//     clientAddress: '127.0.0.1'
//   });

//   describe('GET method', () => {
//     test('should set environment variable successfully', async () => {
//       const context = createMockContext('http://localhost/api/v1/test/vars/set/TEST_KEY=test_value');
//       const response = await GET(context);
//       const data = await response.json();

//       expect(response.status).toBe(200);
//       expect(data).toEqual({
//         key: 'TEST_KEY',
//         value: 'test_value'
//       });
//       expect(context.locals.runtime.env.TEST_KEY).toBe('test_value');
//     });

//     test('should return 400 when key is missing', async () => {
//       const context = createMockContext('http://localhost/api/v1/test/vars/set/=test_value');
//       const response = await GET(context);
//       const data = await response.json();

//       expect(response.status).toBe(400);
//       expect(data).toEqual({
//         message: 'Missing key or value'
//       });
//     });

//     test('should return 400 when value is missing', async () => {
//       const context = createMockContext('http://localhost/api/v1/test/vars/set/TEST_KEY=');
//       const response = await GET(context);
//       const data = await response.json();

//       expect(response.status).toBe(400);
//       expect(data).toEqual({
//         message: 'Missing key or value'
//       });
//     });

//     test('should handle URL encoded values', async () => {
//       const context = createMockContext('http://localhost/api/v1/test/vars/set/TEST_KEY=test%20value%20with%20spaces');
//       const response = await GET(context);
//       const data = await response.json();

//       expect(response.status).toBe(200);
//       expect(data).toEqual({
//         key: 'TEST_KEY',
//         value: 'test value with spaces'
//       });
//       expect(context.locals.runtime.env.TEST_KEY).toBe('test value with spaces');
//     });
//   });

// }); 