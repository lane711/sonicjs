import { describe, it, expect, vi, beforeEach } from 'vitest'

// Concurrency regression guard.
//
// `bootstrapComplete` is only set at the END of the bootstrap, so it cannot keep a second request
// out while the first is still working. Every request that landed on a cold isolate before the
// first one finished therefore saw `false` and ran the whole bootstrap again. The cost is not N
// parallel bootstraps but N interleaved ones — each copy's serial D1 round trips queue behind
// every other copy's — so all N requests take roughly N times what one cold bootstrap costs.
//
// Ordinary traffic reaches this: an admin dashboard load fires five fragment requests at once. A
// four-worker Playwright run hits it on every cold start, where it showed up as batches of
// unrelated requests — browser navigations and API calls alike — stalling past 30s on preview
// deployments with nothing in the logs. No errors, no 429s; the isolate was just redoing work it
// had already begun.
//
// These tests assert one bootstrap per isolate no matter how many requests race for it.

vi.mock('../../services/collection-loader', () => ({ loadCollectionConfigs: vi.fn(async () => []) }))
vi.mock('../../services/collection-registry', () => ({
  getCollectionRegistry: () => ({ register: vi.fn(), listActive: () => [] }),
}))
vi.mock('../../services/document-types-seed', () => ({
  bootstrapDocumentTypes: vi.fn(async () => {}),
  autoRegisterCollectionDocumentTypes: vi.fn(async () => {}),
  bootstrapDefaultContent: vi.fn(async () => {}),
}))
vi.mock('../../plugins/cache/services/cache', () => ({ setGlobalKVNamespace: vi.fn() }))
vi.mock('../../plugins/cache/services/catalog', () => ({
  setGlobalCatalogKv: vi.fn(),
  loadKvCatalog: vi.fn(async () => {}),
}))

type Probe = { kvGets: string[]; d1Queries: string[] }

/**
 * A context whose KV read does not resolve until the next macrotask.
 *
 * The gate is taken synchronously, so the race is already closed without this — but a mock that
 * resolves immediately would also pass against a middleware with no gate at all, since each
 * request could then run start-to-finish before the next one began. The delay forces genuine
 * overlap, so the test fails if the gate is removed.
 */
function makeContext(probe: Probe, opts: { failD1?: boolean } = {}) {
  return {
    env: {
      JWT_SECRET: 'a-strong-random-secret-value-for-tests',
      CORS_ORIGINS: 'http://localhost:8787',
      ENVIRONMENT: 'development',
      DB: {
        prepare(sql: string) {
          probe.d1Queries.push(sql)
          return {
            bind: () => this,
            first: async () => {
              if (opts.failD1) throw new Error('D1 unavailable')
              return { n: 1 }
            },
            all: async () => ({ results: [] }),
            run: async () => ({}),
          }
        },
        batch: async () => [],
      },
      CACHE_KV: {
        get: async (key: string) => {
          probe.kvGets.push(key)
          await new Promise((r) => setTimeout(r, 5))
          return '1'
        },
        put: async () => {},
        delete: async () => {},
      },
    },
    req: {
      path: '/admin/content',
      url: 'https://sonicjs-pr-demo.workers.dev/admin/content',
      header: (name: string) => (name.toLowerCase() === 'host' ? 'sonicjs-pr-demo.workers.dev' : ''),
    },
    executionCtx: { waitUntil: () => {} },
    set: () => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal Hono context stand-in
  } as any
}

async function freshMiddleware() {
  // `bootstrapComplete` and the in-flight holder are per-isolate module globals, so each case
  // needs the module re-evaluated or the previous case's completed bootstrap short-circuits it.
  vi.resetModules()
  const { bootstrapMiddleware } = await import('../../middleware/bootstrap')
  return bootstrapMiddleware({})
}

describe('bootstrapMiddleware runs one bootstrap per isolate under concurrency', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('collapses a burst of cold-start requests into a single bootstrap', async () => {
    const mw = await freshMiddleware()
    const probe: Probe = { kvGets: [], d1Queries: [] }
    let nextCalls = 0

    // Five at once: what a dashboard load costs, and what the fragment specs send.
    await Promise.all(
      Array.from({ length: 5 }, () =>
        mw(makeContext(probe), async () => {
          nextCalls += 1
        })
      )
    )

    // The work happened once...
    expect(probe.kvGets).toHaveLength(1)
    expect(probe.d1Queries.filter((q) => q.includes('document_types'))).toHaveLength(1)
    // ...and every request still reached the handler behind it.
    expect(nextCalls).toBe(5)
  })

  it('serves later requests from the completed bootstrap without redoing it', async () => {
    const mw = await freshMiddleware()
    const probe: Probe = { kvGets: [], d1Queries: [] }

    await mw(makeContext(probe), async () => {})
    const afterFirst = probe.kvGets.length
    await mw(makeContext(probe), async () => {})

    expect(afterFirst).toBe(1)
    expect(probe.kvGets).toHaveLength(1)
  })

  it('releases the gate when a bootstrap fails, so the next request can retry', async () => {
    // A gate held by a failed attempt would park every later request on this isolate forever —
    // strictly worse than the duplicate work it exists to prevent. The D1 mock throws from
    // `first()`, which is inside the fast path's own try/catch, so the run falls through to the
    // full bootstrap and completes; what matters is that a second request is not blocked.
    const mw = await freshMiddleware()
    const probe: Probe = { kvGets: [], d1Queries: [] }
    let nextCalls = 0

    await mw(makeContext(probe, { failD1: true }), async () => { nextCalls += 1 })
    await mw(makeContext(probe, { failD1: true }), async () => { nextCalls += 1 })

    expect(nextCalls).toBe(2)
  })
})
