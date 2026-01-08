# Auto-Generate Slug from Title - Implementation Plan

## 📋 Issues Addressed
- **Issue #323**: [Auto-generate URL slug from blog post title](https://github.com/lane711/sonicjs/issues/323)
- **Issue #329**: [Content: auto-populate slug from title](https://github.com/lane711/sonicjs/issues/329)

Both issues request the same feature - these are duplicates and should be consolidated.

---

## 🎯 Goal
Improve UX for content creators by auto-generating URL slugs from titles in real-time, while still allowing manual overrides and providing explicit regeneration controls.

---

## 🔍 Current State Analysis

### ✅ What Already Works
Looking at `packages/core/src/templates/components/dynamic-field.template.ts` (lines 354-365):

```typescript
// Auto-generate slug when title changes
document.addEventListener('DOMContentLoaded', function() {
  const titleField = document.querySelector('input[name="title"]');
  const slugField = document.getElementById('${fieldId}');
  if (titleField && slugField && !slugField.value) {
    titleField.addEventListener('input', function() {
      if (!slugField.value) {  // ⚠️ THIS IS THE PROBLEM!
        generateSlugFromTitle('${fieldId}');
      }
    });
  }
});
```

**The feature IS implemented but has a critical bug!**

### ❌ The Bug
**Line 360**: `if (!slugField.value)` **checks INSIDE the event handler**

**Problem**: After the first character is typed in the title, `generateSlugFromTitle()` is called, which sets `slugField.value`. On the NEXT keystroke, the condition `if (!slugField.value)` evaluates to `false` (because slug now has a value), so auto-generation **stops permanently**.

**Result**: Only the first character of the title gets slugified, then it stops updating. Users think the feature is broken.

---

## 🐛 Root Cause

The logic should track **"has the user manually edited the slug?"** not **"does the slug have a value?"**.

### Current Flawed Logic:
```javascript
if (titleField && slugField && !slugField.value) {  // ✅ Only attach listener if slug is empty initially
  titleField.addEventListener('input', function() {
    if (!slugField.value) {  // ❌ BUG: This stops working after first update!
      generateSlugFromTitle('${fieldId}');
    }
  });
}
```

### What Should Happen:
```javascript
let slugWasManuallyEdited = !!slugField.value; // If editing existing content, don't auto-update

titleField.addEventListener('input', function() {
  if (!slugWasManuallyEdited) {  // Only auto-generate if user hasn't touched slug
    generateSlugFromTitle('${fieldId}');
  }
});

slugField.addEventListener('input', function() {
  slugWasManuallyEdited = true;  // User touched it - stop auto-generation
});
```

---

## 📝 Requirements (from issues)

### Issue #323 Requirements:
- [x] Auto-generate slug from title on keypress *(exists but broken)*
- [ ] **FIX**: Allow manual override of the generated slug *(partially works - stops auto-gen but at wrong time)*
- [x] Slug should follow URL-friendly conventions (lowercase, hyphens for spaces, remove special characters) *(already correct)*

### Issue #329 Requirements:
- [ ] **FIX**: While **creating** content, auto-fill slug from title as user types; stop after slug is manually changed
- [x] Add a "Regenerate slug" link/button *(already exists at line 306)*
- [ ] **FIX**: In **edit mode**, never auto-change slug when title changes *(currently broken - stops after first char)*
- [x] Ensure slug formatting matches existing rules *(already correct: `^[a-z0-9-]+$`)*
- [ ] Cover UX in Playwright E2E tests

---

## 🛠️ Implementation Plan

### Phase 1: Fix the Core Bug ⚡ (30 min)

**File**: `packages/core/src/templates/components/dynamic-field.template.ts`

**Changes needed** (lines 354-366):

```typescript
// Auto-generate slug when title changes
document.addEventListener('DOMContentLoaded', function() {
  const titleField = document.querySelector('input[name="title"]');
  const slugField = document.getElementById('${fieldId}');
  
  if (titleField && slugField) {
    // Track whether user has manually edited the slug
    let slugWasManuallyEdited = !!slugField.value; // True if editing existing content with a slug
    
    // Auto-generate from title (only if not manually edited)
    titleField.addEventListener('input', function() {
      if (!slugWasManuallyEdited) {
        generateSlugFromTitle('${fieldId}');
      }
    });
    
    // Detect manual slug changes
    slugField.addEventListener('input', function() {
      slugWasManuallyEdited = true; // Stop auto-generation once user touches slug
    });
    
    // Restore auto-generation when "Generate from title" button is clicked
    window.generateSlugFromTitle = function(slugFieldId) {
      const titleField = document.querySelector('input[name="title"]');
      const slugField = document.getElementById(slugFieldId);
      if (titleField && slugField) {
        const slug = titleField.value
          .toLowerCase()
          .replace(/[^a-z0-9\\s_-]/g, '')
          .replace(/\\s+/g, '-')
          .replace(/[-_]+/g, '-')
          .replace(/^[-_]|[-_]$/g, '');
        slugField.value = slug;
        slugWasManuallyEdited = false; // Re-enable auto-generation after explicit regenerate
      }
    };
  }
});
```

**Key Changes**:
1. ✅ Remove the inner `if (!slugField.value)` check (THE BUG)
2. ✅ Add `slugWasManuallyEdited` flag
3. ✅ Initialize flag based on whether slug already has a value (edit mode detection)
4. ✅ Set flag to `true` when user types in slug field
5. ✅ Move `generateSlugFromTitle` to global scope and reset flag when called explicitly

---

### Phase 2: Improve UX 🎨 (15 min)

**Enhancement 1: Better "Generate from title" button**

Update line 306 to make the button more visible and indicate its behavior:

```typescript
slugHelp += '<button type="button" class="mt-2 inline-flex items-center gap-x-1 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300" onclick="generateSlugFromTitle(\'${fieldId}\')"><svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Regenerate from title</button>'
```

**Enhancement 2: Visual feedback during auto-generation**

Add a subtle indicator showing auto-generation is active:

```typescript
titleField.addEventListener('input', function() {
  if (!slugWasManuallyEdited) {
    slugField.classList.add('ring-2', 'ring-cyan-500/20'); // Subtle highlight
    generateSlugFromTitle('${fieldId}');
    setTimeout(() => slugField.classList.remove('ring-2', 'ring-cyan-500/20'), 300);
  }
});
```

---

### Phase 3: E2E Test Coverage 🧪 (45 min)

**File**: `tests/e2e/05-content.spec.ts` (add new tests)

**Test Cases**:

```typescript
test.describe('Auto-slug generation', () => {
  test('should auto-generate slug from title when creating new content', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content?action=new&collection=col-blog_posts-xxx');
    
    const titleField = page.locator('input[name="title"]');
    const slugField = page.locator('input[name="slug"]');
    
    // Type title character by character
    await titleField.fill('My Awesome Blog Post!');
    
    // Verify slug auto-generated correctly
    await expect(slugField).toHaveValue('my-awesome-blog-post');
  });
  
  test('should stop auto-generation after manual slug edit', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content?action=new&collection=col-blog_posts-xxx');
    
    const titleField = page.locator('input[name="title"]');
    const slugField = page.locator('input[name="slug"]');
    
    // Auto-generate initial slug
    await titleField.fill('First Title');
    await expect(slugField).toHaveValue('first-title');
    
    // Manually edit slug
    await slugField.clear();
    await slugField.fill('custom-slug');
    
    // Change title again - slug should NOT update
    await titleField.fill('Second Title');
    await expect(slugField).toHaveValue('custom-slug'); // Should remain unchanged
  });
  
  test('should regenerate slug on button click', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content?action=new&collection=col-blog_posts-xxx');
    
    const titleField = page.locator('input[name="title"]');
    const slugField = page.locator('input[name="slug"]');
    
    // Auto-generate initial slug
    await titleField.fill('Original Title');
    await expect(slugField).toHaveValue('original-title');
    
    // Manually edit slug
    await slugField.clear();
    await slugField.fill('custom-slug');
    
    // Change title
    await titleField.fill('New Title');
    await expect(slugField).toHaveValue('custom-slug'); // Still custom
    
    // Click regenerate button
    await page.getByText('Generate from title').click();
    
    // Slug should now reflect new title
    await expect(slugField).toHaveValue('new-title');
    
    // And auto-generation should resume
    await titleField.fill('Newest Title');
    await expect(slugField).toHaveValue('newest-title');
  });
  
  test('should NOT auto-generate slug when editing existing content', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Create content first
    await page.goto('/admin/content?action=new&collection=col-blog_posts-xxx');
    await page.locator('input[name="title"]').fill('Original Post');
    await page.locator('input[name="slug"]').fill('original-post');
    await page.getByRole('button', { name: 'Save Draft' }).click();
    await page.waitForURL(/\/admin\/content\?/);
    
    // Edit the content
    await page.getByText('Original Post').first().click();
    const titleField = page.locator('input[name="title"]');
    const slugField = page.locator('input[name="slug"]');
    
    // Verify existing values
    await expect(titleField).toHaveValue('Original Post');
    await expect(slugField).toHaveValue('original-post');
    
    // Change title
    await titleField.clear();
    await titleField.fill('Updated Post Title');
    
    // Slug should NOT change (edit mode)
    await expect(slugField).toHaveValue('original-post');
  });
});
```

---

## 📦 Deliverables

### 1. Code Changes
- [ ] Fix auto-slug bug in `dynamic-field.template.ts`
- [ ] Enhance "Regenerate" button UI
- [ ] Add visual feedback for auto-generation
- [ ] Rebuild `packages/core/dist`

### 2. Testing
- [ ] Add 4 E2E tests to `tests/e2e/05-content.spec.ts`
- [ ] Verify all tests pass locally (`npm run e2e`)
- [ ] Verify tests pass in CI

### 3. Documentation
- [ ] Update `SONICJS_FIELD_TYPES_REFERENCE.md` with auto-slug behavior under "slug" field type
- [ ] Add note in `CHANGELOG.md`

### 4. PR Creation
- [ ] Create feature branch: `fix/auto-slug-generation-#323-#329`
- [ ] Commit with message:
  ```
  fix: auto-generate slug from title in real-time
  
  Fixes #323, #329
  
  - Fixed bug where auto-generation stopped after first character
  - Added manual override detection with slugWasManuallyEdited flag
  - Auto-generation stops when user manually edits slug field
  - Clicking "Regenerate from title" button re-enables auto-generation
  - In edit mode, slug is never auto-updated (preserves existing URLs)
  - Added 4 comprehensive E2E tests covering all scenarios
  
  Breaking Change: None
  
  Generated with Claude Code
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- [ ] Push to fork
- [ ] Create PR to upstream with test results

---

## ⚠️ Edge Cases & Considerations

### 1. **Duplicate Slugs**
- Backend already validates unique slugs per collection (line 69-76 in `api-content-crud.ts`)
- No changes needed - server returns 409 error on duplicate

### 2. **Special Characters**
- Already handled correctly by `generateSlugFromTitle()` (line 344-349)
- Regex removes everything except `[a-z0-9\s_-]`

### 3. **Empty Title**
- If title is deleted, slug should be preserved (already happens with manual edit flag)

### 4. **Unicode/Emoji in Titles**
- Current regex strips them: `"Hello 🚀 World"` → `"hello-world"`
- **Enhancement for future**: Consider using a library like `slugify` for better Unicode handling

### 5. **Very Long Titles**
- No length limit on slug field currently
- **Consider**: Add `maxLength` validation (e.g., 200 chars) for URL compatibility

---

## 🚀 Effort Estimate
- **Code Fix**: 30 minutes
- **UI Enhancement**: 15 minutes
- **E2E Tests**: 45 minutes
- **Documentation**: 15 minutes
- **Testing & PR**: 30 minutes
- **Total**: ~2.5 hours

---

## 🎯 Success Criteria
1. ✅ Typing in title field continuously updates slug in real-time
2. ✅ Manually editing slug stops auto-generation
3. ✅ Clicking "Regenerate from title" button re-enables auto-generation
4. ✅ Editing existing content does NOT auto-update slug
5. ✅ All 4 E2E tests pass locally and in CI
6. ✅ No regression in existing content creation workflow

---

## 📌 Notes
- This is a **critical UX issue** affecting content creators on every new post
- The fix is **simple** (one logic bug) with high impact
- Should be prioritized as it improves daily workflow significantly
- Once fixed, close both #323 and #329 as duplicates
