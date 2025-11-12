import { test } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';

test.describe('Field Type Debug', () => {
  test('show field types and HTML for content field', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdminSection(page, 'content');
    await page.click('a[href="/admin/content/new"]');
    await page.waitForURL('/admin/content/new', { timeout: 10000 });
    await page.click('text=Blog Posts');
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Get the full HTML
    const html = await page.content();

    // Look for the content field specifically
    // Search for the label "Content" and get HTML around it
    const contentLabelIndex = html.indexOf('>Content<');
    if (contentLabelIndex > -1) {
      // Get 2000 characters after the label
      const fieldHTML = html.substring(contentLabelIndex, contentLabelIndex + 2000);

      console.log('\n\n=== CONTENT FIELD AREA (after label) ===');
      console.log(fieldHTML);
      console.log('=== END CONTENT FIELD ===\n\n');
    } else {
      console.log('\n\nContent label not found in HTML\n\n');
    }

    // Also check for field-content specifically
    const fieldContentMatch = html.match(/id="field-content"[^>]*>/);
    if (fieldContentMatch) {
      console.log('\n=== FIELD-CONTENT ID FOUND ===');
      const startIndex = html.indexOf(fieldContentMatch[0]);
      console.log(html.substring(startIndex, startIndex + 500));
      console.log('=== END FIELD-CONTENT ===\n');
    }

    // Check for textarea with name="content"
    const textareaMatch = html.match(/<textarea[^>]*name="content"[^>]*>/);
    if (textareaMatch) {
      console.log('\n=== FOUND TEXTAREA with name=content ===');
      console.log(textareaMatch[0]);
      console.log('===\n');
    }

    // Check for quill-editor div
    const quillEditorMatch = html.match(/<div[^>]*class="quill-editor[^"]*"[^>]*>/);
    if (quillEditorMatch) {
      console.log('\n=== FOUND QUILL EDITOR DIV ===');
      console.log(quillEditorMatch[0]);
      console.log('===\n');
    } else {
      console.log('\n=== NO QUILL EDITOR DIV FOUND ===\n');
    }
  });
});
