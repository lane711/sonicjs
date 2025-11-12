import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './utils/test-helpers'

/**
 * E2E Test: Field Type Persistence
 *
 * Tests that when editing a collection field and changing the field type,
 * the selection persists after saving and reopening the modal.
 */

test.describe('Field Type Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('should persist field type selection when editing a field', async ({ page }) => {
    // Navigate to an existing collection
    await page.goto('http://localhost:8787/admin/collections/news-collection')
    await page.waitForLoadState('networkidle')

    // Find the first field's edit button and click it
    const firstEditButton = page.locator('.field-item button:has-text("Edit")').first()
    await firstEditButton.waitFor({ state: 'visible', timeout: 10000 })
    await firstEditButton.click()
    await page.waitForTimeout(500)

    // Wait for the modal to be visible
    await page.waitForSelector('#field-type', { state: 'visible', timeout: 10000 })

    // Log current field type value
    const currentType = await page.locator('#field-type').inputValue()
    console.log('Current field type:', currentType)

    // Change to quill
    await page.selectOption('#field-type', 'quill')

    // Verify it was selected
    const selectedValue = await page.locator('#field-type').inputValue()
    console.log('Selected field type:', selectedValue)
    expect(selectedValue).toBe('quill')

    // Click save button
    const saveButton = page.locator('button:has-text("Save")').first()
    await saveButton.click()

    // Wait for save to complete (look for success message or modal to close)
    await page.waitForTimeout(1000)

    // Reopen the edit modal for the same field
    await firstEditButton.click()
    await page.waitForTimeout(500)

    // Wait for modal
    await page.waitForSelector('#field-type', { state: 'visible', timeout: 10000 })

    // Check if the field type is still quill
    const persistedValue = await page.locator('#field-type').inputValue()
    console.log('Persisted field type:', persistedValue)

    expect(persistedValue).toBe('quill')
  })

  test('should show field type in form data when saving', async ({ page }) => {
    // Set up request interception to see what's being sent
    const requests: any[] = []
    page.on('request', request => {
      if (request.url().includes('/fields/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        })
      }
    })

    // Navigate to an existing collection
    await page.goto('http://localhost:8787/admin/collections/news-collection')
    await page.waitForLoadState('networkidle')

    // Find the first field's edit button and click it
    const firstEditButton = page.locator('.field-item button:has-text("Edit")').first()
    await firstEditButton.waitFor({ state: 'visible', timeout: 10000 })
    await firstEditButton.click()
    await page.waitForTimeout(500)

    // Wait for the modal to be visible
    await page.waitForSelector('#field-type', { state: 'visible', timeout: 10000 })

    // Change to quill
    await page.selectOption('#field-type', 'quill')

    // Click save button
    const saveButton = page.locator('button:has-text("Save")').first()
    await saveButton.click()

    // Wait for request to complete
    await page.waitForTimeout(2000)

    // Check if field_type was in the request
    console.log('Captured requests:', JSON.stringify(requests, null, 2))

    const putRequest = requests.find(r => r.method === 'PUT')
    expect(putRequest).toBeDefined()

    if (putRequest && putRequest.postData) {
      console.log('PUT request data:', putRequest.postData)
      expect(putRequest.postData).toContain('field_type')
      expect(putRequest.postData).toContain('quill')
    }
  })
})
