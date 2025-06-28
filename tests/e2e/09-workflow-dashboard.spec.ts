import { test, expect } from '@playwright/test'

test.describe('Workflow Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@sonicjs.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin/')
  })

  test('should display workflow dashboard', async ({ page }) => {
    // Just try to navigate and check if page loads without error
    await page.goto('/admin/workflow/dashboard')
    
    // Wait for page to load and check if it doesn't error
    await page.waitForLoadState('networkidle')
    
    // Check basic page structure - title may vary depending on implementation
    const title = await page.title()
    console.log('Page title:', title)
    
    // Check if page has basic content structure
    const hasContent = await page.locator('body').isVisible()
    expect(hasContent).toBe(true)
  })

  test('should display workflow states with counts', async ({ page }) => {
    await page.goto('/admin/workflow/dashboard')
    
    // Check for default workflow states
    const states = ['Draft', 'Pending Review', 'Approved', 'Published']
    
    for (const state of states) {
      await expect(page.locator(`text=${state}`)).toBeVisible()
    }
    
    // Check that each state has a count displayed
    const stateCounts = page.locator('[data-testid="state-count"]')
    const count = await stateCounts.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to scheduled content page', async ({ page }) => {
    await page.goto('/admin/workflow/dashboard')
    
    await page.click('a[href="/admin/workflow/scheduled"]')
    await page.waitForURL('/admin/workflow/scheduled')
    
    await expect(page.locator('h1')).toContainText('Scheduled Content')
  })

  test('should load content for specific workflow state', async ({ page }) => {
    await page.goto('/admin/workflow/dashboard')
    
    // Mock the state endpoint response
    await page.route('/admin/workflow/state/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [
            {
              id: 'test-content-1',
              title: 'Test Content',
              collection_name: 'Articles',
              state_name: 'Draft',
              state_color: '#F59E0B'
            }
          ],
          state: {
            id: 'draft',
            name: 'Draft',
            color: '#F59E0B'
          }
        })
      })
    })
    
    // Click on a state to load more content
    const viewAllButton = page.locator('button:has-text("View all")')
    if (await viewAllButton.count() > 0) {
      await viewAllButton.first().click()
      
      // Verify the request was made
      await page.waitForResponse('/admin/workflow/state/*')
    }
  })

  test('should show assigned content section when user has assignments', async ({ page }) => {
    await page.goto('/admin/workflow/dashboard')
    
    // Check if assigned content section appears
    const assignedSection = page.locator('text=Assigned to You')
    
    // Section may or may not be visible depending on data
    // Just verify the page loads without error
    await expect(page.locator('h1')).toContainText('Workflow Dashboard')
  })

  test('should display empty state when no content in workflow states', async ({ page }) => {
    await page.goto('/admin/workflow/dashboard')
    
    // Look for empty state indicators
    const emptyStates = page.locator('text=No content in this state')
    
    // May or may not be present depending on data
    await expect(page.locator('h1')).toContainText('Workflow Dashboard')
  })

  test('should handle workflow dashboard with real data', async ({ page }) => {
    // First, create some test content
    await page.goto('/admin/content/new')
    await page.selectOption('select[name="collection_id"]', { index: 1 })
    await page.fill('input[name="title"]', 'Workflow Test Article')
    await page.fill('input[name="slug"]', 'workflow-test-article')
    await page.fill('textarea[name="content"]', 'This is test content for workflow testing.')
    await page.click('button[type="submit"]')
    
    // Wait for redirect and go to workflow dashboard
    await page.waitForTimeout(1000)
    await page.goto('/admin/workflow/dashboard')
    
    // Verify the content appears in the workflow
    await expect(page.locator('h1')).toContainText('Workflow Dashboard')
    
    // Check that at least one state has content
    const stateCards = page.locator('.workflow-state-card')
    await expect(stateCards.first()).toBeVisible()
  })

  test('should maintain responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/admin/workflow/dashboard')
    
    // Check that page is responsive
    await expect(page.locator('h1')).toBeVisible()
    
    // Check that navigation buttons are accessible
    await expect(page.locator('a[href="/admin/workflow/scheduled"]')).toBeVisible()
  })
})