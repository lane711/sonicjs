import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Files run in parallel; tests WITHIN a file do not.
   *
   * `fullyParallel: true` spreads the tests of one file across all four workers, and this suite
   * cannot take that: every spec shares one database, one `admin@sonicjs.com` account, one
   * site-settings row and one set of plugin activation flags. 27-settings-general is the clearest
   * case — eight tests, each POSTing the whole general-settings form, so the one asserting its
   * unique site name read back "SonicJS AI" where a sibling had just saved the form it had loaded
   * before the write. Several specs say "workers:1 → the tests run serially" in their own headers;
   * this makes that true again without giving up file-level parallelism.
   *
   * Cross-FILE conflicts over the same global are handled by the `@lock-*` tags — see fixtures.ts. */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only — 2 retries handles consecutive transient CF Worker cold-starts */
  retries: process.env.CI ? 2 : 0,
  /* Per-test timeout.
   *
   * Most specs log in (3 API round trips + a navigation) before their first assertion, then make
   * several more navigations against a remote CF Worker. On an idle machine that whole shape runs
   * in 10-15s, but CI packs four Chromium instances onto a four-vCPU runner and every admin page
   * compiles its own CSS in-browser via the Tailwind Play CDN, so the renderers contend for cores
   * and individual navigations stretch by an order of magnitude. At 60s a run produced 28 failures
   * and 52 flakes, nearly all of them "Test timeout of 60000ms exceeded" parked on whichever
   * navigation happened to be in flight rather than on a real defect. Headroom is cheap here —
   * a passing test still finishes in its usual 15s and never touches this number. */
  timeout: 90 * 1000,
  /* 1 worker locally (in-memory D1 conflicts); 4 in CI (remote D1, I/O bound) */
  workers: process.env.CI ? 4 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Global setup and teardown */
  globalSetup: resolve(__dirname, './e2e/global-setup.ts'),
  globalTeardown: resolve(__dirname, './e2e/global-teardown.ts'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:8787',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on retry, matching `trace` above.
     *
     * 'retain-on-failure' sounds cheaper than it is: Playwright has to record EVERY test and then
     * throw the file away when it passes, so the ~95% of the suite that is green still pays for
     * four concurrent video encoders on a four-vCPU runner. That CPU is taken straight from the
     * browsers, which is what pushes navigations past the test timeout in the first place. With
     * two retries configured, anything that really fails is still recorded on its first retry. */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests (local only) */
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm run dev',
    cwd: resolve(__dirname, '../my-sonicjs-app'),
    url: 'http://localhost:8787',
    reuseExistingServer: true,
    timeout: 180 * 1000, // Increased to 3 minutes
  },
}); 