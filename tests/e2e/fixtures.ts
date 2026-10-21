import { test as base } from '@playwright/test'
import type { Browser, BrowserContext, Page, Response } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

/**
 * The `domcontentloaded` navigations below deliberately pass no `timeout`, so they inherit
 * `use.navigationTimeout` from playwright.config.ts (30s). That default is load-bearing: before it
 * was set, Playwright's own default of 0 meant NO timeout, and every one of those calls could run
 * until the 120s test budget expired — the `page.originalGoto: Test timeout of 120000ms exceeded`
 * signature that dominated CI. `loadEventIsUnreachable` is a per-worker latch, so a single early
 * stall routed every later navigation in that worker down one of those unbounded paths.
 */

/**
 * `net::ERR_ABORTED` on a navigation means it was *superseded*, not that it failed: the page
 * started another navigation (a client-side redirect racing the server's, an htmx boost) and the
 * browser cancelled this one. The document the caller wanted usually loads a moment later anyway.
 *
 * This was the second-largest error signature in CI — `page.goto: net::ERR_ABORTED; maybe frame
 * was detached?` out of `loginAsAdmin`'s hop to /admin, which already passes an explicit
 * `domcontentloaded` and so never touched the stall handling below. One retry from a frame that
 * has stopped moving clears it.
 *
 * A frame detached for real — the test timed out and Playwright is tearing the page down — throws
 * the same error on the retry, so nothing is masked; a closed page skips the retry outright.
 */
function isSupersededNavigation(error: unknown): boolean {
  return String((error as Error)?.message ?? error).includes('net::ERR_ABORTED')
}

/**
 * A navigation that ran out its OWN budget, as opposed to one killed by the test budget.
 *
 * Playwright words these differently and the distinction decides whether retrying is sane:
 * `page.goto: Timeout 30000ms exceeded.` leaves the test with time left to try again, while
 * `page.goto: Test timeout of 120000ms exceeded.` means the test is already over and Playwright
 * is tearing the page down — a retry there runs into a dying frame and reports a confusing
 * ERR_ABORTED on top of the real failure.
 */
function isOwnTimeout(error: unknown): boolean {
  const message = String((error as Error)?.message ?? error)
  return /Timeout \d+ms exceeded/.test(message) && !message.includes('Test timeout')
}

/**
 * `retryOnTimeout` is for navigations that have no other retry behind them.
 *
 * Traces from CI run 39587538658 show the preview occasionally dropping a browser navigation
 * outright: in three of them `POST /auth/seed-admin` and `POST /auth/sign-in/email` both answered
 * 200 in about a second through Playwright's Node client, and then `GET /admin` from the browser
 * on a fresh page — nothing else in flight — never produced a first byte and sat there until the
 * test was killed. Same origin, seconds apart. Whatever the deployment is doing there, a second
 * attempt on a new connection is the only move available from this side, and it is cheap: the
 * first attempt now gives up after `use.navigationTimeout` rather than eating the test budget.
 */
async function retryTransientNavigation<T>(
  page: Page,
  attempt: () => Promise<T>,
  { retryOnTimeout = false }: { retryOnTimeout?: boolean } = {}
): Promise<T> {
  try {
    return await attempt()
  } catch (error) {
    const retryable = isSupersededNavigation(error) || (retryOnTimeout && isOwnTimeout(error))
    if (!retryable || page.isClosed()) throw error
    // Let whatever superseded us finish committing first. Retrying into a frame that is still
    // navigating just loses the same race again. 'domcontentloaded' resolves immediately when the
    // current document has already parsed, so this costs nothing in the common case.
    await page.waitForLoadState('domcontentloaded', { timeout: FALLBACK_TIMEOUT_MS }).catch(() => {})
    return await attempt()
  }
}

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
    // 'domcontentloaded' / 'commit' do not wait on subresources, so they never hit the stall
    // handling — but they can still be superseded, hence the retry on every path.
    if (!waitsOnSubresources(options?.waitUntil)) {
      return retryTransientNavigation(page, () => originalGoto(url, options), { retryOnTimeout: true })
    }
    if (loadEventIsUnreachable) {
      return retryTransientNavigation(
        page,
        () => originalGoto(url, { ...options, waitUntil: 'domcontentloaded' }),
        { retryOnTimeout: true }
      )
    }

    const bounded = Math.min(options?.timeout ?? LOAD_ATTEMPT_TIMEOUT_MS, LOAD_ATTEMPT_TIMEOUT_MS)
    try {
      return await originalGoto(url, { ...options, timeout: bounded })
    } catch (error) {
      if (!isNavigationStall(error)) throw error
      loadEventIsUnreachable = true
      // The document itself is fine — only the settle condition was unreachable. The timed-out
      // navigation is still running in the browser, so let it parse before starting another:
      // re-navigating on top of it is what turns this fallback into its own ERR_ABORTED.
      await originalWaitForLoadState('domcontentloaded', { timeout: FALLBACK_TIMEOUT_MS }).catch(() => {})
      return retryTransientNavigation(page, () => originalGoto(url, { ...options, waitUntil: 'domcontentloaded' }))
    }
  }

  page.reload = async (options?: Parameters<Page['reload']>[0]): Promise<Response | null> => {
    // Same contract as goto, and the media library in particular reloads straight into the stall.
    if (!waitsOnSubresources(options?.waitUntil)) {
      return retryTransientNavigation(page, () => originalReload(options), { retryOnTimeout: true })
    }
    if (loadEventIsUnreachable) {
      return retryTransientNavigation(
        page,
        () => originalReload({ ...options, waitUntil: 'domcontentloaded' }),
        { retryOnTimeout: true }
      )
    }

    const bounded = Math.min(options?.timeout ?? LOAD_ATTEMPT_TIMEOUT_MS, LOAD_ATTEMPT_TIMEOUT_MS)
    try {
      return await originalReload({ ...options, timeout: bounded })
    } catch (error) {
      if (!isNavigationStall(error)) throw error
      loadEventIsUnreachable = true
      await originalWaitForLoadState('domcontentloaded', { timeout: FALLBACK_TIMEOUT_MS }).catch(() => {})
      return retryTransientNavigation(page, () => originalReload({ ...options, waitUntil: 'domcontentloaded' }))
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
      // nothing. Give the document a chance to parse, then carry on.
      //
      // Swallowed, like the goto and reload fallbacks above. Rethrowing here reports the failure
      // as `page.originalWaitForLoadState: Test timeout of 120000ms exceeded` at this line, which
      // names the advisory wait rather than whatever the caller was really waiting for — that is
      // how 26-content-duplicate spent a whole CI failure pointing at fixtures.ts instead of at
      // the edit form that never rendered.
      await originalWaitForLoadState('domcontentloaded', { timeout: FALLBACK_TIMEOUT_MS }).catch(
        () => {}
      )
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

/**
 * Cross-file mutual exclusion for tests that mutate shared server state.
 *
 * `test.describe.serial` only orders tests inside one file. It does nothing about two FILES that
 * own the same global: 68-plugin-activity-log toggles the `hello-world` plugin while
 * 68-plugin-install-click uninstalls it, and 70-multi-tenant deactivates the multi-tenant plugin
 * while 71-tenant-membership-gate needs it active. Both pairs are green alone and red together —
 * the failure surfaces as "element(s) not found" on a button the other spec just took away.
 *
 * A test opts in by carrying a `@lock-<name>` tag; it then holds that name for its whole duration.
 * Workers are separate OS processes on one machine, so the mutex is a directory: `mkdir` is atomic
 * and fails with EEXIST when someone already holds it.
 */
const LOCK_ROOT = join(
  tmpdir(),
  `sonicjs-e2e-locks-${createHash('sha1')
    .update(resolve(dirname(fileURLToPath(import.meta.url)), '../..'))
    .digest('hex')
    .slice(0, 12)}`
)

/**
 * A held lock is heartbeated (below), so a mtime this old means the holder process is gone —
 * killed worker, Ctrl-C, OOM. Without the heartbeat this would have to exceed the longest a test
 * may legitimately hold the lock, and `submitLoginForm` can extend its own budget by 75s to wait
 * out a rate-limit window; the next worker would have stolen the lock mid-test.
 */
const LOCK_STALE_MS = 150_000
const LOCK_POLL_MS = 100

/** Generous: the holder is a whole test, and several may be queued ahead of us. */
const LOCK_WAIT_MS = 300_000

async function acquireLock(name: string): Promise<() => void> {
  const dir = join(LOCK_ROOT, name.replace(/[^a-z0-9-]/gi, '_'))
  const deadline = Date.now() + LOCK_WAIT_MS

  mkdirSync(LOCK_ROOT, { recursive: true })

  for (;;) {
    try {
      mkdirSync(dir)
      writeFileSync(join(dir, 'owner'), `pid ${process.pid}\n`)
      // Keep the mtime fresh while we hold it, so "stale" means the holder died rather than
      // "the holder is taking a while". `unref` so a leaked timer cannot hold the worker open.
      const heartbeat = setInterval(() => {
        try {
          const now = new Date()
          utimesSync(dir, now, now)
        } catch {
          // Already released; the clearInterval below is about to run anyway.
        }
      }, Math.floor(LOCK_STALE_MS / 3))
      heartbeat.unref()
      return () => {
        clearInterval(heartbeat)
        rmSync(dir, { recursive: true, force: true })
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error

      try {
        if (Date.now() - statSync(dir).mtimeMs > LOCK_STALE_MS) {
          rmSync(dir, { recursive: true, force: true })
          continue
        }
      } catch {
        // Released between the mkdir and the stat — just go round again.
      }

      if (Date.now() > deadline) {
        throw new Error(`Timed out after ${LOCK_WAIT_MS}ms waiting for the "${name}" e2e lock (${dir})`)
      }
      await new Promise((r) => setTimeout(r, LOCK_POLL_MS))
    }
  }
}

export const test = base.extend<
  { page: Page; context: BrowserContext; exclusiveLocks: void },
  { browser: Browser }
>({
  // Auto-use, so a spec opts in with a tag alone and cannot forget to release.
  exclusiveLocks: [
    async ({}, use, testInfo) => {
      const names = testInfo.tags
        .filter((tag) => tag.startsWith('@lock-'))
        .map((tag) => tag.slice('@lock-'.length))
        // Deterministic order: two tests holding {a,b} in opposite orders would deadlock.
        .sort()

      const releases: Array<() => void> = []
      const waitStartedAt = Date.now()
      try {
        for (const name of names) releases.push(await acquireLock(name))

        // Queueing behind another spec is not this test's own work, so hand the budget back —
        // otherwise the slowest-to-acquire test reports a timeout that says nothing about it.
        const waited = Date.now() - waitStartedAt
        if (waited > 1_000) testInfo.setTimeout(testInfo.timeout + waited)

        await use()
      } finally {
        for (const release of releases.reverse()) release()
      }
    },
    { auto: true },
  ],
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
