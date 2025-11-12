import { test } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';

test.describe('Quill Detailed Debug', () => {
  test('check what is actually being rendered', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdminSection(page, 'content');
    await page.click('a[href="/admin/content/new"]');
    await page.waitForURL('/admin/content/new', { timeout: 10000 });
    await page.click('text=Blog Posts');
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.waitForTimeout(3000); // Wait for any scripts to load

    // Get the full HTML
    const html = await page.content();

    // Check for Quill-related strings in head
    const hasQuillCDN = html.includes('cdn.jsdelivr.net/npm/quill');
    const hasQuillCSS = html.includes('quill.snow.css');
    const hasQuillJS = html.includes('quill.js');
    const hasInitScript = html.includes('initializeQuillEditors');
    const hasNotActiveComment = html.includes('Quill plugin not active');

    console.log('\n\n=== HEAD SECTION CHECK ===');
    console.log('Has Quill CDN reference:', hasQuillCDN);
    console.log('Has Quill CSS:', hasQuillCSS);
    console.log('Has Quill JS:', hasQuillJS);
    console.log('Has init script:', hasInitScript);
    console.log('Has "not active" comment:', hasNotActiveComment);

    // Extract script section
    const scriptMatch = html.match(/<script>[\s\S]*?initializeQuillEditors[\s\S]*?<\/script>/);
    if (scriptMatch) {
      console.log('\n=== INIT SCRIPT FOUND ===');
      console.log(scriptMatch[0].substring(0, 500));
    } else {
      console.log('\n=== NO INIT SCRIPT FOUND ===');
    }

    // Check for content field HTML
    const contentFieldMatch = html.match(/name="content"[\s\S]{0,500}/);
    if (contentFieldMatch) {
      console.log('\n=== CONTENT FIELD HTML ===');
      console.log(contentFieldMatch[0]);
    }

    // Check browser console for errors
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Wait a bit to collect console messages
    await page.waitForTimeout(2000);

    if (consoleMessages.length > 0) {
      console.log('\n=== BROWSER CONSOLE MESSAGES ===');
      consoleMessages.forEach(msg => console.log(msg));
    }

    // Check if Quill global object exists
    const quillExists = await page.evaluate(() => {
      return typeof (window as any).Quill !== 'undefined';
    });
    console.log('\n=== QUILL GLOBAL ===');
    console.log('Quill object exists:', quillExists);

    // Check what editors were initialized
    const editorCount = await page.evaluate(() => {
      return document.querySelectorAll('.ql-container').length;
    });
    console.log('Quill editors initialized:', editorCount);
  });
});
