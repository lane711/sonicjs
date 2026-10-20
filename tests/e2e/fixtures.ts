import { test as base } from '@playwright/test'
import type { Browser, BrowserContext, Page, Response } from '@playwright/test'

/**
 * Drop-in replacement for `@playwright/test` that hardens navigation against the admin UI's
 * long-lived background requests.
 *
 * Every admin page fires polling/metrics fetches (`/admin/api/migrations/status`,
 * `/admin/dashboard/*`). Each one answers in well under a second on its own — but when a page
 * object is reused across several admin navigations, as every spec does, requests issued by the
 * previous document stay in flight and the next navigation's `load` event never fires. Measured
 * against a CI preview deployment: a FRESH page reaches `load` on /admin/content in 2.5s, while
 * the same navigation on a REUSED page sits unresolved past 45s. `domcontentloaded` is under a
 * second in both cases.
 *
 * In CI that surfaced as `page.goto: net::ERR_ABORTED; maybe frame was detached?` — the frame
 * being torn down by the 60s test timeout while goto was still waiting for `load` — plus
 * `waitForURL`/`waitForNavigation`/`waitForLoadState` timeouts "waiting for navigation until
 * load". It accounted for most of the suite's failures and flakes. It is a navigation-strategy
 * problem, not a server problem: the same URLs fetched directly all answer 200.
 *
 * So: a `load`-settling wait gets one bounded attempt, and on a timeout/abort falls back to
 * `domcontentloaded`. The first stall marks the page, after which later waits skip straight to
 * `domcontentloaded` — otherwise a four-navigation test would burn four timeouts and blow its
 * own 60s budget. Specs that already pass an explicit non-`load` strategy are untouched, and a
 * navigation that genuinely fails (bad status, DNS, connection refused) still throws.
 */
export * from '@playwright/test'

/** How long to give `load` before falling back. Comfortably above the ~3.5s a healthy page takes. */
const LOAD_ATTEMPT_TIMEOUT_MS = 15_000

/** The fallback only re-checks already-satisfied state, so it needs no real budget. */
const FALLBACK_TIMEOUT_MS = 10_000

function isNavigationStall(error: unknown): boolean {
  const message = String((error as Error)?.message ?? error)
  return (
    message.includes('net::ERR_ABORTED') ||
    message.includes('frame was detached') ||
    message.includes('Timeout') ||
    message.includes('timeout')
  )
}

/** `load` and `networkidle` are the states a never-settling background poll can block. */
function waitsOnSubresources(waitUntil: string | undefined): boolean {
  return waitUntil === undefined || waitUntil === 'load' || waitUntil === 'networkidle'
}

/** Pages and contexts can reach the wrappers by more than one route, so both guards are needed. */
const HARDENED = Symbol.for('sonicjs.e2e.hardenedPage')
const HARDENED_CONTEXT = Symbol.for('sonicjs.e2e.hardenedContext')

/**
 * Set once any page in this worker has demonstrated that `load` does not arrive. Whether the
 * deployment settles is a property of the deployment, not of one page, so the probe is worth
 * paying once per worker process and never again — re-probing per page is what turns one slow
 * deployment into a wall of 60s test timeouts.
 */
let loadEventIsUnreachable = false

function hardenPage(page: Page): Page {
  if ((page as unknown as Record<symbol, boolean>)[HARDENED]) return page
  ;(page as unknown as Record<symbol, boolean>)[HARDENED] = true

  const originalGoto = page.goto.bind(page)
  const originalReload = page.reload.bind(page)
  const originalWaitForLoadState = page.waitForLoadState.bind(page)
  const originalWaitForURL = page.waitForURL.bind(page)
  const originalWaitForNavigation = page.waitForNavigation.bind(page)

  page.goto = async (url: string, options?: Parameters<Page['goto']>[1]): Promise<Response | null> => {
    // 'domcontentloaded' / 'commit' do not wait on subresources, so they never hit this.
    if (!waitsOnSubresources(options?.waitUntil)) return originalGoto(url, options)
    if (loadEventIsUnreachable) return originalGoto(url, { ...options, waitUntil: 'domcontentloaded' })

    const bounded = Math.min(options?.timeout ?? LOAD_ATTEMPT_TIMEOUT_MS, LOAD_ATTEMPT_TIMEOUT_MS)
    try {
      return await originalGoto(url, { ...options, timeout: bounded })
    } catch (error) {
      if (!isNavigationStall(error)) throw error
      loadEventIsUnreachable = true
      // The document itself is fine — only the settle condition was unreachable.
      return await originalGoto(url, { ...options, waitUntil: 'domcontentloaded' })
    }
  }

  page.reload = async (options?: Parameters<Page['reload']>[0]): Promise<Response | null> => {
    // Same contract as goto, and the media library in particular reloads straight into the stall.
    if (!waitsOnSubresources(options?.waitUntil)) return originalReload(options)
    if (loadEventIsUnreachable) return originalReload({ ...options, waitUntil: 'domcontentloaded' })

    const bounded = Math.min(options?.timeout ?? LOAD_ATTEMPT_TIMEOUT_MS, LOAD_ATTEMPT_TIMEOUT_MS)
    try {
      return await originalReload({ ...options, timeout: bounded })
    } catch (error) {
      if (!isNavigationStall(error)) throw error
      loadEventIsUnreachable = true
      return await originalReload({ ...options, waitUntil: 'domcontentloaded' })
    }
  }

  page.waitForLoadState = async (
    state?: Parameters<Page['waitForLoadState']>[0],
    options?: Parameters<Page['waitForLoadState']>[1]
  ): Promise<void> => {
    if (!waitsOnSubresources(state)) return originalWaitForLoadState(state, options)
    if (loadEventIsUnreachable) return originalWaitForLoadState('domcontentloaded', options)

    const bounded = Math.min(options?.timeout ?? LOAD_ATTEMPT_TIMEOUT_MS, LOAD_ATTEMPT_TIMEOUT_MS)
    try {
      await originalWaitForLoadState(state, { ...options, timeout: bounded })
    } catch (error) {
      if (!isNavigationStall(error)) throw error
      loadEventIsUnreachable = true
      // Settling is advisory: callers follow it with assertions that auto-wait for what they
      // actually need, so blocking the whole test on an idle state that will never arrive buys
      // nothing. Make sure the document at least parsed, then carry on.
      await originalWaitForLoadState('domcontentloaded', { timeout: FALLBACK_TIMEOUT_MS })
    }
  }

  page.waitForURL = async (
    url: Parameters<Page['waitForURL']>[0],
    options?: Parameters<Page['waitForURL']>[1]
  ): Promise<void> => {
    if (!waitsOnSubresources(options?.waitUntil)) return originalWaitForURL(url, options)
    if (loadEventIsUnreachable) {
      return originalWaitForURL(url, { ...options, waitUntil: 'domcontentloaded' })
    }

    const bounded = Math.min(options?.timeout ?? LOAD_ATTEMPT_TIMEOUT_MS, LOAD_ATTEMPT_TIMEOUT_MS)
    try {
      await originalWaitForURL(url, { ...options, timeout: bounded })
    } catch (error) {
      if (!isNavigationStall(error)) throw error
      loadEventIsUnreachable = true
      // Safe to retry: waitForURL tests the CURRENT url, so if the navigation did happen while
      // we were waiting on `load`, the retry matches immediately. If it never happened, this
      // still waits for it — just without the unreachable settle condition.
      await originalWaitForURL(url, { ...options, waitUntil: 'domcontentloaded', timeout: FALLBACK_TIMEOUT_MS })
    }
  }

  page.waitForNavigation = ((options?: Parameters<Page['waitForNavigation']>[0]) => {
    // Unlike the others this one cannot be retried: it has to be armed BEFORE the action that
    // navigates, and by the time a first attempt timed out that action is long past — a second
    // call would sit waiting for a navigation that already happened. Downgrade up front instead,
    // which can only ever resolve earlier than the caller asked for, never later.
    if (!waitsOnSubresources(options?.waitUntil)) return originalWaitForNavigation(options)
    return originalWaitForNavigation({ ...options, waitUntil: 'domcontentloaded' })
  }) as Page['waitForNavigation']

  return page
}

function hardenContext(context: BrowserContext): BrowserContext {
  if ((context as unknown as Record<symbol, boolean>)[HARDENED_CONTEXT]) return context
  ;(context as unknown as Record<symbol, boolean>)[HARDENED_CONTEXT] = true

  const originalNewPage = context.newPage.bind(context)
  context.newPage = async () => hardenPage(await originalNewPage())
  return context
}

export const test = base.extend<{ page: Page; context: BrowserContext }, { browser: Browser }>({
  // Worker-scoped, because `browser` is. A good number of specs open their own page or context
  // off the raw `browser` handle in a beforeAll instead of taking the `page` fixture, and those
  // navigations stall exactly like any other — so the hardening has to start here rather than at
  // the per-test fixtures below.
  browser: [
    async ({ browser }, use) => {
      const originalNewPage = browser.newPage.bind(browser)
      const originalNewContext = browser.newContext.bind(browser)
      browser.newPage = async (options) => hardenPage(await originalNewPage(options))
      browser.newContext = async (options) => hardenContext(await originalNewContext(options))
      await use(browser)
    },
    { scope: 'worker' },
  ],
  context: async ({ context }, use) => {
    await use(hardenContext(context))
  },
  page: async ({ page }, use) => {
    await use(hardenPage(page))
  },
})
