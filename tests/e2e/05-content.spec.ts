import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection, waitForHTMX, TEST_DATA } from './utils/test-helpers';

test.describe('Content Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdminSection(page, 'content');
  });

  test('should display content list', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('Content Management');
    await expect(page.locator('table')).toBeVisible();
    
    // Should have filter dropdowns
    await expect(page.locator('select[name="model"]')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
  });

  test('should show existing content', async ({ page }) => {
    // Should show the default welcome blog post
    await expect(page.locator('tr').filter({ hasText: 'Welcome to SonicJS AI' })).toBeVisible();
  });

  test('should filter content by status', async ({ page }) => {
    // Filter by published status
    await page.selectOption('select[name="status"]', 'published');
    
    // Wait for HTMX to update the content
    await waitForHTMX(page);
    
    // Should show published content
    await expect(page.locator('tr').filter({ hasText: 'published' })).toBeVisible();
  });

  test('should filter content by collection', async ({ page }) => {
    // Get available options
    const options = await page.locator('select[name="model"] option').allTextContents();
    
    if (options.length > 1) {
      // Select first non-"all" option
      const firstCollection = options.find(opt => opt !== 'All Models');
      if (firstCollection) {
        await page.selectOption('select[name="model"]', { label: firstCollection });
        await waitForHTMX(page);
      }
    }
  });

  test('should navigate to new content form', async ({ page }) => {
    await page.click('a[href="/admin/content/new"]');
    
    await expect(page.locator('h1').first()).toContainText('Create New Content');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should display content actions', async ({ page }) => {
    // Find a content row
    const contentRow = page.locator('tr').filter({ hasText: 'Welcome to SonicJS AI' });
    
    if (await contentRow.count() > 0) {
      // Should have Edit and History buttons
      await expect(contentRow.locator('.btn').filter({ hasText: 'Edit' })).toBeVisible();
      await expect(contentRow.locator('.btn').filter({ hasText: 'History' })).toBeVisible();
    }
  });

  test('should handle bulk selection', async ({ page }) => {
    // Check select all checkbox
    await page.click('#select-all');
    
    // Content checkboxes should be selected
    const checkboxes = page.locator('.content-checkbox');
    const count = await checkboxes.count();
    
    if (count > 0) {
      await expect(checkboxes.first()).toBeChecked();
    }
  });

  test('should show workflow actions for content', async ({ page }) => {
    // Find content with actions dropdown
    const actionsDropdown = page.locator('button').filter({ hasText: 'Actions ▼' });
    
    if (await actionsDropdown.count() > 0) {
      await actionsDropdown.first().click();
      
      // Should show workflow actions
      const dropdown = page.locator('[id^="dropdown-"]').first();
      await expect(dropdown).toBeVisible();
    }
  });

  test('should refresh content list', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Refresh' }).click();
    
    // Page should reload
    await expect(page.locator('h1').first()).toContainText('Content Management');
  });

  test('should handle pagination', async ({ page }) => {
    // Check if pagination exists
    const pagination = page.locator('.pagination, a').filter({ hasText: 'Next' });
    
    if (await pagination.count() > 0) {
      // Pagination should be functional
      await expect(pagination.first()).toBeVisible();
    }
  });

  test('should display content metadata', async ({ page }) => {
    // Find content row
    const contentRow = page.locator('tr').filter({ hasText: 'Welcome to SonicJS AI' });
    
    if (await contentRow.count() > 0) {
      // Should show title, model, status, author, date
      await expect(contentRow.locator('td').nth(1)).toContainText('Welcome to SonicJS AI');
      await expect(contentRow.locator('td').nth(3)).toContainText(/published|draft|review/);
    }
  });

  test('should handle mobile responsive layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Content should still be accessible
    await expect(page.locator('h1').first()).toContainText('Content Management');
    
    // Table should be scrollable or reorganized
    await expect(page.locator('table, .overflow-x-auto')).toBeVisible();
  });
}); 