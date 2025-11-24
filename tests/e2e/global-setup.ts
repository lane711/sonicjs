import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for E2E tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('\n🧹 Running global test cleanup before tests...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Get the base URL from environment or config
    const baseURL = process.env.BASE_URL || config.projects[0]?.use?.baseURL || 'http://localhost:8787';

    console.log(`Using base URL: ${baseURL}`);

    // Call the cleanup endpoint (public, no auth required)
    const response = await page.request.post(`${baseURL}/test-cleanup`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok()) {
      const result = await response.json();
      console.log(`✓ Test cleanup successful: ${result.deletedCount} items removed\n`);
    } else {
      console.log(`⚠ Test cleanup returned status: ${response.status()}\n`);
    }
  } catch (error) {
    console.log(`⚠ Test cleanup failed: ${error}\n`);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
