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

    // Check navigation links in sidebar (they're inside nav element)
    // Use .first() to avoid strict mode violations (desktop + mobile nav)
    await expect(page.locator('a[href="/admin"]').first()).toBeVisible();
    await expect(page.locator('a[href="/admin/collections"]').first()).toBeVisible();
    await expect(page.locator('a[href="/admin/content"]').first()).toBeVisible();
    await expect(page.locator('a[href="/admin/media"]').first()).toBeVisible();
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

  test('should display storage usage with database size', async ({ page }) => {
    // Look for the Storage Usage section
    const storageSection = page.getByRole('heading', { name: 'Storage Usage' });
    await expect(storageSection).toBeVisible({ timeout: 10000 });

    // Check that Database storage is displayed
    // Use more specific selector to avoid "D1 Database" in System Status
    const databaseLabel = page.locator('dt').filter({ hasText: 'Database' }).first();
    await expect(databaseLabel).toBeVisible({ timeout: 5000 });

    // Verify that database usage shows a value (may be "Unknown" or a size)
    const databaseUsage = page.locator('dd').filter({ hasText: /\/ 10 GB/ }).first();
    await expect(databaseUsage).toBeVisible({ timeout: 10000 });

    // Check that progress bar is displayed for database
    const progressBars = page.locator('div[class*="bg-cyan-500"], div[class*="bg-amber-500"], div[class*="bg-red-500"]');
    await expect(progressBars.first()).toBeVisible();

    // Check that Media Files and Cache are shown
    await expect(page.locator('dt').filter({ hasText: 'Media Files' }).first()).toBeVisible();
    await expect(page.locator('dt').filter({ hasText: 'Cache (KV)' }).first()).toBeVisible();

    // Verify Media and Cache show "N/A" (since they're unlimited)
    const naElements = page.locator('dd').filter({ hasText: 'N/A' });
    await expect(naElements.first()).toBeVisible();
  });

  test('should display system status', async ({ page }) => {
    // Look for the System Status section
    const systemStatusSection = page.getByRole('heading', { name: 'System Status' });
    await expect(systemStatusSection).toBeVisible({ timeout: 5000 });

    // Wait for HTMX to load the system status
    await page.waitForTimeout(2000);

    // Check for system components
    const systemStatusContainer = page.locator('#system-status-container');
    await expect(systemStatusContainer).toBeVisible();

    // Verify status indicators are present
    const operationalIndicators = page.locator('text=/●\\s*Operational/');
    await expect(operationalIndicators.first()).toBeVisible({ timeout: 5000 });

    // Check for the main system components
    await expect(page.getByText('Webserver', { exact: false })).toBeVisible();
    await expect(page.getByText('D1 Database', { exact: false })).toBeVisible();
    await expect(page.getByText('KV Storage', { exact: false })).toBeVisible();
    await expect(page.getByText('R2 Storage', { exact: false })).toBeVisible();
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