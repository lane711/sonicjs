import { test } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';

test.describe('Quill Console Logs', () => {
  test('capture console logs during Quill initialization', async ({ page }) => {
    // Capture all console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      const logMsg = `[${type}] ${text}`;
      consoleMessages.push(logMsg);
      console.log(logMsg); // Also log to test output
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log('[PAGE ERROR]', error.message);
      consoleMessages.push(`[PAGE ERROR] ${error.message}`);
    });

    await loginAsAdmin(page);
    await navigateToAdminSection(page, 'content');
    await page.click('a[href="/admin/content/new"]');
    await page.waitForURL('/admin/content/new', { timeout: 10000 });
    await page.click('text=Blog Posts');
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });

    // Wait extra time for Quill to initialize
    await page.waitForTimeout(5000);

    console.log('\n\n=== ALL CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));
    console.log('=== END CONSOLE MESSAGES ===\n\n');

    // Check if Quill initialized
    const editorCount = await page.evaluate(() => {
      return document.querySelectorAll('.ql-container').length;
    });
    console.log('Quill editors found:', editorCount);
  });
});
