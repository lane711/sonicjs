import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './utils/test-helpers';

test.describe('Media Library Enhancements', () => {
  const collectionName = 'Media Test Multi V2';
  const collectionSlug = 'media-test-multi-v2';

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should support multiple media selection and video upload', async ({ page }) => {
    // 1. Create collection with multiple media field
    await page.goto('/admin/collections');

    // Check if collection already exists to avoid duplicates/errors
    const collectionExists = await page.getByText(collectionName).isVisible();
    if (!collectionExists) {
      await page.getByRole('link', { name: 'New Collection' }).click();
      await page.getByLabel('Display Name').fill(collectionName);
      await page.getByLabel('Collection Name').fill(collectionSlug);
      await page.getByRole('button', { name: 'Create Collection' }).click();

      // Wait for redirection to list
      await page.waitForURL(/\/admin\/collections$/);

      // Click on the new collection to edit it
      await page.getByText(collectionName).click();

      // Wait for Edit page
      await page.waitForURL(/\/admin\/collections\/.+/);

      // Add multiple media field
      await page.getByRole('button', { name: 'Add Field' }).click();

      // Wait for modal
      const modal = page.locator('#field-modal');
      await expect(modal).toBeVisible();

      await page.getByLabel('Field Label').fill('Gallery');
      await page.getByLabel('Field Name').fill('gallery');

      // Select Media type
      await page.selectOption('select[name="field_type"]', 'media');

      // Set multiple: true in JSON options
      await page.getByLabel('Options (JSON)').fill('{ "multiple": true, "accept": "image/*,video/*" }');

      // Submit field
      await modal.getByRole('button', { name: 'Add Field' }).click();

      // Wait for modal to close
      await expect(modal).toBeHidden();
    }

    // 2. Go to create content
    await page.goto(`/admin/content/new?collection=${collectionSlug}`);

    // 3. Open Media Selector
    // The button text might vary depending on if it's empty or not, but usually "Select Media"
    // Since we set multiple: true, the label might be "Select Media (Multiple)" if the template logic adds it,
    // or just "Select Media". Let's target by the button inside the field container.
    await page.locator('button[onclick*="openMediaSelector"]').click();

    // 4. Verify Upload Form in Selector
    const selectorModal = page.locator('#media-selector-modal');
    await expect(selectorModal).toBeVisible();

    // Verify the upload section is present inside the modal
    const uploadInput = selectorModal.locator('input[type="file"]');
    await expect(uploadInput).toBeVisible();

    // 5. Upload a file directly from the selector
    // Create a dummy image
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==', 'base64');

    await uploadInput.setInputFiles({
      name: 'test-upload-in-selector.png',
      mimeType: 'image/png',
      buffer: buffer
    });

    // Wait for upload to complete and item to appear in the grid
    // The grid is refreshed via HTMX. We look for the new item.
    await expect(selectorModal.locator('.media-item').filter({ hasText: 'test-upload-in-selector.png' })).toBeVisible();

    // 6. Select multiple items
    // We need at least 2 items. Let's upload another one or use existing.
    // Let's upload a second one to be sure.
    await uploadInput.setInputFiles({
      name: 'test-upload-2.png',
      mimeType: 'image/png',
      buffer: buffer
    });
    await expect(selectorModal.locator('.media-item').filter({ hasText: 'test-upload-2.png' })).toBeVisible();

    // Click on both items to select them
    const item1 = selectorModal.locator('.media-item').filter({ hasText: 'test-upload-in-selector.png' });
    const item2 = selectorModal.locator('.media-item').filter({ hasText: 'test-upload-2.png' });

    await item1.click();
    await item2.click();

    // Verify visual selection state (usually a border or checkmark)
    // The class 'ring-2' or similar is added.
    await expect(item1).toHaveClass(/ring-2/);
    await expect(item2).toHaveClass(/ring-2/);

    // 7. Confirm selection
    await selectorModal.getByRole('button', { name: 'Insert Selected' }).click();

    // 8. Verify preview grid in the form
    // The modal should close
    await expect(selectorModal).toBeHidden();

    // The preview grid should show 2 items
    const previewGrid = page.locator('#gallery-preview'); // ID is usually fieldName-preview
    await expect(previewGrid).toBeVisible();
    await expect(previewGrid.locator('.media-preview-item')).toHaveCount(2);

    // 9. Verify Video Support (MP4)
    // We can't easily upload a real MP4 in this environment without a large buffer, 
    // but we can verify the accept attribute allows video.
    await expect(uploadInput).toHaveAttribute('accept', /video/);
  });
});
