import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, isAuthenticated, ADMIN_CREDENTIALS } from './utils/test-helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start logged out
    await logout(page);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.locator('h2')).toContainText('Sign in to SonicJS AI');
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Should be on admin dashboard
    await expect(page.locator('h1').first()).toContainText('SonicJS AI Admin');
    await expect(page).toHaveURL('/admin');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('[name="email"]', 'invalid@email.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('.error, .bg-red-100')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await loginAsAdmin(page);
    await expect(await isAuthenticated(page)).toBe(true);
    
    // Then logout
    await logout(page);
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(await isAuthenticated(page)).toBe(false);
  });

  test('should protect admin routes from unauthenticated access', async ({ page }) => {
    const adminRoutes = [
      '/admin',
      '/admin/collections',
      '/admin/content',
      '/admin/media',
      '/admin/users'
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      // Should redirect to login
      await page.waitForURL(/\/auth\/login/);
      await expect(page.locator('h2')).toContainText('Sign in to SonicJS AI');
    }
  });

  test('should maintain session across page reloads', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Reload the page
    await page.reload();
    
    // Should still be authenticated
    await expect(page.locator('h1').first()).toContainText('SonicJS AI Admin');
    await expect(await isAuthenticated(page)).toBe(true);
  });
}); 