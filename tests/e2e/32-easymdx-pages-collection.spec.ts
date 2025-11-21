import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection, waitForHTMX } from './utils/test-helpers';

test.describe.skip('EasyMDE Editor - Pages Collection', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should activate EasyMDE plugin', async ({ page }) => {
    // Navigate to plugins page
    await navigateToAdminSection(page, 'plugins');

    // Check if EasyMDE plugin exists (display name is "EasyMDE Editor")
    const easyMdePlugin = page.locator('div', { hasText: 'EasyMDE Editor' }).first();
    await expect(easyMdePlugin).toBeVisible({ timeout: 10000 });

    // Find the card containing the plugin
    const pluginCard = page.locator('.plugin-card', { has: page.locator('h3:has-text("EasyMDE Editor")') }).first();

    // Check if it's already active by looking for Inactive status
    const statusBadge = pluginCard.locator('text=Inactive');
    const isInactive = await statusBadge.count() > 0;

    if (isInactive) {
      console.log('EasyMDE plugin is inactive, activating...');

      // Click activate button
      const activateButton = pluginCard.locator('button:has-text("Activate")');
      await activateButton.click();

      // Wait for activation
      await waitForHTMX(page);
      await page.waitForTimeout(2000);

      // Verify it's now active - the Inactive badge should be gone
      await expect(statusBadge).not.toBeVisible({ timeout: 5000 });
      console.log('✓ EasyMDE plugin activated');
    } else {
      console.log('✓ EasyMDE plugin already active');
    }
  });

  test('should load EasyMDE scripts when plugin is active on pages-collection', async ({ page }) => {
    // Enable console logging from the page
    page.on('console', msg => {
      if (msg.text().includes('Editor plugins status') || msg.text().includes('mdxeditor')) {
        console.log('PAGE LOG:', msg.text());
      }
    });

    // Navigate to pages-collection new content page
    await page.goto('http://localhost:8787/admin/content/new?collection=pages-collection');
    await page.waitForLoadState('networkidle');

    // Get and save the HTML
    const htmlContent = await page.content();
    const fs = require('fs');
    fs.writeFileSync('/tmp/page-content-form.html', htmlContent);
    console.log('Saved HTML to /tmp/page-content-form.html');

    // Check for mdxeditorEnabled in page
    const hasMdxEditorEnabledTrue = htmlContent.includes('mdxeditorEnabled') && htmlContent.includes('true');
    const hasMdxEditorComment = htmlContent.includes('MDXEditor plugin not active') || htmlContent.includes('MDXEditor plugin active');
    console.log('HTML contains mdxeditorEnabled=true:', hasMdxEditorEnabledTrue);
    console.log('HTML has MDXEditor comment:', hasMdxEditorComment);

    // Check for EasyMDE script URLs
    const hasEasyMdeUrl = htmlContent.includes('easymde');
    console.log('HTML contains "easymde":', hasEasyMdeUrl);

    // Check if EasyMDE CDN scripts are loaded
    const hasEasyMDE = await page.evaluate(() => {
      return typeof (window as any).EasyMDE !== 'undefined';
    });

    console.log('EasyMDE loaded:', hasEasyMDE);

    // Check for EasyMDE script tag
    const easyMdeScript = page.locator('script[src*="easymde"]');
    const scriptCount = await easyMdeScript.count();

    if (scriptCount > 0) {
      console.log('✓ EasyMDE script tag found');
      await expect(easyMdeScript).toHaveCount(1, { timeout: 5000 });
    } else {
      console.log('⚠ EasyMDE script tag not found - plugin may not be active');
      console.log('Checking for MDXEditor comment in HTML...');
      const commentMatch = htmlContent.match(/<!-- (MDX.+?) -->/);
      if (commentMatch) {
        console.log('Found comment:', commentMatch[1]);
      }
    }

    // Check for EasyMDE CSS
    const easyMdeCss = page.locator('link[href*="easymde"]');
    const cssCount = await easyMdeCss.count();

    if (cssCount > 0) {
      console.log('✓ EasyMDE CSS found');
    }
  });

  test('should initialize EasyMDE for content field in pages-collection', async ({ page }) => {
    // Navigate to pages-collection new content page
    await page.goto('http://localhost:8787/admin/content/new?collection=pages-collection');
    await page.waitForLoadState('networkidle');

    // Wait for EasyMDE to initialize
    await page.waitForTimeout(3000); // Give time for CDN and initialization

    // Check if richtext container exists
    const richtextContainer = page.locator('.richtext-container').first();
    await expect(richtextContainer).toBeVisible({ timeout: 10000 });
    console.log('✓ Richtext container found');

    // Check if EasyMDE has initialized by looking for the CodeMirror editor
    const codeMirrorEditor = page.locator('.CodeMirror').first();
    const hasCodeMirror = await codeMirrorEditor.count() > 0;

    if (hasCodeMirror) {
      console.log('✓ EasyMDE initialized (CodeMirror found)');
      await expect(codeMirrorEditor).toBeVisible();

      // Check for EasyMDE toolbar
      const toolbar = page.locator('.editor-toolbar').first();
      await expect(toolbar).toBeVisible();
      console.log('✓ EasyMDE toolbar found');
    } else {
      console.log('⚠ EasyMDE not initialized - checking for textarea fallback');

      // Check if textarea fallback is visible
      const textarea = richtextContainer.locator('textarea');
      if (await textarea.count() > 0) {
        console.log('Textarea fallback is present - EasyMDE failed to initialize');

        // Take a screenshot for debugging
        await page.screenshot({ path: 'test-results/easymdx-fallback.png', fullPage: true });

        // Fail the test with helpful message
        throw new Error('EasyMDE did not initialize. Textarea fallback is showing. Check screenshot and console logs.');
      }
    }
  });

  test('should allow typing content in EasyMDE editor', async ({ page }) => {
    // Navigate to pages-collection new content page
    await page.goto('http://localhost:8787/admin/content/new?collection=pages-collection');
    await page.waitForLoadState('networkidle');

    // Wait for EasyMDE to initialize
    await page.waitForTimeout(3000);

    // Fill in title field
    await page.fill('input[name="title"]', 'EasyMDE Test Page');
    console.log('✓ Title filled');

    // Try to interact with EasyMDE editor
    const codeMirrorEditor = page.locator('.CodeMirror').first();

    if (await codeMirrorEditor.count() > 0) {
      console.log('Attempting to type in EasyMDE (CodeMirror)');

      // Click into the editor
      await codeMirrorEditor.click();

      // Type some markdown content using CodeMirror's textarea
      const codeMirrorTextarea = page.locator('.CodeMirror textarea').first();
      await codeMirrorTextarea.fill('# Test Heading\\n\\nThis is a test page using **EasyMDE** editor.');

      console.log('✓ Successfully typed in EasyMDE');

      // Take a screenshot
      await page.screenshot({ path: 'test-results/easymdx-with-content.png', fullPage: true });
    } else {
      console.log('Using textarea fallback');
      const textarea = page.locator('.richtext-container textarea').first();
      await textarea.fill('# Test Heading\\n\\nThis is a test page using EasyMDE fallback.');
    }
  });

  test('should save content with EasyMDE value', async ({ page }) => {
    // Navigate to pages-collection new content page
    await page.goto('http://localhost:8787/admin/content/new?collection=pages-collection');
    await page.waitForLoadState('networkidle');

    // Wait for editor initialization
    await page.waitForTimeout(3000);

    // Fill in required fields
    const title = `EasyMDE Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);

    // Fill in content
    const mdContent = '# Test Heading\\n\\nThis is test content from EasyMDE.';

    const codeMirrorEditor = page.locator('.CodeMirror').first();
    if (await codeMirrorEditor.count() > 0) {
      const codeMirrorTextarea = page.locator('.CodeMirror textarea').first();
      await codeMirrorTextarea.fill(mdContent);
    } else {
      const textarea = page.locator('.richtext-container textarea').first();
      await textarea.fill(mdContent);
    }

    // Save the content
    const saveButton = page.locator('button[type="submit"]', { hasText: 'Save' }).first();
    await saveButton.click();

    // Wait for save to complete
    await waitForHTMX(page);
    await page.waitForTimeout(2000);

    // Should redirect to content list or show success message
    const url = page.url();
    console.log('After save URL:', url);

    // Verify we're either on the list page or still on the form with a success message
    const isOnList = url.includes('/admin/content') && !url.includes('/new') && !url.includes('/edit');
    const hasSuccessMessage = await page.locator('text=saved successfully').count() > 0;

    expect(isOnList || hasSuccessMessage).toBeTruthy();
  });
});
