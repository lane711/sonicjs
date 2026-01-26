# Multi-Page Wizard Forms in SonicJS

**Status:** ✅ **Fully Available & Open Source!**

Form.io's wizard (multi-page) functionality is 100% open source and built into the core library. No licenses or premium features required!

---

## Quick Start

### Creating a Multi-Page Form

1. **Open Form Builder** (`/admin/forms/<form-id>/builder`)
2. **Toggle Display Type** at the top: Click **"Multi-Page Wizard"** button
3. **Add Panel Components** from the **Layout** tab for each page
4. **Build Your Pages** - drag fields into each Panel
5. **Save** - Your wizard is ready!

---

## How It Works

### Display Types

SonicJS forms support two display types:

| Display Type | Description | Use Case |
|-------------|-------------|----------|
| **Single Page** | Traditional form with all fields visible | Short forms, simple data collection |
| **Multi-Page Wizard** | Step-by-step navigation through pages | Long forms, guided workflows, onboarding |

### Toggle Between Types

At the top of the form builder, you'll see:

```
Display Type:  [Single Page]  [Multi-Page Wizard]
```

Click **Multi-Page Wizard** to enable wizard mode. A helpful hint will appear:

> 💡 Use **Panel** components (Layout tab) for each page

---

## Building a Wizard

### Step 1: Enable Wizard Mode

Click the **Multi-Page Wizard** button in the form builder.

### Step 2: Add Panels for Each Page

From the **Layout** tab in the sidebar, drag **Panel** components into the form canvas. Each Panel becomes a separate page:

```
┌─────────────────────────────┐
│ Panel: Personal Information │  ← Page 1
├─────────────────────────────┤
│ - First Name                │
│ - Last Name                 │
│ - Email                     │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Panel: Contact Details      │  ← Page 2
├─────────────────────────────┤
│ - Phone Number              │
│ - Address                   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Panel: Additional Info      │  ← Page 3
├─────────────────────────────┤
│ - Comments                  │
│ - Preferences               │
└─────────────────────────────┘
```

### Step 3: Configure Panels

Click each Panel's **Edit** button to customize:

- **Title**: Page name shown in wizard navigation
- **Key**: Unique identifier (auto-generated)
- **Conditional Logic**: Show/hide pages based on user input
- **Validation**: Mark as required or add custom validation

### Step 4: Add Fields to Panels

Drag components from the sidebar into each Panel (not outside them!):

- ✅ **Inside Panel** → Field appears on that wizard page
- ❌ **Outside Panel** → Field may not render correctly

### Step 5: Save and Test

1. Click **Save Form**
2. Click **View Public Form** to test the wizard
3. You'll see:
   - **Previous/Next buttons** for navigation
   - **Progress indicator** showing current step
   - **Submit button** on the final page

---

## Wizard Features

### Navigation

Form.io automatically adds:

- **Next Button** - Advances to next page (validates current page first)
- **Previous Button** - Returns to previous page
- **Progress Indicator** - Shows current step (e.g., "Step 2 of 4")
- **Submit Button** - Appears only on the final page

### Validation

**Per-Page Validation:**
- Users can't proceed to the next page until all required fields are filled
- Validation errors display immediately
- Invalid fields highlight in red

**Example:**
```
Page 1: Personal Info
  ✓ First Name (required) ✗ Must fill this!
  ✓ Email (required, email format)

[Next] button disabled until all required fields valid
```

### Conditional Pages

**Show/hide pages based on user input:**

1. Edit a Panel component
2. Go to **Conditional** tab
3. Set conditions:
   - **Show if**: `data.userType === 'business'`
   - **Hide if**: `data.skipSection === true`

**Example Use Case:**
```
Page 1: What type of user are you?
  ○ Individual
  ○ Business

[If "Business" selected]
  → Page 2: Business Information (shown)
  → Page 3: Tax ID (shown)

[If "Individual" selected]
  → Page 2: Business Information (hidden)
  → Page 3: Tax ID (hidden)
  → Page 4: Personal Preferences (shown)
```

---

## Schema Structure

When you create a wizard, Form.io generates this schema structure:

```json
{
  "title": "Registration Form",
  "display": "wizard",  ← Key property!
  "components": [
    {
      "type": "panel",
      "title": "Personal Information",
      "key": "personalInfo",
      "components": [
        {"type": "textfield", "label": "First Name", "key": "firstName"},
        {"type": "email", "label": "Email", "key": "email"}
      ]
    },
    {
      "type": "panel",
      "title": "Contact Details",
      "key": "contactDetails",
      "components": [
        {"type": "phoneNumber", "label": "Phone", "key": "phone"},
        {"type": "address", "label": "Address", "key": "address"}
      ]
    }
  ]
}
```

**Key Points:**
- `display: "wizard"` enables wizard mode
- Each `panel` component becomes a separate page
- Fields inside panels render on that page

---

## Best Practices

### 1. Logical Grouping

Group related fields on the same page:

✅ **Good:**
```
Page 1: Account Setup (Username, Password, Email)
Page 2: Profile (Name, Bio, Avatar)
Page 3: Preferences (Notifications, Privacy)
```

❌ **Bad:**
```
Page 1: Username, Bio, Notifications
Page 2: Password, Avatar
Page 3: Email, Name, Privacy
```

### 2. Progressive Complexity

Start with easy questions, then progress to more complex ones:

✅ **Good:**
```
Page 1: Basic Info (Name, Email)
Page 2: Contact (Phone, Address)
Page 3: Detailed Preferences (10+ checkboxes)
```

### 3. Clear Panel Titles

Use descriptive titles that tell users what to expect:

✅ **Good:**
- "Personal Information"
- "Billing & Payment"
- "Review & Submit"

❌ **Bad:**
- "Page 1"
- "Step 2"
- "Next"

### 4. Optimal Page Count

**Recommended:** 3-7 pages

- Too few (1-2): Just use single-page form
- Too many (10+): Users get fatigued

### 5. Show Progress

Form.io automatically shows progress, but ensure panel titles are clear so users know where they are.

---

## Examples

### Example 1: User Registration

**3-Page Wizard:**

**Page 1: Account**
- Username (text)
- Email (email)
- Password (password)

**Page 2: Profile**
- First Name (text)
- Last Name (text)
- Phone (phone)
- Profile Picture (file)

**Page 3: Preferences**
- Newsletter (checkbox)
- Language (select)
- Timezone (select)

### Example 2: Job Application

**5-Page Wizard:**

**Page 1: Personal Info**
- Name, Email, Phone

**Page 2: Experience**
- Years of Experience (number)
- Current Employer (text)
- Resume (file)

**Page 3: Education**
- Degree (select)
- School (text)
- Graduation Year (number)

**Page 4: Skills**
- Technical Skills (checkboxes)
- Languages (tags)

**Page 5: Review & Submit**
- Summary of all data (HTML component)
- Terms & Conditions (checkbox)

### Example 3: E-Commerce Checkout

**4-Page Wizard:**

**Page 1: Cart Review**
- Order Summary (HTML)

**Page 2: Shipping**
- Address (address)
- Shipping Method (radio)

**Page 3: Payment**
- Card Number (textfield)
- Expiry Date (textfield)
- CVV (textfield)

**Page 4: Confirmation**
- Review & Submit

---

## Technical Details

### Rendering

**Builder:** Uses `Formio.builder()` with `display: 'wizard'` option

**Public Forms:** Uses `Formio.createForm()` - automatically detects wizard mode from schema

**Backend:** No changes needed! Wizard forms submit the same way as single-page forms.

### Submission Data

Wizard forms submit **all pages at once** when the user clicks Submit on the final page:

```json
{
  "data": {
    "firstName": "John",      // From Page 1
    "lastName": "Doe",        // From Page 1
    "email": "john@example.com",  // From Page 1
    "phone": "555-1234",      // From Page 2
    "address": {...}          // From Page 2
  }
}
```

No special handling required on the backend!

### State Management

Form.io handles wizard state automatically:
- **In-memory**: Data persists as user navigates between pages
- **No server calls**: Navigation happens client-side
- **Validation**: Each page validates before allowing Next

---

## Switching Display Types

You can **switch between Single Page and Multi-Page Wizard at any time**:

### From Single Page → Wizard

1. Click **Multi-Page Wizard** button
2. Add Panel components
3. Move existing fields into Panels
4. Save

**Result:** All fields now inside Panels render as wizard pages

### From Wizard → Single Page

1. Click **Single Page** button
2. Save

**Result:** Panels render as collapsible sections (not separate pages)

**Note:** You don't lose your Panel structure! Panels work in both modes:
- **Wizard mode**: Panels = separate pages
- **Single-page mode**: Panels = collapsible sections

---

## Troubleshooting

### Issue: Fields not showing in wizard

**Cause:** Fields are outside Panel components

**Fix:** Ensure all fields are **inside** Panel components

### Issue: "Next" button doesn't work

**Cause:** Required field validation failing

**Fix:** Fill all required fields or check validation rules

### Issue: Pages not appearing

**Cause:** Panels have conditional logic hiding them

**Fix:** Check Panel conditional settings

### Issue: Submit button appears on every page

**Cause:** Not using Panels, or display type is 'form'

**Fix:** 
1. Ensure display type is 'wizard'
2. Use Panel components for pages

---

## Resources

- **Form.io Wizard Docs:** https://formio.github.io/formio.js/app/examples/wizard.html
- **Panel Component:** Layout tab → Panel
- **Conditional Logic:** https://help.form.io/userguide/form-building/conditional-components

---

## Summary

✅ **100% Open Source** - No licenses required  
✅ **Built-in Navigation** - Previous/Next/Submit buttons  
✅ **Per-Page Validation** - Can't proceed until valid  
✅ **Conditional Pages** - Show/hide based on input  
✅ **Easy to Use** - Just toggle display type and add Panels  
✅ **No Backend Changes** - Submits like single-page forms  

**Ready to build?** Open your form builder and click **Multi-Page Wizard**! 🎉
