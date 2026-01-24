# Content Deletion UI Bug Fix - Implementation Plan

## Overview

Fix GitHub Issue #522: "Bug: Deleting a content breaks the UI and throws an error that prevents the table from loading"

When deleting content through Admin > Contents, the UI breaks with a JavaScript error: `"Identifier 'currentBulkAction' has already been declared"`.

## Root Cause Analysis

The bug occurs due to HTMX script re-execution during content deletion:

1. **Delete Flow**: When content is deleted, the backend returns an HTML response with `hx-trigger="load"` that fetches the full content list page
2. **Full Page in Response**: The GET `/admin/content` endpoint returns `renderContentListPage()` which includes the **entire page** including `<script>` tags
3. **Variable Redeclaration**: The script contains `let currentBulkAction = null;` which is already declared in the original page's scope
4. **HTMX Behavior**: HTMX executes `<script>` tags when swapping content, causing the `let` redeclaration error

**Key Files Involved:**
- `packages/core/src/routes/admin-content.ts` - Lines 1347-1359 (delete response) and 272-434 (GET content list)
- `packages/core/src/templates/pages/admin-content-list.template.ts` - Lines 543-544 (variable declaration)
- `packages/core/src/templates/table.template.ts` - Lines 129-232 (also has inline scripts)

## Requirements

- [ ] Delete operation should refresh the content table without causing JavaScript errors
- [ ] Existing bulk action functionality must continue to work
- [ ] No regressions in other admin content operations (create, edit, duplicate, etc.)
- [ ] Solution must work with HTMX's script processing behavior

## Technical Approach

### Solution: Use `var` Instead of `let` for Global Script Variables

The simplest and most targeted fix is to change `let` to `var` for the global script variables. Unlike `let`, `var` allows redeclaration without throwing an error. This is actually a common pattern when working with HTMX-swapped content.

**Alternative Approaches Considered:**

1. **HTMX `hx-script` attribute** - Not applicable, doesn't prevent script execution
2. **Check if variable exists before declaring** - Would require refactoring all function calls
3. **Return partial HTML for HTMX requests** - Would require significant refactoring and might break other functionality
4. **Use `window.` prefix** - More invasive change, but viable alternative

**Chosen Approach**: Use `var` for script-scoped variables that may be re-executed during HTMX swaps. This is:
- Minimal change
- No risk of breaking other functionality
- Standard pattern for HTMX-based applications
- Easy to test and verify

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/core/src/templates/pages/admin-content-list.template.ts` | Modify | Change `let currentBulkAction` and `let currentSelectedIds` to `var` |
| `packages/core/src/templates/table.template.ts` | Modify | Review and fix any similar issues with inline scripts |

### Code Changes

**admin-content-list.template.ts (Line 543-544):**
```diff
- let currentBulkAction = null;
- let currentSelectedIds = [];
+ var currentBulkAction = null;
+ var currentSelectedIds = [];
```

**table.template.ts (Line 131):**
Review `window.sortTable` assignment - this already uses `window.` prefix which is safe.

## Implementation Steps

1. Read and understand the current script implementation
2. Change `let` to `var` for the bulk action state variables
3. Review table.template.ts for similar issues
4. Test the delete functionality manually
5. Run existing unit tests
6. Run existing e2e tests
7. Verify no regressions

## Testing Strategy

### Manual Testing
1. Navigate to Admin > Contents
2. Create new test content
3. Delete the content via the actions menu
4. Verify no JavaScript errors in console
5. Verify table refreshes correctly
6. Test bulk delete with multiple items selected

### Unit Tests
- Verify the template renders correctly with `var` declarations
- No new unit tests needed as this is a fix, not new functionality

### E2E Tests
- Test file: `tests/e2e/` - Check if existing content-related e2e tests cover delete
- Test scenarios:
  - [ ] Single content deletion works without UI errors
  - [ ] Bulk content deletion works without UI errors
  - [ ] Table properly refreshes after deletion

## Risks & Considerations

1. **Risk**: Using `var` instead of `let` changes variable scoping
   - **Mitigation**: These are already global-scoped variables in a page-level script, so functional behavior is unchanged

2. **Risk**: Other templates might have similar issues
   - **Mitigation**: Review table.template.ts and other templates with inline scripts

## Questions for Review

- [ ] Is `var` acceptable for these global script variables, or should we use `window.` prefix instead?
- [ ] Should we add e2e tests specifically for content deletion to prevent regression?

## Approval

- [ ] Plan reviewed and approved by user
