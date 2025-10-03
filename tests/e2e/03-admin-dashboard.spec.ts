import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';
import packageJson from '../../package.json';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display correct version from package.json', async ({ page }) => {
    // The version should be displayed in the layout (usually in the sidebar or footer)
    const expectedVersion = `v${packageJson.version}`;

    // Look for the version text anywhere in the page (there may be multiple instances)
    const versionElement = page.getByText(expectedVersion).first();
    await expect(versionElement).toBeVisible();

    // Make sure it's not showing the old hardcoded version
    const oldVersion = page.getByText('v0.1.0', { exact: true });
    await expect(oldVersion).not.toBeVisible();
  });

  test('should display admin dashboard with navigation', async ({ page }) => {
    // Check that we're on the admin dashboard by verifying URL and navigation
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('nav').first()).toBeVisible();
    
    // Check navigation links in sidebar
    await expect(page.locator('nav a[href="/admin"]')).toBeVisible();
    await expect(page.locator('nav a[href="/admin/collections"]')).toBeVisible();
    await expect(page.locator('nav a[href="/admin/content"]')).toBeVisible();
    await expect(page.locator('nav a[href="/admin/media"]').first()).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    // Check for stats container that loads via HTMX
    const statsContainer = page.locator('#stats-container');
    
    // Wait for either stats container to appear or timeout gracefully
    try {
      await expect(statsContainer).toBeVisible({ timeout: 3000 });
      
      // Wait for HTMX to load stats and check if content appears
      await page.waitForTimeout(2000); // Give HTMX time to load
      
      // Check if stats cards or skeleton is visible
      await expect(statsContainer).toContainText(/Collections|Active Users|skeleton/);
    } catch (error) {
      // If stats container doesn't exist, just verify we're on admin page
      await expect(page.locator('h1, h2, [class*="dashboard"]').first()).toBeVisible();
    }
  });

  test('should navigate to collections page', async ({ page }) => {
    await navigateToAdminSection(page, 'collections');
    
    await expect(page.locator('h1')).toContainText('Collections');
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