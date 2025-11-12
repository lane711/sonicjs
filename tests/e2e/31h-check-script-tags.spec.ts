import { test } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';

test.describe('Check Script Tags', () => {
  test('examine all script tags in the page', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdminSection(page, 'content');
    await page.click('a[href="/admin/content/new"]');
    await page.waitForURL('/admin/content/new', { timeout: 10000 });
    await page.click('text=Blog Posts');
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Get all script tags and their attributes
    const scriptTags = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.map((script, index) => {
        const info: any = {
          index,
          src: script.src || null,
          hasContent: script.textContent ? script.textContent.length > 0 : false,
          contentLength: script.textContent ? script.textContent.length : 0,
        };

        // For inline scripts, show first 200 chars
        if (!script.src && script.textContent) {
          info.contentStart = script.textContent.substring(0, 200);
        }

        return info;
      });
    });

    console.log('\n=== SCRIPT TAGS ===');
    scriptTags.forEach(script => {
      console.log(JSON.stringify(script, null, 2));
      console.log('---');
    });
    console.log('=== END SCRIPT TAGS ===\n');

    // Look specifically for the Quill initialization script
    const html = await page.content();

    // Find Quill init script
    if (html.includes('initializeQuillEditors')) {
      console.log('\n=== FOUND QUILL INIT SCRIPT ===');
      const startIndex = html.indexOf('initializeQuillEditors');
      const scriptStart = html.lastIndexOf('<script', startIndex);
      const scriptEnd = html.indexOf('</script>', startIndex) + 9;
      const scriptTag = html.substring(scriptStart, scriptEnd);

      console.log('Script tag length:', scriptTag.length);
      console.log('First 500 chars:');
      console.log(scriptTag.substring(0, 500));
      console.log('\n...\n');
      console.log('Last 500 chars:');
      console.log(scriptTag.substring(scriptTag.length - 500));
      console.log('=== END QUILL INIT SCRIPT ===\n');
    } else {
      console.log('\n!!! QUILL INIT SCRIPT NOT FOUND !!!\n');
    }

    // Check for any obvious HTML in script tags
    const scriptWithHtml = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(script => {
        const content = script.textContent || '';
        // Check if script content starts with HTML-like content
        return content.trim().startsWith('<') || content.includes('<!DOCTYPE');
      });
    });

    console.log('Script tag contains HTML:', scriptWithHtml);
  });
});
