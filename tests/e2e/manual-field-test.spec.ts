import { test, expect } from '@playwright/test'

test.describe('Manual Field Test', () => {
  test('manually test collection field management step by step', async ({ page }) => {
    console.log('=== Manual Collection Field Test ===')
    
    // Step 1: Create admin user
    console.log('Step 1: Creating admin user')
    const response = await page.request.post('/auth/seed-admin')
    console.log('Seed admin response status:', response.status())
    
    // Step 2: Login
    console.log('Step 2: Login')
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@sonicjs.com')
    await page.fill('input[name="password"]', 'admin123')
    
    // Take screenshot before login
    await page.screenshot({ path: 'manual-1-before-login.png', fullPage: true })
    
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    // Take screenshot after login
    await page.screenshot({ path: 'manual-2-after-login.png', fullPage: true })
    
    // Check current URL
    console.log('Current URL after login:', page.url())
    
    // Step 3: Go to admin manually
    console.log('Step 3: Navigate to admin')
    await page.goto('/admin')
    await page.screenshot({ path: 'manual-3-admin-dashboard.png', fullPage: true })
    
    // Step 4: Go to collections
    console.log('Step 4: Navigate to collections')
    await page.goto('/admin/collections')
    await page.screenshot({ path: 'manual-4-collections-page.png', fullPage: true })
    
    // Check what's on the collections page
    const collectionsPageContent = await page.textContent('body')
    console.log('Collections page contains "New Collection":', collectionsPageContent?.includes('New Collection'))
    console.log('Collections page contains "Create":', collectionsPageContent?.includes('Create'))
    
    // Step 5: Try to create collection manually
    console.log('Step 5: Create collection')
    const newCollectionLink = page.locator('a[href="/admin/collections/new"]')
    if (await newCollectionLink.isVisible()) {
      await newCollectionLink.click()
      await page.screenshot({ path: 'manual-5-new-collection-form.png', fullPage: true })
      
      // Fill form with unique name
      const timestamp = Date.now()
      const uniqueName = `manual_test_${timestamp}`
      const uniqueDisplayName = `Manual Test ${timestamp}`
      
      await page.fill('input[name="name"]', uniqueName)
      await page.fill('input[name="displayName"]', uniqueDisplayName)
      await page.fill('textarea[name="description"]', 'Manual test collection')
      
      await page.screenshot({ path: 'manual-6-form-filled.png', fullPage: true })
      
      // Submit and wait for HTMX response
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/admin/collections') && response.request().method() === 'POST'
      )
      
      await page.click('button[type="submit"]')
      
      try {
        const response = await responsePromise
        console.log('Collection creation response status:', response.status())
        console.log('Response headers:', await response.allHeaders())
        const responseText = await response.text()
        console.log('Response text:', responseText.substring(0, 500))
      } catch (e) {
        console.log('No HTMX response captured, checking for redirect or error')
      }
      
      // Wait for redirect after successful creation
      await page.waitForURL('/admin/collections', { timeout: 5000 })
      await page.waitForTimeout(1000)
      
      await page.screenshot({ path: 'manual-7-after-submit.png', fullPage: true })
      console.log('URL after collection creation:', page.url())
    } else {
      console.log('❌ New collection link not found')
    }
    
    // Step 6: Check collections list
    console.log('Step 6: Check collections list')
    await page.goto('/admin/collections')
    await page.screenshot({ path: 'manual-8-collections-list.png', fullPage: true })
    
    // Debug: check what collections are actually shown in the table
    const tableRows = page.locator('#collections-table tbody tr')
    const rowCount = await tableRows.count()
    console.log('Total collection rows found:', rowCount)
    
    for (let i = 0; i < Math.min(5, rowCount); i++) {
      const rowText = await tableRows.nth(i).textContent()
      console.log(`Row ${i + 1}: ${rowText?.substring(0, 100)}...`)
    }
    
    // Look for our collection by display name in the table
    const manualTestLink = page.locator('td:has-text("Manual Test")').first().locator('xpath=following-sibling::td//a[contains(@href, "/admin/collections/")]').first()
    if (await manualTestLink.isVisible()) {
      console.log('✅ Collection created successfully')
      
      // Step 7: Test field management
      console.log('Step 7: Test field management')
      await manualTestLink.click()
      await page.screenshot({ path: 'manual-9-edit-collection.png', fullPage: true })
      
      // Check for field management section
      const fieldSection = page.locator('text=Collection Fields')
      if (await fieldSection.isVisible()) {
        console.log('✅ Field management section found')
        
        const addFieldButton = page.locator('button[onclick="showAddFieldModal()"]')
        if (await addFieldButton.isVisible()) {
          console.log('✅ Add Field button found')
          
          // Open modal
          await addFieldButton.click()
          await page.waitForTimeout(1000)
          await page.screenshot({ path: 'manual-10-modal-open.png', fullPage: true })
          
          const modal = page.locator('#field-modal')
          if (await modal.isVisible()) {
            console.log('✅ Modal opened successfully')
            
            // Fill field form
            await page.fill('#field-name', 'test_field')
            await page.selectOption('#field-type', 'text')
            await page.fill('#field-label', 'Test Field')
            
            await page.screenshot({ path: 'manual-11-modal-filled.png', fullPage: true })
            
            // Submit field and monitor response
            const fieldResponsePromise = page.waitForResponse(response => 
              response.url().includes('/fields') && response.request().method() === 'POST'
            )
            
            await page.click('#field-form button[type="submit"]')
            
            try {
              const fieldResponse = await fieldResponsePromise
              console.log('Field creation response status:', fieldResponse.status())
              const fieldResponseText = await fieldResponse.text()
              console.log('Field response:', fieldResponseText.substring(0, 300))
            } catch (e) {
              console.log('No field creation response captured')
            }
            
            await page.waitForTimeout(3000)
            
            await page.screenshot({ path: 'manual-12-after-field-submit.png', fullPage: true })
            
            // Check if field was created
            const fieldItem = page.locator('.field-item')
            const fieldCount = await fieldItem.count()
            console.log('Field items found:', fieldCount)
            
            if (fieldCount > 0) {
              console.log('✅ Field created successfully!')
            } else {
              console.log('❌ Field was not created')
            }
          } else {
            console.log('❌ Modal did not open')
          }
        } else {
          console.log('❌ Add Field button not found')
        }
      } else {
        console.log('❌ Field management section not found')
      }
    } else {
      console.log('❌ Collection was not created')
    }
  })
})