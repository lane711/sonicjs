# Add Slug Field Type Support to Collection Field Dropdown

## 📋 Summary

Completes the slug auto-generation feature introduced in PR #518 by adding the missing UI option to create new slug fields in the admin interface and ensuring proper field normalization when loading from the database.

## 🎯 Problem Statement

After PR #518 merged slug auto-generation with duplicate detection:
- ✅ Slug generation logic works perfectly
- ✅ Schema-based collections (like blog posts) can use slug fields
- ❌ **Missing**: Users cannot CREATE new slug fields via the UI dropdown
- ❌ **Missing**: Existing slug fields in database-managed collections don't display correctly

**User Impact**: The slug feature exists but is incomplete - users with database-managed collections (like the default `pages` collection) cannot add slug fields or properly edit existing ones.

## 🔧 Changes

### 1. Add Slug Option to Field Type Dropdown
**File**: `packages/core/src/templates/pages/admin-collections-form.template.ts`
- Added `<option value="slug">URL Slug</option>` to field type dropdown
- Positioned logically after "Text" type
- Now visible when creating/editing collection fields

### 2. Field Type Normalization for Database-Managed Collections
**File**: `packages/core/src/routes/admin-collections.ts`
- Added normalization logic when loading fields from `content_fields` table
- Checks `field_options` JSON for `type: 'slug'` or `format: 'slug'`
- Auto-upgrades legacy fields (named 'slug' with type 'text') to proper slug type
- Ensures consistent display in admin UI

### 3. Proper Field Options When Creating Slug Fields
**File**: `packages/core/src/routes/admin-collections.ts`
- Enhanced field creation endpoint to set proper `field_options` JSON
- Adds `{ type: 'slug', format: 'slug' }` to field_options for slug fields
- Ensures new slug fields work immediately without manual configuration

### 4. Migration for Existing Collections
**File**: `packages/core/migrations/029_fix_slug_field_options.sql`
- Updates existing `pages`, `blog-posts`, and `news` collections
- Sets `field_type = 'slug'` for slug fields
- Adds proper `field_options` JSON with type and format
- Handles both content_fields table and schema-based storage
- Idempotent and safe to run multiple times

## 📊 Technical Details

### Why This Was Needed

PR #518 added excellent backend support for slug auto-generation, but focused on schema-based collections. Database-managed collections (using the `content_fields` table) needed additional handling:

**Schema-based collections** (like blog posts):
```typescript
// Already worked after #518
schema.properties.slug = { type: 'slug', format: 'slug' }
```

**Database-managed collections** (like pages):
```sql
-- Needed normalization when loading from database
SELECT field_type, field_options FROM content_fields WHERE field_name = 'slug'
-- field_type might be 'text', field_options might be empty or missing type info
```

### Architecture

```
User creates field via UI
  ↓
Field type dropdown (NEW: includes 'slug' option)
  ↓
POST /admin/collections/:id/fields
  ↓
If schema exists:
  → Add to schema.properties with type='slug', format='slug' ✅ (from #518)
Else (database-managed):
  → Insert into content_fields with proper field_options ✅ (NEW)
  
Later, when loading collection fields:
  ↓
GET /admin/collections/:id
  ↓
If schema exists:
  → Parse schema and normalize types ✅ (from #518)
Else (database-managed):
  → Load from content_fields and normalize ✅ (NEW)
```

## 🧪 Testing

### Local Testing
```bash
npm run type-check  # ✅ PASSED
npm run build:core  # ✅ SUCCESS
```

### Manual Testing Scenarios

1. **Create New Slug Field**:
   - Navigate to Admin → Collections → Pages
   - Click "Add Field"
   - Select "URL Slug" from dropdown
   - Verify field is created with proper options

2. **Edit Existing Slug Field**:
   - Open existing collection with slug field
   - Verify slug field displays correctly in form
   - Verify field type shows as "URL Slug" in dropdown

3. **Legacy Field Upgrade**:
   - Collection with old text-type slug field
   - Field is auto-detected and displays as slug type
   - Slug auto-generation works correctly

### Migration Testing
```bash
cd my-sonicjs-app
npm run setup:db  # Creates fresh DB with all migrations
# Check that pages collection slug field is properly configured
```

## 🎨 Screenshots

**Before**: 
- Slug option missing from dropdown
- Existing slug fields show as "Text" type

**After**:
- "URL Slug" option visible in dropdown
- Slug fields display correctly with proper type

## ✅ Checklist

- [x] Code follows project conventions
- [x] TypeScript type checking passes
- [x] Build completes successfully
- [x] Migration script is idempotent and safe
- [x] Handles both schema-based and database-managed collections
- [x] Backward compatible with existing installations
- [x] No breaking changes to API or database structure
- [x] Documentation inline (clear comments in migration)

## 🔗 Related

- Complements #518 (slug auto-generation and duplicate detection)
- Builds on existing slug functionality
- Enables full slug feature for all collection types

## 📝 Notes for Reviewers

### Key Files to Review

1. **Template**: Only change is adding one dropdown option
2. **Routes**: Two main additions:
   - Normalization when loading from database (lines ~445-475)
   - Field options when creating new field (lines ~740-755)
3. **Migration**: Comprehensive but safe - uses COALESCE and WHERE clauses to prevent issues

### Why Two Storage Paths?

SonicJS supports two ways to define collection fields:

1. **Schema-based** (preferred): Fields defined in `collections.schema` JSON
2. **Database-managed** (legacy): Fields stored in `content_fields` table

This PR ensures slug fields work correctly in **both** paths.

### Migration Safety

Migration 029 is designed to be safe:
- Uses `COALESCE(field_options, '{}')` to handle NULL values
- WHERE clause prevents updating already-correct fields
- `json_set` only adds missing properties
- Targets specific well-known collections

---

## 🚀 Impact

With this PR:
- ✅ Users can create slug fields for any collection (schema or database-managed)
- ✅ Existing slug fields display correctly in admin UI
- ✅ Slug auto-generation works on all collection types
- ✅ Complete and consistent slug field support across the platform

This completes the slug feature implementation started in #518.
