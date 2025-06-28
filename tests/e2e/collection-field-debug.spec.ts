import { test, expect } from '@playwright/test'

test.describe('Collection Field Debug', () => {
  test.beforeEach(async ({ page }) => {
    // Create admin user first via POST request
    await page.request.post('/auth/seed-admin')
    await page.waitForTimeout(1000)
    
    // Login as admin
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@sonicjs.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // Wait for success message and redirect
    await page.waitForTimeout(3000)
    await page.goto('/admin')
  })

  test('debug collection field functionality', async ({ page }) => {
    console.log('=== Starting Collection Field Debug ===')
    
    // Step 1: Navigate to collections
    console.log('Step 1: Navigate to collections')
    await page.goto('/admin/collections')
    
    // Take screenshot
    await page.screenshot({ path: 'debug-1-collections-page.png', fullPage: true })
    
    // Step 2: Create a test collection
    console.log('Step 2: Create test collection')
    await page.click('a[href="/admin/collections/new"]')
    
    await page.fill('input[name="name"]', 'debug_collection')
    await page.fill('input[name="displayName"]', 'Debug Collection')
    await page.fill('textarea[name="description"]', 'Collection for debugging field management')
    
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'debug-2-after-create.png', fullPage: true })
    
    // Step 3: Navigate to edit collection
    console.log('Step 3: Navigate to edit collection')
    await page.goto('/admin/collections')
    
    const debugCollectionLink = page.locator('a:has-text("Debug Collection")').first()
    await expect(debugCollectionLink).toBeVisible()
    await debugCollectionLink.click()
    
    await page.screenshot({ path: 'debug-3-edit-page.png', fullPage: true })
    
    // Step 4: Check for field management section
    console.log('Step 4: Check field management section')
    const fieldSection = page.locator('text=Collection Fields')
    console.log('Field section visible:', await fieldSection.isVisible())
    
    const addFieldButton = page.locator('button:has-text("Add Field")')
    console.log('Add field button visible:', await addFieldButton.isVisible())
    
    // Step 5: Try to open modal
    console.log('Step 5: Try to open add field modal')
    await addFieldButton.click()
    
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'debug-4-modal-opened.png', fullPage: true })
    
    const modal = page.locator('#field-modal')
    console.log('Modal visible:', await modal.isVisible())
    console.log('Modal classes:', await modal.getAttribute('class'))
    
    // Step 6: Try to fill and submit field form
    console.log('Step 6: Fill field form')
    await page.fill('#field-name', 'test_field')
    await page.selectOption('#field-type', 'text')
    await page.fill('#field-label', 'Test Field')
    
    await page.screenshot({ path: 'debug-5-form-filled.png', fullPage: true })
    
    // Step 7: Submit form and check response
    console.log('Step 7: Submit field form')
    const submitButton = page.locator('#field-form button[type="submit"]')
    await submitButton.click()
    
    // Wait and check for errors
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'debug-6-after-submit.png', fullPage: true })
    
    // Check console logs
    const consoleLogs = []
    page.on('console', msg => consoleLogs.push(msg.text()))
    
    console.log('Console logs:', consoleLogs)
    
    // Check if field was created
    const fieldItem = page.locator('.field-item')
    console.log('Field items count:', await fieldItem.count())
    
    if (await fieldItem.count() > 0) {
      console.log('✅ Field created successfully!')
    } else {
      console.log('❌ Field was not created')
    }
  })
})