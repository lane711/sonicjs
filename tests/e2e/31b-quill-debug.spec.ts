import { test } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';

test.describe('Quill Debug', () => {
  test('debug - show what is rendered for content field', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdminSection(page, 'content');
    await page.click('a[href="/admin/content/new"]');
    await page.waitForURL('/admin/content/new', { timeout: 10000 });
    await page.click('text=Blog Posts');
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Get the full HTML of the page
    const html = await page.content();

    // Extract just the content field area
    const contentFieldMatch = html.match(/Content \*.*?<\/div>/s);
    if (contentFieldMatch) {
      console.log('\n\n=== CONTENT FIELD HTML ===\n');
      console.log(contentFieldMatch[0].substring(0, 2000)); // First 2000 chars
      console.log('\n=== END CONTENT FIELD HTML ===\n\n');
    }

    // Check if quill classes exist anywhere
    const hasQuillContainer = html.includes('quill-editor-container');
    const hasQuillEditor = html.includes('quill-editor');
    const hasQlContainer = html.includes('ql-container');
    const hasCDN = html.includes('quilljs.com') || html.includes('cdn.jsdelivr.net/npm/quill');
    const hasInitScript = html.includes('initializeQuillEditors');

    console.log('\n\n=== QUILL DEBUG INFO ===');
    console.log('Has quill-editor-container class:', hasQuillContainer);
    console.log('Has quill-editor class:', hasQuillEditor);
    console.log('Has ql-container class:', hasQlContainer);
    console.log('Has Quill CDN:', hasCDN);
    console.log('Has init script:', hasInitScript);
    console.log('=== END DEBUG INFO ===\n\n');

    // Check for quillEnabled flag in HTML comments or scripts
    if (html.includes('Quill plugin not active')) {
      console.log('\n\n!!! FOUND: Quill plugin not active comment !!!\n\n');
    }

    if (html.includes('quillEnabled')) {
      console.log('\n\n!!! FOUND: quillEnabled reference !!!\n\n');
    }
  });
});
