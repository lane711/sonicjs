import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/test-helpers';

test.describe('Media Create Folder - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle');
  });

  test('should create folder with valid name', async ({ page }) => {
    const folderName = `test-${Date.now()}`;

    // Open modal
    await page.locator('button[onclick="openCreateFolderModal()"]').click();
    await page.waitForTimeout(300);

    // Verify modal is visible
    const modal = page.locator('#create-folder-modal');
    await expect(modal).toBeVisible();

    // Enter folder name
    await page.locator('#folder-name').fill(folderName);

    // Submit
    await page.locator('#create-folder-modal button[type="submit"]').click();

    // Wait for success notification (within animation time)
    const notification = page.getByText(/created successfully/i);
    await expect(notification).toBeVisible({ timeout: 1500 });
  });
});
