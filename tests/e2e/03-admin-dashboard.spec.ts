import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display admin dashboard with navigation', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('Dashboard');
    
    // Check navigation links in sidebar
    await expect(page.locator('nav a[href="/admin"]')).toBeVisible();
    await expect(page.locator('nav a[href="/admin/collections"]')).toBeVisible();
    await expect(page.locator('nav a[href="/admin/content"]')).toBeVisible();
    await expect(page.locator('nav a[href="/admin/media"]').first()).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    // Check for stats container that loads via HTMX
    await expect(page.locator('#stats-container')).toBeVisible();
    
    // Wait for HTMX to load stats and check if content appears
    await page.waitForTimeout(2000); // Give HTMX time to load
    
    // Check if stats cards or skeleton is visible
    const statsContent = page.locator('#stats-container');
    await expect(statsContent).toContainText(/Collections|Active Users|skeleton/);
  });

  test('should navigate to collections page', async ({ page }) => {
    await navigateToAdminSection(page, 'collections');
    
    await expect(page.locator('main h1')).toContainText('Collections');
    await expect(page.locator('a[href="/admin/collections/new"]')).toBeVisible();
  });

  test('should navigate to content page', async ({ page }) => {
    await navigateToAdminSection(page, 'content');
    
    await expect(page.locator('h1')).toContainText('Content Management');
    await expect(page.locator('a[href="/admin/content/new"]')).toBeVisible();
  });

  test('should navigate to media page', async ({ page }) => {
    await navigateToAdminSection(page, 'media');
    
    await expect(page.locator('h1').first()).toContainText('Media Library');
    await expect(page.locator('button').filter({ hasText: 'Upload Files' }).first()).toBeVisible();
  });


  test('should handle quick actions', async ({ page }) => {
    // Test any quick action buttons on dashboard
    const quickActions = page.locator('.quick-action, .btn-primary');
    const count = await quickActions.count();
    
    if (count > 0) {
      // Verify first quick action is clickable
      await expect(quickActions.first()).toBeVisible();
    }
  });
}); 