import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/test-helpers';

test.describe('Media Bulk Actions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);

    // Upload test files to ensure media exists
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle');

    // Check if media already exists
    const existingMedia = await page.locator('input[type="checkbox"][id^="file-"]').count();

    if (existingMedia < 2) {
      // Upload test files
      await page.locator('button').filter({ hasText: 'Upload Files' }).first().click();
      await expect(page.locator('#upload-modal')).toBeVisible();

      // Create test image buffers
      const testImageBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x80, 0xFF, 0xD9
      ]);

      // Upload 2 test files
      await page.setInputFiles('#file-input', [
        { name: 'test-bulk-1.jpg', mimeType: 'image/jpeg', buffer: testImageBuffer },
        { name: 'test-bulk-2.jpg', mimeType: 'image/jpeg', buffer: testImageBuffer }
      ]);

      await page.locator('button[type="submit"]').click();
      await expect(page.locator('#upload-results')).toContainText('Successfully uploaded', { timeout: 10000 });

      // Close modal - use Cancel button or X button
      const closeBtn = page.locator('#upload-modal button').filter({ hasText: 'Cancel' });
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
      }
      await page.waitForTimeout(1000);
    }
  });

  test('should display bulk actions menu without cutoff when files are selected', async ({ page }) => {
    // Navigate to media library
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle');

    // Wait for media grid to load
    await page.waitForSelector('.media-grid, .grid', { timeout: 10000 });

    // Select the first file
    const mediaItems = page.locator('input[type="checkbox"][id^="file-"]');
    await mediaItems.first().check();

    // Wait for bulk actions button to become enabled
    const bulkActionsBtn = page.locator('#bulk-actions-btn');
    await expect(bulkActionsBtn).toBeEnabled({ timeout: 5000 });
    await expect(bulkActionsBtn).toContainText('Actions');

    // Click bulk actions button
    await bulkActionsBtn.click();

    // Wait for menu to appear
    const bulkActionsMenu = page.locator('#bulk-actions-menu');
    await expect(bulkActionsMenu).toBeVisible({ timeout: 2000 });

    // Check that menu is properly positioned and not cut off
    const menuBox = await bulkActionsMenu.boundingBox();
    const viewportSize = page.viewportSize();

    expect(menuBox).not.toBeNull();
    if (menuBox && viewportSize) {
      // Menu should be within viewport
      expect(menuBox.x).toBeGreaterThanOrEqual(0);
      expect(menuBox.y).toBeGreaterThanOrEqual(0);
      expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportSize.width);
      expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(viewportSize.height);
    }

    // Verify menu contains delete option
    const deleteButton = bulkActionsMenu.locator('button:has-text("Delete")');
    await expect(deleteButton).toBeVisible();

    // Click outside to close menu
    await page.click('body', { position: { x: 10, y: 10 } });

    // Menu should be hidden after clicking outside
    await expect(bulkActionsMenu).toBeHidden({ timeout: 2000 });
  });

  test('should show correct count in bulk actions button', async ({ page }) => {
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle');

    const mediaItems = page.locator('input[type="checkbox"][id^="file-"]');

    // Select first 2 items
    await mediaItems.nth(0).check();
    await mediaItems.nth(1).check();

    const bulkActionsBtn = page.locator('#bulk-actions-btn');
    await expect(bulkActionsBtn).toContainText('Actions (2)');

    // Unselect one
    await mediaItems.nth(0).uncheck();
    await expect(bulkActionsBtn).toContainText('Actions (1)');

    // Unselect all
    await mediaItems.nth(1).uncheck();
    await expect(bulkActionsBtn).toBeDisabled();
    await expect(bulkActionsBtn).toContainText('Bulk Actions');
  });

  test('should animate menu open and close', async ({ page }) => {
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle');

    const mediaItems = page.locator('input[type="checkbox"][id^="file-"]');

    // Select a file
    await mediaItems.first().check();

    const bulkActionsBtn = page.locator('#bulk-actions-btn');
    const bulkActionsMenu = page.locator('#bulk-actions-menu');

    // Open menu
    await bulkActionsBtn.click();
    await expect(bulkActionsMenu).toBeVisible();

    // Check for scale-100 and opacity-100 classes (animation completion)
    await page.waitForTimeout(200); // Wait for animation
    const menuClasses = await bulkActionsMenu.getAttribute('class');
    expect(menuClasses).toContain('scale-100');
    expect(menuClasses).toContain('opacity-100');

    // Close menu
    await bulkActionsBtn.click();

    // After animation, menu should be hidden
    await page.waitForTimeout(200);
    await expect(bulkActionsMenu).toBeHidden();
  });

  test('should have proper z-index to avoid overlap', async ({ page }) => {
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle');

    const mediaItems = page.locator('input[type="checkbox"][id^="file-"]');

    // Select a file
    await mediaItems.first().check();

    // Open menu
    await page.locator('#bulk-actions-btn').click();
    const bulkActionsMenu = page.locator('#bulk-actions-menu');
    await expect(bulkActionsMenu).toBeVisible();

    // Check z-index
    const zIndex = await bulkActionsMenu.evaluate((el) =>
      window.getComputedStyle(el).zIndex
    );

    // z-50 in Tailwind is z-index: 50
    expect(parseInt(zIndex)).toBeGreaterThanOrEqual(50);
  });
});
