import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display admin dashboard with navigation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('SonicJS AI Admin');
    
    // Check navigation links
    await expect(page.locator('a[href="/admin"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/collections"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/content"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/media"]')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    // Check for stats cards
    await expect(page.locator('.stat')).toHaveCount(4); // Collections, Content, Media, Users
    
    // Check stat labels
    await expect(page.getByText('Collections')).toBeVisible();
    await expect(page.getByText('Content Items')).toBeVisible();
    await expect(page.getByText('Media Files')).toBeVisible();
    await expect(page.getByText('Users')).toBeVisible();
  });

  test('should navigate to collections page', async ({ page }) => {
    await navigateToAdminSection(page, 'collections');
    
    await expect(page.locator('h2')).toContainText('Collections');
    await expect(page.locator('a[href="/admin/collections/new"]')).toBeVisible();
  });

  test('should navigate to content page', async ({ page }) => {
    await navigateToAdminSection(page, 'content');
    
    await expect(page.locator('h1')).toContainText('Content Management');
    await expect(page.locator('a[href="/admin/content/new"]')).toBeVisible();
  });

  test('should navigate to media page', async ({ page }) => {
    await navigateToAdminSection(page, 'media');
    
    await expect(page.locator('h1')).toContainText('Media Library');
    await expect(page.locator('button').filter({ hasText: 'Upload Files' })).toBeVisible();
  });

  test('should show responsive navigation on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigation should still be accessible
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a[href="/admin/collections"]')).toBeVisible();
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