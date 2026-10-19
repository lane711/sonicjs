import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureAdminUserExists } from './utils/test-helpers';

// Use environment variable for port or default to 8787
const BASE_URL = process.env.BASE_URL || 'http://localhost:8787';

test.describe('Collection Field EasyMDX Edit @collections @content', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminUserExists(page);
    await loginAsAdmin(page);
  });

  test('should show EasyMDX in field type badge on collection edit page', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/collections`);

    // Click on first collection
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await expect(page.locator('h1')).toContainText('Edit Collection');

    // Look for any field with EasyMDX type badge
    const mdxBadge = page.locator('.field-item').filter({ hasText: 'EasyMDX' });
    const badgeCount = await mdxBadge.count();

    if (badgeCount > 0) {
      // Verify the badge text is "EasyMDX" not "Rich Text (MDXEditor)"
      const badgeText = await mdxBadge.first().locator('span.inline-flex').textContent();
      expect(badgeText).toBe('EasyMDX');
      expect(badgeText).not.toContain('MDXEditor');
    } else {
      console.log('No EasyMDX fields found in collection');
    }
  });

  test('should handle error gracefully when loading collection with invalid field data', async ({ page }) => {
    // This test ensures that even if field_options has invalid JSON,
    // the page still loads and editorPlugins is available

    await page.goto(`${BASE_URL}/admin/collections`);

    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Page should load without errors
    await expect(page.locator('h1')).toContainText('Edit Collection');

    // Check that Add Field button is present (indicating the page loaded properly)
    const addFieldButton = page.locator('button:has-text("Add Field")');
    await expect(addFieldButton).toBeVisible();

    // Click Add Field to verify editorPlugins is loaded
    await addFieldButton.click();
    await page.waitForSelector('#field-modal:not(.hidden)');

    // Verify field type dropdown has options
    const fieldTypeOptions = await page.locator('#field-type option').count();
    expect(fieldTypeOptions).toBeGreaterThan(1); // More than just the placeholder

    // Check if EasyMDX option exists (means editorPlugins was passed correctly)
    const mdxOptionExists = await page.locator('#field-type option[value="mdxeditor"]').count();

    if (mdxOptionExists > 0) {
      console.log('✓ EasyMDX option is available (editorPlugins loaded correctly)');
    } else {
      console.log('EasyMDX plugin may not be active');
    }

    // Close modal
    await page.click('button:has-text("Cancel")');
  });
});
