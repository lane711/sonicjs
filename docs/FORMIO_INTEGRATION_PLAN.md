# Form.io Integration Plan - SonicJS
**Date:** January 23, 2026  
**Status:** Phase 2 Complete, Phase 3 Next  
**Fork:** https://github.com/mmcintosh/formio.js-sonic

---

## 📋 Overview

Integrate Form.io's powerful visual form builder into SonicJS to provide:
- Drag & drop form building
- 40+ field types
- Conditional logic
- Advanced validation
- Layout components
- Form submissions tracking

---

## 🏗️ Architecture

### Database Schema (Phase 1) ✅
Three tables for form management:

```sql
forms              -- Form definitions and schemas
form_submissions   -- User submissions
form_files         -- File uploads linked to submissions
```

### Form.io Client Library Strategy

#### Current: Form.io Official CDN (Phase 2-3)
```html
<!-- Using Form.io's hosted CDN for development -->
<link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css">
<script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
```

**Pros:**
- ✅ Zero setup, works immediately
- ✅ Fast development iteration
- ✅ Browser caching across sites
- ✅ No build process needed

**Cons:**
- ❌ External dependency on Form.io infrastructure
- ❌ No customization control
- ❌ Version updates controlled by Form.io

#### Future: SonicJS Fork + Cloudflare CDN (Phase 4)

**Our Fork:** https://github.com/mmcintosh/formio.js-sonic

**Strategy Options:**

##### Option B: Cloudflare R2 + CDN (Recommended for Multi-Site)
```bash
# Setup
1. Build forked formio.js-sonic
2. Upload to R2 bucket: formio-assets
3. Enable R2 public access or custom domain
4. Update template URLs
```

**URL Structure:**
```html
<!-- Served from Cloudflare CDN -->
<link rel="stylesheet" href="https://cdn.sonicjs.com/formio/v1.0.0/formio.full.min.css">
<script src="https://cdn.sonicjs.com/formio/v1.0.0/formio.full.min.js"></script>
```

**Pros:**
- ✅ Global CDN (Cloudflare's edge network)
- ✅ Free bandwidth for R2 + CDN
- ✅ Custom domain support
- ✅ Version control in URL
- ✅ Shared across multiple SonicJS instances
- ✅ Full control over updates

**Cons:**
- Need to manage R2 bucket
- Must rebuild on fork updates

##### Option C: Workers Public Directory (Recommended for Single Site)
```bash
# Setup
1. Build forked formio.js-sonic  
2. Copy dist files to my-sonicjs-app/public/formio/
3. Update template to use /public/formio/...
```

**URL Structure:**
```html
<!-- Served directly from Workers -->
<link rel="stylesheet" href="/public/formio/formio.full.min.css">
<script src="/public/formio/formio.full.min.js"></script>
```

**Pros:**
- ✅ No external dependencies
- ✅ Bundled with app deployment
- ✅ Cloudflare Workers edge caching
- ✅ Simplest setup
- ✅ Works offline (for Workers dev)

**Cons:**
- Larger deployment size (~850KB)
- Separate copy per SonicJS instance

**Decision Point:** Choose in Phase 4 based on:
- Single site → Option C (Workers bundle)
- Multiple sites → Option B (R2 + CDN)
- Enterprise/customization → Option B with custom build

---

## 📅 Implementation Phases

### Phase 1: Database Schema ✅ COMPLETE
**Status:** Done  
**Commit:** 890d7d34

- [x] Create migration `029_add_forms_system.sql`
- [x] Add Drizzle schema definitions
- [x] Bundle migrations
- [x] TypeScript types generated

**Files:**
- `packages/core/migrations/029_add_forms_system.sql`
- `packages/core/src/db/schema.ts` (forms, formSubmissions, formFiles)
- `packages/core/src/db/migrations-bundle.ts`

---

### Phase 2: Admin UI ✅ MOSTLY COMPLETE
**Status:** Done (except nav menu)  
**Commit:** a172b43c

#### Routes (`admin-forms.ts`)
- [x] GET `/admin/forms` - List all forms
- [x] GET `/admin/forms/new` - Create form page
- [x] POST `/admin/forms` - Create new form
- [x] GET `/admin/forms/:id/builder` - Form builder
- [x] PUT `/admin/forms/:id` - Save form schema
- [x] DELETE `/admin/forms/:id` - Delete form

#### Templates
- [x] Forms List (`admin-forms-list.template.ts`)
  - Stats cards (Total, Active, Submissions)
  - Category filtering
  - Search functionality
  - Sortable table
  
- [x] Form Create (`admin-forms-create.template.ts`)
  - Clean form interface
  - Auto-slug generation
  - Validation
  
- [x] Form Builder (`admin-forms-builder.template.ts`) ⭐
  - Form.io visual builder integration
  - Drag & drop interface
  - Live preview modal
  - Auto-save with change detection
  - Loading states

#### Integration
- [x] Export from routes index
- [x] Mount in main app
- [x] TypeScript types
- [x] Build successful

#### Remaining
- [ ] Add "Forms" to admin navigation menu

**Files:**
- `packages/core/src/routes/admin-forms.ts`
- `packages/core/src/templates/pages/admin-forms-list.template.ts`
- `packages/core/src/templates/pages/admin-forms-create.template.ts`
- `packages/core/src/templates/pages/admin-forms-builder.template.ts`

---

### Phase 3: Public Form Rendering & Submissions
**Status:** Next (1-2 hours)  
**Priority:** High

#### Public API Endpoints
- [ ] GET `/api/forms/:name` - Get form schema
- [ ] POST `/api/forms/:name/submit` - Submit form
- [ ] GET `/api/forms/:name/submissions` - List submissions (admin only)
- [ ] GET `/api/forms/:name/submissions/:id` - Get submission

#### Frontend Integration
- [ ] Astro `FormioForm.astro` component
  - Render form from schema
  - Handle submissions
  - Success/error states
  - File upload support

#### Submissions Viewer (Admin)
- [ ] Admin route `/admin/forms/:id/submissions`
- [ ] Submissions list template
- [ ] View individual submission
- [ ] Export to CSV
- [ ] Mark as spam/archive

**Files to Create:**
- `packages/core/src/routes/api-forms.ts`
- `www/src/components/FormioForm.astro`
- `packages/core/src/templates/pages/admin-forms-submissions.template.ts`

---

### Phase 4: Advanced Features & CDN Migration
**Status:** Future  
**Priority:** Medium

#### Form.io CDN Migration 🎯
- [ ] Build fork: https://github.com/mmcintosh/formio.js-sonic
- [ ] **Decision:** Choose Option B (R2+CDN) or C (Workers bundle)
- [ ] If Option B:
  - [ ] Create R2 bucket `formio-assets`
  - [ ] Upload built files
  - [ ] Configure custom domain or public URL
  - [ ] Update builder template URLs
- [ ] If Option C:
  - [ ] Copy built files to `my-sonicjs-app/public/formio/`
  - [ ] Update builder template to use `/public/formio/`
  - [ ] Test bundled deployment

#### Email Notifications
- [ ] Form submission emails
- [ ] Admin notification on submit
- [ ] Custom email templates
- [ ] Conditional notifications

#### Webhooks
- [ ] Configure webhook URLs per form
- [ ] POST submission data to webhook
- [ ] Retry logic
- [ ] Webhook logs

#### Export Features
- [ ] CSV export of submissions
- [ ] PDF export of individual submission
- [ ] Bulk export

#### Security & Validation
- [ ] Rate limiting on submissions
- [ ] CAPTCHA/Turnstile integration
- [ ] Spam detection
- [ ] IP blocking
- [ ] Honeypot fields

#### Advanced Form Features
- [ ] Multi-page forms
- [ ] Save & resume later
- [ ] File upload to R2
- [ ] Payment integration (Stripe)
- [ ] Conditional email routing

---

## 🎯 Success Metrics

- [ ] Create form in under 2 minutes
- [ ] Build complete contact form in 5 minutes
- [ ] Handle 1,000+ submissions per form
- [ ] < 1 second form render time
- [ ] Zero external dependencies (after Phase 4 CDN migration)

---

## 🧪 Testing Strategy

### Unit Tests
- Form CRUD operations
- Schema validation
- Submission handling
- File upload logic

### E2E Tests (Playwright)
- Create new form
- Use form builder (drag field)
- Save form
- Render public form
- Submit form
- View submissions in admin

### Load Tests
- 100 concurrent form submissions
- Large forms (50+ fields)
- File uploads (10MB files)

---

## 📚 Documentation

### User Documentation
- [ ] How to create a form
- [ ] Form builder guide
- [ ] Embedding forms in pages
- [ ] Managing submissions

### Developer Documentation
- [ ] Form schema reference
- [ ] API endpoints
- [ ] Custom field types
- [ ] Webhooks integration
- [ ] CDN hosting guide (Phase 4)

---

## 🔗 References

- **Form.io Official:** https://form.io
- **Form.io Docs:** https://help.form.io
- **Our Fork:** https://github.com/mmcintosh/formio.js-sonic
- **Form.io GitHub:** https://github.com/formio/formio.js
- **CodePen Example:** https://codepen.io/travist/full/xVyMjo/
- **Our Docs:**
  - `docs/FORMIO_PHASE1_COMPLETE.md`
  - `docs/FORMIO_PHASE2_PROGRESS.md`
  - `docs/FORMIO_CODEPEN_REFERENCE.md`

---

## 📝 Notes

### Why Form.io?
- MIT licensed (free, open source)
- Battle-tested (used by thousands)
- Rich feature set (40+ field types)
- Active development
- No backend required (client-side)
- Perfect for Cloudflare Workers

### Why Fork?
- Future customization control
- Custom branding potential
- Version stability
- Security control
- Can contribute improvements back

### CDN Strategy Timeline
- **Phase 2-3:** Use Form.io CDN (fast development)
- **Phase 4:** Migrate to our fork + Cloudflare
- **Result:** Zero external dependencies in production

---

**Current Status:** Phase 2 ~95% complete (just nav menu)  
**Next Step:** Add to navigation, then start Phase 3  
**Branch:** `feature/formio-integration`  
**Estimated Completion:** Phase 3 by end of week
