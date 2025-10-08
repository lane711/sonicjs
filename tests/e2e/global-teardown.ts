import { chromium, FullConfig } from '@playwright/test';

/**
 * Global teardown for E2E tests
 * Runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Running global test cleanup after tests...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Get the base URL from the config
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:8787';

    // Call the cleanup endpoint (public, no auth required)
    const response = await page.request.post(`${baseURL}/test-cleanup`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok()) {
      const result = await response.json();
      console.log(`✓ Final cleanup successful: ${result.deletedCount} items removed\n`);
    } else {
      console.log(`⚠ Final cleanup returned status: ${response.status()}\n`);
    }
  } catch (error) {
    console.log(`⚠ Final cleanup failed: ${error}\n`);
  } finally {
    await browser.close();
  }
}

export default globalTeardown;
