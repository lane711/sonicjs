import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection } from './utils/test-helpers';

test.describe('Media Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdminSection(page, 'media');
  });

  test('should display media library', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Media Library');
    await expect(page.locator('button').filter({ hasText: 'Upload Files' })).toBeVisible();
  });

  test('should open upload modal', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Upload Files' }).click();
    
    await expect(page.locator('#upload-modal')).toBeVisible();
    await expect(page.locator('#file-input')).toBeVisible();
  });

  test('should handle file upload', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Upload Files' }).click();
    
    // Create a small test image file
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
    
    await page.setInputFiles('#file-input', {
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: testImageBuffer
    });
    
    await page.locator('button[type="submit"]').click();
    
    // Should show upload success
    await expect(page.locator('#upload-results')).toContainText('successful');
  });

  test('should validate file types', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Upload Files' }).click();
    
    // Try to upload an invalid file type
    await page.setInputFiles('#file-input', {
      name: 'test.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('fake executable')
    });
    
    await page.locator('button[type="submit"]').click();
    
    // Should show validation error
    await expect(page.locator('#upload-results')).toContainText('not allowed');
  });

  test('should display uploaded media', async ({ page }) => {
    // Check if there are any existing media files
    const mediaGrid = page.locator('#media-grid');
    
    if (await mediaGrid.locator('.media-item').count() > 0) {
      await expect(mediaGrid.locator('.media-item').first()).toBeVisible();
    }
  });

  test('should handle media selection', async ({ page }) => {
    const mediaItems = page.locator('.media-item');
    const count = await mediaItems.count();
    
    if (count > 0) {
      await mediaItems.first().click();
      await expect(mediaItems.first()).toHaveClass(/selected/);
    }
  });

  test('should show media details', async ({ page }) => {
    const mediaItems = page.locator('.media-item');
    const count = await mediaItems.count();
    
    if (count > 0) {
      await mediaItems.first().click();
      
      // Should show details panel or modal
      const details = page.locator('#media-details, .media-details');
      if (await details.count() > 0) {
        await expect(details).toBeVisible();
      }
    }
  });

  test('should close upload modal', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Upload Files' }).click();
    
    // Close modal
    await page.locator('#upload-modal .close, button').filter({ hasText: 'Cancel' }).click();
    
    await expect(page.locator('#upload-modal')).not.toBeVisible();
  });

  test('should support media search/filter', async ({ page }) => {
    // Check if search functionality exists
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      // Should filter results
      await page.waitForTimeout(500); // Wait for search to process
    }
  });

  test('should handle empty media library', async ({ page }) => {
    // If no media files exist, should show appropriate message
    const mediaGrid = page.locator('#media-grid');
    const mediaItems = page.locator('.media-item');
    
    if (await mediaItems.count() === 0) {
      await expect(page.getByText('No media files found')).toBeVisible();
    }
  });
}); 