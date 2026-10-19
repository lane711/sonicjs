import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './utils/test-helpers'

test.describe('MDXEditor on New Content Form @content', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('should load MDXEditor on new pages content form', async ({ page }) => {
    // Navigate to new content form for pages collection
    await page.goto('/admin/content/new?collection=pages-collection')
    await page.waitForLoadState('networkidle')

    // Wait a bit for scripts to load
    await page.waitForTimeout(2000)

    // Check page title
    await expect(page.locator('h1')).toContainText('New')

    // Log all script tags to see what's loaded
    const scripts = await page.$$eval('script[src]', scripts =>
      scripts.map(s => s.getAttribute('src'))
    )
    console.log('Scripts loaded:', scripts)

    // Check if EasyMDE script is loaded
    const hasEasyMDE = scripts.some(src =>
      src?.includes('easymde') || src?.includes('EasyMDE')
    )
    console.log('Has EasyMDE script:', hasEasyMDE)

    // Check if there's a richtext field
    const richtextFields = await page.locator('[data-field-type="richtext"]').count()
    console.log('Richtext fields found:', richtextFields)

    // Check for EasyMDE container
    const easyMDEExists = await page.locator('.CodeMirror').count()
    console.log('EasyMDE containers found:', easyMDEExists)

    // Check browser console for any errors
    const consoleMessages: string[] = []
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`)
    })

    // Check if mdxeditorEnabled is passed to the template
    const pageContent = await page.content()
    console.log('mdxeditorEnabled in page:', pageContent.includes('mdxeditorEnabled'))
    console.log('mdxeditorSettings in page:', pageContent.includes('mdxeditorSettings'))

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/mdxeditor-new-content.png', fullPage: true })

    // Log console messages
    await page.waitForTimeout(1000)
    console.log('Console messages:', consoleMessages)

    // Expect EasyMDE to be loaded
    if (hasEasyMDE) {
      expect(easyMDEExists).toBeGreaterThan(0)
    } else {
      console.log('EasyMDE script not found - checking why')

      // Check if plugin is active
      await page.goto('/admin/plugins')
      await page.waitForLoadState('networkidle')

      const mdxPluginCard = page.locator('.plugin-card').filter({ hasText: 'MDX Editor' })
      const isVisible = await mdxPluginCard.isVisible()
      console.log('MDX Editor plugin visible:', isVisible)

      if (isVisible) {
        const statusBadge = await mdxPluginCard.locator('[data-status]').textContent()
        console.log('MDX Editor plugin status:', statusBadge)
      }
    }
  })

  test('should check pages collection schema for richtext field', async ({ page }) => {
    // The old `pages-collection` is gone; collections are code-only and slugs use
    // underscores. blog_post is the collection that carries the rich text "content" field.
    await page.goto('/admin/collections', { waitUntil: 'domcontentloaded' })

    // Find blog_post collection (rows navigate via onclick, not an <a>)
    const pagesCollection = page.locator('tbody tr').filter({ hasText: 'blog_post' }).first()
    await expect(pagesCollection).toBeVisible({ timeout: 15000 })

    // Open it
    await pagesCollection.click()
    await page.waitForURL(/\/admin\/collections\/blog_post$/, { timeout: 15000 })
    await expect(page.locator('h1')).toContainText('Edit Collection')

    // Read the read-only field list rendered from the collection config
    const fields = page
      .locator('div.bg-zinc-50.rounded-lg.border.p-4')
      .filter({ has: page.locator('code.font-mono') })
    const fieldCount = await fields.count()
    expect(fieldCount).toBeGreaterThan(0)

    const schema: { name: string; type: string }[] = []
    for (let i = 0; i < fieldCount; i++) {
      const row = fields.nth(i)
      const fieldName = ((await row.locator('code.font-mono').first().textContent()) || '').trim()
      const fieldType = (
        (await row.locator('span.inline-flex.items-center.rounded-md').first().textContent()) || ''
      )
        .replace(/\s+/g, ' ')
        .trim()
      schema.push({ name: fieldName, type: fieldType })
    }

    // The collection must expose a rich-text content field, and every field must declare a type
    const contentField = schema.find((f) => f.name === 'content')
    expect(contentField, 'blog_post exposes a "content" field').toBeDefined()
    expect(contentField!.type).not.toBe('')
    expect(['lexical', 'richtext', 'markdown', 'Rich Text (TinyMCE)', 'Rich Text (Quill)', 'Markdown'])
      .toContain(contentField!.type)

    for (const field of schema) {
      expect(field.name, 'field name rendered').not.toBe('')
      expect(field.type, `type badge for ${field.name}`).not.toBe('')
    }
  })

  test('should check mdxeditor plugin status and settings', async ({ page }) => {
    // Go to plugins page
    await page.goto('/admin/plugins')
    await page.waitForLoadState('networkidle')

    // Find MDXEditor plugin
    const mdxPluginCard = page.locator('.plugin-card').filter({ hasText: /MDX.*Editor/i })
    const isVisible = await mdxPluginCard.isVisible()
    console.log('MDX Editor plugin card visible:', isVisible)

    if (isVisible) {
      // Check status
      const statusBadge = await mdxPluginCard.locator('[data-status]')
      const status = await statusBadge.textContent()
      console.log('MDX Editor status:', status)

      // Check if there's an activate/deactivate button
      const activateBtn = mdxPluginCard.locator('button:has-text("Activate")')
      const deactivateBtn = mdxPluginCard.locator('button:has-text("Deactivate")')

      const hasActivate = await activateBtn.count() > 0
      const hasDeactivate = await deactivateBtn.count() > 0

      console.log('Has Activate button:', hasActivate)
      console.log('Has Deactivate button:', hasDeactivate)

      // If not active, activate it
      if (hasActivate) {
        console.log('Activating MDXEditor plugin...')
        await activateBtn.click()
        await page.waitForTimeout(1000)

        // Verify activation
        const newStatus = await mdxPluginCard.locator('[data-status]').textContent()
        console.log('New status after activation:', newStatus)
      }
    } else {
      console.log('MDXEditor plugin not found in plugins list')

      // List all plugins
      const allPlugins = await page.locator('.plugin-card h3').allTextContents()
      console.log('Available plugins:', allPlugins)
    }
  })
})
