const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Logging in...');
    await page.goto('http://localhost:8787/auth/login');
    await page.fill('[name="email"]', 'admin@sonicjs.com');
    await page.fill('[name="password"]', 'sonicjs!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    console.log('Navigating to collections...');
    await page.goto('http://localhost:8787/admin/collections');
    await page.waitForSelector('h1:has-text("Collections")');

    console.log('Opening first collection...');
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await page.waitForSelector('h1:has-text("Edit Collection")');

    console.log('Looking for fields...');
    const fieldCount = await page.locator('.field-item').count();
    console.log(`Found ${fieldCount} fields`);

    if (fieldCount > 0) {
      console.log('Clicking edit on first field...');
      const firstField = page.locator('.field-item').first();
      const editButton = firstField.locator('button:has-text("Edit")');
      await editButton.click();

      console.log('Waiting for modal...');
      await page.waitForSelector('#field-modal:not(.hidden)');

      // Wait a bit for values to be set
      await page.waitForTimeout(200);

      console.log('Checking field values...');
      const fieldName = await page.locator('#field-modal #modal-field-name').inputValue();
      const fieldType = await page.locator('#field-modal #field-type').inputValue();
      const fieldLabel = await page.locator('#field-modal #field-label').inputValue();
      const fieldRequired = await page.locator('#field-modal #field-required').isChecked();
      const fieldSearchable = await page.locator('#field-modal #field-searchable').isChecked();

      console.log('Field Name:', fieldName);
      console.log('Field Type:', fieldType);
      console.log('Field Label:', fieldLabel);
      console.log('Field Required:', fieldRequired);
      console.log('Field Searchable:', fieldSearchable);

      if (!fieldName) {
        console.error('❌ FAIL: Field name is empty!');
      } else {
        console.log('✓ Field name populated');
      }

      if (!fieldType) {
        console.error('❌ FAIL: Field type is empty!');
      } else {
        console.log('✓ Field type populated');
      }

      if (!fieldLabel) {
        console.error('❌ FAIL: Field label is empty!');
      } else {
        console.log('✓ Field label populated');
      }

      // Take a screenshot
      await page.screenshot({ path: '/Users/lane/Dev/refs/sonicjs/field-edit-test.png' });
      console.log('Screenshot saved to field-edit-test.png');
    }

    console.log('\nTest complete. Browser will stay open for inspection.');
    await page.waitForTimeout(60000); // Keep browser open for 60 seconds

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
})();
