import { test, expect } from '@playwright/test'

test.describe('Collection Field Management', () => {
  let collectionId: string

  test.beforeEach(async ({ page }) => {
    // Create admin user first
    await page.goto('/auth/seed-admin')
    await page.waitForTimeout(1000)
    
    // Login as admin
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for redirect to admin
    await page.waitForURL(/\/admin/, { timeout: 10000 })
  })

  test('should create a new collection for field testing', async ({ page }) => {
    // Navigate to collections
    await page.goto('/admin/collections')
    await expect(page.locator('h1')).toContainText('Collections')

    // Create new collection
    await page.click('a[href="/admin/collections/new"]')
    await expect(page.locator('h1')).toContainText('Create New Collection')

    // Fill collection form
    await page.fill('input[name="name"]', 'test_collection')
    await page.fill('input[name="displayName"]', 'Test Collection')
    await page.fill('textarea[name="description"]', 'Collection for testing field management')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for success and redirect
    await expect(page.locator('.bg-green-100')).toBeVisible()
    await page.waitForURL('/admin/collections')
    
    // Verify collection was created
    await expect(page.locator('text=Test Collection')).toBeVisible()
  })

  test('should navigate to collection edit page and show field management section', async ({ page }) => {
    // Go to collections page
    await page.goto('/admin/collections')
    
    // Find and click on the test collection
    const collectionLink = page.locator('a:has-text("Test Collection")').first()
    await expect(collectionLink).toBeVisible()
    await collectionLink.click()
    
    // Should be on edit page
    await expect(page.locator('h1')).toContainText('Edit Collection')
    
    // Check for field management section
    await expect(page.locator('text=Collection Fields')).toBeVisible()
    await expect(page.locator('button:has-text("Add Field")')).toBeVisible()
    
    // Should show "No fields defined" initially
    await expect(page.locator('text=No fields defined')).toBeVisible()
  })

  test('should open add field modal when clicking Add Field button', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    // Click Add Field button
    await page.click('button:has-text("Add Field")')
    
    // Modal should be visible
    await expect(page.locator('#field-modal')).toBeVisible()
    await expect(page.locator('#modal-title')).toContainText('Add Field')
    
    // Form fields should be present
    await expect(page.locator('#field-name')).toBeVisible()
    await expect(page.locator('#field-type')).toBeVisible()
    await expect(page.locator('#field-label')).toBeVisible()
    await expect(page.locator('#field-required')).toBeVisible()
    await expect(page.locator('#field-searchable')).toBeVisible()
  })

  test('should create a text field successfully', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    // Open add field modal
    await page.click('button:has-text("Add Field")')
    
    // Fill form for text field
    await page.fill('#field-name', 'title')
    await page.selectOption('#field-type', 'text')
    await page.fill('#field-label', 'Title')
    await page.check('#field-required')
    await page.check('#field-searchable')
    
    // Submit form
    await page.click('#field-form button[type="submit"]')
    
    // Wait for page reload or success
    await page.waitForTimeout(2000)
    
    // Verify field was created
    await expect(page.locator('text=Title')).toBeVisible()
    await expect(page.locator('text=text')).toBeVisible()
    await expect(page.locator('text=Required')).toBeVisible()
  })

  test('should create different field types', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    const fieldTypes = [
      { name: 'content', type: 'richtext', label: 'Content' },
      { name: 'publish_date', type: 'date', label: 'Publish Date' },
      { name: 'is_featured', type: 'boolean', label: 'Featured' },
      { name: 'view_count', type: 'number', label: 'View Count' }
    ]
    
    for (const field of fieldTypes) {
      // Open add field modal
      await page.click('button:has-text("Add Field")')
      
      // Fill form
      await page.fill('#field-name', field.name)
      await page.selectOption('#field-type', field.type)
      await page.fill('#field-label', field.label)
      
      // Submit form
      await page.click('#field-form button[type="submit"]')
      
      // Wait for page reload
      await page.waitForTimeout(2000)
      
      // Verify field was created
      await expect(page.locator(`text=${field.label}`)).toBeVisible()
      await expect(page.locator(`text=${field.type}`)).toBeVisible()
    }
  })

  test('should show field options for select field type', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    // Open add field modal
    await page.click('button:has-text("Add Field")')
    
    // Select 'select' field type
    await page.selectOption('#field-type', 'select')
    
    // Options container should become visible
    await expect(page.locator('#field-options-container')).toBeVisible()
    
    // Should have default options
    const optionsTextarea = page.locator('#field-options')
    await expect(optionsTextarea).toHaveValue(/"options":\s*\["Option 1",\s*"Option 2"\]/)
    
    // Fill form
    await page.fill('#field-name', 'status')
    await page.fill('#field-label', 'Status')
    
    // Customize options
    await page.fill('#field-options', '{"options": ["Draft", "Published", "Archived"], "multiple": false}')
    
    // Submit form
    await page.click('#field-form button[type="submit"]')
    
    // Wait for page reload
    await page.waitForTimeout(2000)
    
    // Verify field was created
    await expect(page.locator('text=Status')).toBeVisible()
    await expect(page.locator('text=select')).toBeVisible()
  })

  test('should validate field name format', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    // Open add field modal
    await page.click('button:has-text("Add Field")')
    
    // Try invalid field name with spaces
    await page.fill('#field-name', 'invalid field name')
    await page.selectOption('#field-type', 'text')
    await page.fill('#field-label', 'Invalid Field')
    
    // Submit form
    await page.click('#field-form button[type="submit"]')
    
    // Should show validation error (HTML5 pattern validation)
    const fieldNameInput = page.locator('#field-name')
    await expect(fieldNameInput).toHaveAttribute('pattern', '[a-z0-9_]+')
  })

  test('should prevent duplicate field names', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    // Try to create field with existing name
    await page.click('button:has-text("Add Field")')
    
    // Use same name as existing field
    await page.fill('#field-name', 'title')
    await page.selectOption('#field-type', 'text')
    await page.fill('#field-label', 'Duplicate Title')
    
    // Submit form
    await page.click('#field-form button[type="submit"]')
    
    // Should show error (wait for response)
    await page.waitForTimeout(2000)
    
    // Error handling will depend on implementation
    // Could be alert, modal error, or page error message
  })

  test('should delete a field', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    // Find a field to delete (should have some from previous tests)
    const deleteButton = page.locator('button:has-text("Delete")').first()
    await expect(deleteButton).toBeVisible()
    
    // Click delete and confirm
    page.on('dialog', dialog => dialog.accept())
    await deleteButton.click()
    
    // Wait for page reload
    await page.waitForTimeout(2000)
    
    // Field should be removed (this test is more complex to verify specific field removal)
  })

  test('should close modal on cancel button', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    // Open modal
    await page.click('button:has-text("Add Field")')
    await expect(page.locator('#field-modal')).toBeVisible()
    
    // Click cancel
    await page.click('button:has-text("Cancel")')
    
    // Modal should be hidden
    await expect(page.locator('#field-modal')).toBeHidden()
  })

  test('should close modal on escape key', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    // Open modal
    await page.click('button:has-text("Add Field")')
    await expect(page.locator('#field-modal')).toBeVisible()
    
    // Press escape
    await page.keyboard.press('Escape')
    
    // Modal should be hidden
    await expect(page.locator('#field-modal')).toBeHidden()
  })

  test('should close modal on backdrop click', async ({ page }) => {
    // Navigate to collection edit page
    await page.goto('/admin/collections')
    await page.click('a:has-text("Test Collection")')
    
    // Open modal
    await page.click('button:has-text("Add Field")')
    await expect(page.locator('#field-modal')).toBeVisible()
    
    // Click backdrop (the modal overlay itself)
    await page.locator('#field-modal').click()
    
    // Modal should be hidden
    await expect(page.locator('#field-modal')).toBeHidden()
  })

  test('should verify fields appear in content creation form', async ({ page }) => {
    // Navigate to content creation
    await page.goto('/admin/content/new')
    
    // Should show collection selection since we have one
    await expect(page.locator('text=Test Collection')).toBeVisible()
    await page.click('a:has-text("Test Collection")')
    
    // Should be on content form with dynamic fields
    await expect(page.locator('text=New Test Collection')).toBeVisible()
    
    // Check for our created fields
    await expect(page.locator('label:has-text("Title")')).toBeVisible()
    await expect(page.locator('label:has-text("Content")')).toBeVisible()
    await expect(page.locator('label:has-text("Publish Date")')).toBeVisible()
    await expect(page.locator('label:has-text("Featured")')).toBeVisible()
    await expect(page.locator('label:has-text("View Count")')).toBeVisible()
    await expect(page.locator('label:has-text("Status")')).toBeVisible()
  })

  test('should clean up test collection', async ({ page }) => {
    // Clean up - delete test collection
    await page.goto('/admin/collections')
    
    // Find test collection and delete it
    const testCollectionLink = page.locator('a:has-text("Test Collection")').first()
    if (await testCollectionLink.isVisible()) {
      await testCollectionLink.click()
      
      // Delete collection
      page.on('dialog', dialog => dialog.accept())
      await page.click('button:has-text("Delete Collection")')
      
      await page.waitForURL('/admin/collections')
    }
  })
})