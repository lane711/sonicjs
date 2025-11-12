import { test } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';

test.describe('JavaScript Error Details', () => {
  test('identify which resource is causing the parse error', async ({ page }) => {
    const failedRequests: any[] = [];
    const jsErrors: any[] = [];

    // Capture failed requests
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()?.errorText,
        resourceType: request.resourceType()
      });
    });

    // Capture console errors with more detail
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('[CONSOLE ERROR]', msg.text());
      }
    });

    // Capture page errors with more detail
    page.on('pageerror', error => {
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
      jsErrors.push(errorDetails);
      console.log('[PAGE ERROR]', JSON.stringify(errorDetails, null, 2));
    });

    // Capture responses to see if any JS files are returning HTML
    page.on('response', async response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';

      // Check if a .js file is returning non-JavaScript content
      if (url.includes('.js') && !contentType.includes('javascript')) {
        console.log('[SUSPICIOUS RESPONSE]', {
          url,
          status: response.status(),
          contentType,
          ok: response.ok()
        });

        // Try to get the first 500 chars of the response
        try {
          const text = await response.text();
          console.log('[RESPONSE BODY START]', text.substring(0, 500));
        } catch (e) {
          console.log('[Could not read response body]');
        }
      }
    });

    await loginAsAdmin(page);
    await navigateToAdminSection(page, 'content');
    await page.click('a[href="/admin/content/new"]');
    await page.waitForURL('/admin/content/new', { timeout: 10000 });
    await page.click('text=Blog Posts');
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.waitForTimeout(3000);

    console.log('\n\n=== FAILED REQUESTS ===');
    if (failedRequests.length > 0) {
      failedRequests.forEach(req => console.log(JSON.stringify(req, null, 2)));
    } else {
      console.log('No failed requests');
    }
    console.log('=== END FAILED REQUESTS ===\n');

    console.log('=== JS ERRORS ===');
    if (jsErrors.length > 0) {
      jsErrors.forEach(err => console.log(JSON.stringify(err, null, 2)));
    } else {
      console.log('No JS errors captured');
    }
    console.log('=== END JS ERRORS ===\n\n');
  });
});
