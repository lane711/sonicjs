import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './utils/test-helpers'

test.describe('Email Plugin Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('should redirect email plugin to custom settings page', async ({ page }) => {
    // Navigate to plugins page
    await page.goto('/admin/plugins')
    await page.waitForLoadState('networkidle')

    // Find the email plugin card and click Settings button
    const emailPluginCard = page.locator('.plugin-card').filter({ hasText: 'Email' })
    await expect(emailPluginCard).toBeVisible()

    // Click the Settings button on the email plugin card
    await emailPluginCard.locator('button:has-text("Settings")').click()

    // Should redirect to custom settings page
    await page.waitForURL('/admin/plugins/email/settings')
    expect(page.url()).toContain('/admin/plugins/email/settings')
  })

  test('should display email settings form with all fields', async ({ page }) => {
    // Navigate directly to email settings page
    await page.goto('/admin/plugins/email/settings')
    await page.waitForLoadState('networkidle')

    // Check page title
    await expect(page.locator('h1')).toContainText('Email Settings')

    // Check for Resend configuration section
    await expect(page.locator('h2:has-text("Resend Configuration")')).toBeVisible()

    // Check all form fields are present
    await expect(page.locator('label:has-text("Resend API Key")')).toBeVisible()
    await expect(page.locator('input#apiKey')).toBeVisible()
    await expect(page.locator('input#apiKey')).toHaveAttribute('type', 'password')
    await expect(page.locator('input#apiKey')).toHaveAttribute('required')

    await expect(page.locator('label:has-text("From Email")')).toBeVisible()
    await expect(page.locator('input#fromEmail')).toBeVisible()
    await expect(page.locator('input#fromEmail')).toHaveAttribute('type', 'email')
    await expect(page.locator('input#fromEmail')).toHaveAttribute('required')

    await expect(page.locator('label:has-text("From Name")')).toBeVisible()
    await expect(page.locator('input#fromName')).toBeVisible()
    await expect(page.locator('input#fromName')).toHaveAttribute('type', 'text')
    await expect(page.locator('input#fromName')).toHaveAttribute('required')

    await expect(page.locator('label:has-text("Reply-To Email")')).toBeVisible()
    await expect(page.locator('input#replyTo')).toBeVisible()
    await expect(page.locator('input#replyTo')).toHaveAttribute('type', 'email')

    await expect(page.locator('label:has-text("Logo URL")')).toBeVisible()
    await expect(page.locator('input#logoUrl')).toBeVisible()
    await expect(page.locator('input#logoUrl')).toHaveAttribute('type', 'url')

    // Check for action buttons
    await expect(page.locator('button[type="submit"]:has-text("Save Settings")')).toBeVisible()
    await expect(page.locator('button:has-text("Send Test Email")')).toBeVisible()
    await expect(page.locator('button:has-text("Reset")')).toBeVisible()

    // Check for info card
    await expect(page.locator('text=Email Templates Included')).toBeVisible()
    await expect(page.locator('text=Registration confirmation')).toBeVisible()
    await expect(page.locator('text=Email verification')).toBeVisible()
    await expect(page.locator('text=Password reset')).toBeVisible()
    await expect(page.locator('text=One-time code')).toBeVisible()
  })

  test('should save email settings successfully', async ({ page }) => {
    await page.goto('/admin/plugins/email/settings')
    await page.waitForLoadState('networkidle')

    // Fill in the form
    await page.fill('input#apiKey', 're_test_api_key_12345')
    await page.fill('input#fromEmail', 'noreply@test.com')
    await page.fill('input#fromName', 'Test App')
    await page.fill('input#replyTo', 'support@test.com')
    await page.fill('input#logoUrl', 'https://test.com/logo.png')

    // Submit the form
    await page.click('button[type="submit"]:has-text("Save Settings")')

    // Wait for success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible({ timeout: 5000 })
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/plugins/email/settings')
    await page.waitForLoadState('networkidle')

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]:has-text("Save Settings")')
    await submitButton.click()

    // Browser should prevent submission due to required fields
    // The apiKey field should have validation error
    const apiKeyField = page.locator('input#apiKey')
    await expect(apiKeyField).toHaveAttribute('required')

    const fromEmailField = page.locator('input#fromEmail')
    await expect(fromEmailField).toHaveAttribute('required')

    const fromNameField = page.locator('input#fromName')
    await expect(fromNameField).toHaveAttribute('required')
  })

  test('should reset form when clicking reset button', async ({ page }) => {
    await page.goto('/admin/plugins/email/settings')
    await page.waitForLoadState('networkidle')

    // Fill in some values
    await page.fill('input#apiKey', 're_test_123')
    await page.fill('input#fromEmail', 'test@test.com')
    await page.fill('input#fromName', 'Test')

    // Click reset button
    await page.click('button:has-text("Reset")')

    // Fields should be empty
    await expect(page.locator('input#apiKey')).toHaveValue('')
    await expect(page.locator('input#fromEmail')).toHaveValue('')
    await expect(page.locator('input#fromName')).toHaveValue('')
  })

  test('should send test email request', async ({ page }) => {
    await page.goto('/admin/plugins/email/settings')
    await page.waitForLoadState('networkidle')

    // Click test email button
    await page.click('button:has-text("Send Test Email")')

    // Should show sending message
    await expect(page.locator('text=Sending test email')).toBeVisible({ timeout: 2000 })
  })

  test('should not show "No Settings Available" message', async ({ page }) => {
    await page.goto('/admin/plugins/email/settings')
    await page.waitForLoadState('networkidle')

    // Should NOT show the generic "No Settings Available" message
    await expect(page.locator('text=No Settings Available')).not.toBeVisible()
    await expect(page.locator('text=No settings available')).not.toBeVisible()

    // Should show the settings form instead
    await expect(page.locator('h2:has-text("Resend Configuration")')).toBeVisible()
  })
})
