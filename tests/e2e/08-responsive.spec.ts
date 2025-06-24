import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/test-helpers';

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`should work on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await loginAsAdmin(page);
      
      // Admin dashboard should be accessible
      await expect(page.locator('h1')).toContainText('SonicJS AI Admin');
      
      // Navigation should be visible or accessible
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Key admin links should be present
      await expect(page.locator('a[href="/admin/collections"]')).toBeVisible();
      await expect(page.locator('a[href="/admin/content"]')).toBeVisible();
      await expect(page.locator('a[href="/admin/media"]')).toBeVisible();
    });
  }

  test('should handle mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    
    // Check if there's a mobile menu toggle
    const mobileMenuToggle = page.locator('.mobile-menu-toggle, .hamburger, button[aria-label*="menu"]');
    
    if (await mobileMenuToggle.count() > 0) {
      await mobileMenuToggle.click();
      
      // Menu should be visible after clicking
      await expect(page.locator('.mobile-menu, .menu-open')).toBeVisible();
    }
  });

  test('should stack content properly on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    
    // Content should not overflow horizontally
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    
    expect(bodyBox?.width).toBeLessThanOrEqual(375);
    
    // Should not have horizontal scrollbar
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('should make forms usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    
    // Go to collection creation form
    await page.click('a[href="/admin/collections"]');
    await page.click('a[href="/admin/collections/new"]');
    
    // Form fields should be properly sized
    const nameInput = page.locator('[name="name"]');
    await expect(nameInput).toBeVisible();
    
    const inputBox = await nameInput.boundingBox();
    expect(inputBox?.width).toBeGreaterThan(200); // Should be reasonably wide
    
    // Form should be submittable
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should handle tables on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    
    // Go to content management
    await page.click('a[href="/admin/content"]');
    
    // Table should be either responsive or scrollable
    const table = page.locator('table');
    
    if (await table.count() > 0) {
      // Should be in a scrollable container or responsive
      const container = page.locator('.overflow-x-auto, .table-responsive, table');
      await expect(container).toBeVisible();
    }
  });

  test('should show proper touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    
    // Buttons should be large enough for touch
    const buttons = page.locator('button, a.btn');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const buttonBox = await firstButton.boundingBox();
      
      // Touch targets should be at least 44px (iOS) or 48px (Android) in either dimension
      expect(buttonBox?.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('should adapt font sizes for readability', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    
    // Text should be readable (not too small)
    const h1 = page.locator('h1');
    const h1Style = await h1.evaluate(el => window.getComputedStyle(el));
    const fontSize = parseInt(h1Style.fontSize);
    
    expect(fontSize).toBeGreaterThanOrEqual(20); // Minimum readable size
  });

  test('should handle orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    
    // Verify content is accessible
    await expect(page.locator('h1')).toContainText('SonicJS AI Admin');
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Content should still be accessible
    await expect(page.locator('h1')).toContainText('SonicJS AI Admin');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should handle keyboard navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    
    // Focus should be visible and manageable
    const firstLink = page.locator('a').first();
    await firstLink.focus();
    
    // Should be able to tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should be visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
}); 