# Form.io Components Configuration Guide

Complete overview of all Form.io components and their configuration requirements in SonicJS.

---

## ✅ Components That Work Out-of-the-Box

These components require **no external configuration**:

### Basic Components
- ✅ **Text Field** - Simple text input
- ✅ **Text Area** - Multi-line text input
- ✅ **Number** - Numeric input with validation
- ✅ **Password** - Masked password input
- ✅ **Checkbox** - Single checkbox or checkbox group
- ✅ **Select Boxes** - Multiple choice checkboxes
- ✅ **Select** - Dropdown selection (single/multi)
- ✅ **Radio** - Radio button group
- ✅ **Button** - Form action buttons
- ✅ **Email** - Email input with validation
- ✅ **URL** - URL input with validation
- ✅ **Phone Number** - Phone input with masking
- ✅ **Tags** - Tag input component
- ✅ **Date/Time** - Date and time pickers
- ✅ **Day** - Day selector
- ✅ **Time** - Time picker
- ✅ **Currency** - Currency input with formatting
- ✅ **Survey** - Survey/rating component
- ✅ **Signature** - Digital signature capture

### Layout Components
- ✅ **HTML Element** - Custom HTML content
- ✅ **Content** - Rich text/HTML display
- ✅ **Columns** - Multi-column layout
- ✅ **Field Set** - Grouped fields
- ✅ **Panel** - Collapsible panel
- ✅ **Table** - Table layout
- ✅ **Tabs** - Tabbed interface
- ✅ **Well** - Visual container

### Data Components
- ✅ **Hidden** - Hidden field
- ✅ **Container** - Data container
- ✅ **Data Map** - Key-value mapping
- ✅ **Data Grid** - Repeatable grid
- ✅ **Edit Grid** - Editable grid

---

## 🔧 Components Requiring Configuration

### 1. ✅ **Address Component** (CONFIGURED)

**Status:** ✅ Working  
**Requires:** Google Maps API key  
**Configuration:** Per-component (stored in `component.map.key`)

**How to Configure:**
1. Drag Address field to form
2. Click to edit → **Provider** tab
3. Paste your Google Maps API key in **Map Settings**
4. Save

**What You Get:**
```json
{
  "formatted_address": "110 N Kenwood Ave, Baltimore, MD 21224, USA",
  "geometry": {
    "location": {"lat": 39.29, "lng": -76.57}
  },
  "address_components": [...]
}
```

**Documentation:** See `/docs/GOOGLE_MAPS_SETUP.md`

---

### 2. ⚠️ **File Component** (NEEDS TESTING)

**Status:** ⚠️ Should work with existing R2 setup, needs testing  
**Requires:** File storage backend  
**Configuration:** SonicJS already has R2 configured in `wrangler.toml`

**Your Setup:**
```toml
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "sonicjs-ci-media"
```

**How to Test:**
1. Drag **File** component from **Premium** tab
2. Configure allowed file types
3. Test upload in public form
4. Check if files appear in R2 bucket

**Expected Behavior:**
- Files upload to your R2 bucket
- File metadata stored in `form_submissions.submission_data`
- File reference stored in `form_files` table

**Implementation Status:**
- ✅ R2 bucket configured
- ✅ Database tables exist (`form_files`)
- ⚠️ May need custom file upload handler for Form.io
- 📋 Testing needed

**Potential Issue:**
Form.io's File component might expect Form.io's cloud storage by default. May need to configure custom file upload URL:

```json
{
  "type": "file",
  "storage": "url",
  "url": "/api/forms/upload",
  "options": {
    "withCredentials": true
  }
}
```

---

### 3. 📝 **reCAPTCHA Component** (OPTIONAL)

**Status:** 📋 Optional - Add if needed for spam protection  
**Requires:** Google reCAPTCHA site key  
**Configuration:** Per-component

**When to Use:**
- Public forms with spam issues
- High-traffic forms
- Registration/signup forms
- Comment/feedback forms

**How to Configure:**
1. Get reCAPTCHA keys from [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Drag **reCAPTCHA** component from **Premium** tab
3. Edit component settings
4. Add your **Site Key** and **Secret Key**
5. Save

**Example Configuration:**
```json
{
  "type": "recaptcha",
  "label": "Are you human?",
  "key": "recaptcha",
  "siteKey": "YOUR_SITE_KEY",
  "secretKey": "YOUR_SECRET_KEY"
}
```

**reCAPTCHA v2 vs v3:**
- **v2:** Shows "I'm not a robot" checkbox
- **v3:** Invisible, runs in background

---

## 💰 Premium Components (Require License)

These components need a **Form.io Enterprise License** ($$$):

### ❌ **Nested Form** Component
- Embed complete forms inside other forms
- Reusable form templates
- **License Required:** Enterprise

### ❌ **Custom** Component
- Create custom React/Angular components
- Advanced UI widgets
- **License Required:** Enterprise

**How to Get License:**
Contact **[email protected]** for pricing

**License Setup:**
```javascript
import { Formio } from '@formio/js';
import premium from '@formio/premium';

Formio.license = 'your-library-license-key';
Formio.use(premium);
```

---

## 🔍 Testing Checklist

Use this checklist to verify all components work:

### Basic Components (No Config Needed)
- [ ] Text Field
- [ ] Text Area
- [ ] Email
- [ ] Number
- [ ] Checkbox
- [ ] Select/Dropdown
- [ ] Radio Buttons
- [ ] Date/Time pickers

### Advanced Components
- [x] **Address** (Google Maps) - ✅ Tested & Working
- [ ] **File Upload** - ⚠️ Needs Testing
- [ ] **Signature** - Should work
- [ ] **Survey** - Should work

### Optional Components
- [ ] **reCAPTCHA** - Not configured (add if needed)

---

## 🚀 Quick Actions

### Test File Upload Component

1. **Add File component to a form:**
   ```
   /admin/forms → Edit form → Premium tab → File
   ```

2. **Configure it:**
   - Allowed file types: `.jpg, .png, .pdf`
   - Max file size: `10MB`
   - Storage: Leave default

3. **Test the form:**
   - Click "View Public Form"
   - Upload a test file
   - Check if it saves

4. **Verify storage:**
   - Check R2 bucket for file
   - Check database for file reference

### Add reCAPTCHA (If Needed)

1. **Get keys:** https://www.google.com/recaptcha/admin
2. **Add to form:** Premium tab → reCAPTCHA
3. **Configure:** Add Site Key and Secret Key
4. **Test:** Submit form and verify validation

---

## 📊 Component Configuration Summary

| Component | Config Needed | Status | Documentation |
|-----------|--------------|--------|---------------|
| Basic Fields | ❌ None | ✅ Working | Built-in |
| Address | ✅ Google Maps API | ✅ Working | `/docs/GOOGLE_MAPS_SETUP.md` |
| File Upload | ⚠️ R2 Storage | ⚠️ Testing Needed | This doc |
| Signature | ❌ None | ✅ Should Work | Built-in |
| reCAPTCHA | ✅ Google Keys | 📋 Optional | This doc |
| Premium (Nested, Custom) | ✅ License | ❌ Not Available | Form.io Enterprise |

---

## 🔗 Resources

- **Form.io Documentation:** https://help.form.io/
- **Form.io Components:** https://help.form.io/userguide/forms/form-components
- **Google Maps API:** https://console.cloud.google.com/apis/credentials
- **Google reCAPTCHA:** https://www.google.com/recaptcha/admin
- **Cloudflare R2:** https://dash.cloudflare.com/r2

---

## 💡 Next Steps

1. ✅ Address component working with Google Maps
2. ⚠️ Test File Upload component
3. 📋 Add reCAPTCHA if spam becomes an issue
4. 💰 Evaluate if premium components are needed

**Need help?** Check the main Form.io documentation or ask for assistance testing the File Upload component.
