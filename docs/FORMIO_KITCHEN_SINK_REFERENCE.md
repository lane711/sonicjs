# Form.io Kitchen Sink Example
**URL:** https://formio.github.io/formio.js/app/examples/kitchen.html  
**Purpose:** Comprehensive example showing ALL form.io field types and configurations

---

## What is the Kitchen Sink?

A "kitchen sink" example means **everything included** - all possible field types, configurations, and features in one massive demo form.

---

## Available Examples on Form.io

The Form.io documentation site has many examples:

### Basic Examples
- **Simple Embedding** - Basic form render
- **JSFiddle** - Interactive playground
- **Hosted Forms** - Using Form.io backend
- **Submission Hosting** - Store submissions on Form.io

### Form Types
- **Wizards** - Multi-step forms
- **Conditional Wizards** - Dynamic step navigation
- **PDF Forms** - Fillable PDFs
- **Multi-Language Forms** - i18n support

### Field Examples
- **Select Dropdowns** - Various dropdown configs
- **Data Grid Input** - Repeatable row inputs
- **Edit Grid** - Inline editable tables
- **Data Grid Panels** - Complex nested grids
- **WYSIWYG Editor** - Rich text editing
- **reCAPTCHA component** - Bot protection

### Advanced Features
- **Conditional Forms** - Show/hide based on values
- **Field Logic** - Dynamic calculations
- **Calculated Values** - Auto-computed fields
- **External Sources** - Populate from APIs
- **External Data Load** - Pre-fill from external data
- **Custom Components** - Build your own fields
- **Custom Form Builder** - Customize builder UI
- **Save as Draft** - Resume later functionality
- **Lazy Loading** - Performance optimization
- **Floating Labels** - Modern UI pattern
- **No Eval** - Secure mode without eval()

---

## Kitchen Sink Features

The Kitchen Sink example demonstrates:

### All Field Types
- Text fields (various masks)
- Number fields
- Email
- Phone
- Date/Time
- Select (dropdown)
- Radio buttons
- Checkboxes
- Textarea
- WYSIWYG
- File upload
- Signature
- Hidden fields
- Button
- HTML
- Content
- Columns
- Tabs
- Panels
- Wells
- Tables
- Data grids

### Validation Examples
- Required fields
- Min/max length
- Pattern matching (regex)
- Custom validation
- Conditional validation

### Layout Components
- Columns
- Tabs
- Panels
- Wells
- Tables
- Fieldsets

### Advanced Features
- Conditional logic
- Calculated values
- Default values
- Custom CSS classes
- Tooltips
- Descriptions
- API integration
- Prefilled data

---

## How to Use This Reference

### For Development
1. Visit the Kitchen Sink page
2. Fill out the form to see all field types
3. Right-click → View Source to see implementation
4. Copy field configurations for your forms

### For Testing
- Use to verify all field types work in SonicJS
- Test form builder has all components
- Ensure styling matches across all field types
- Validate submissions for complex forms

### For Documentation
- Screenshot examples for user guides
- Reference field configurations
- Show capabilities to users
- Training material

---

## Key Takeaways for SonicJS

### What We Get from Form.io
✅ All these field types work out of the box  
✅ No need to build custom components  
✅ Professional validation  
✅ Layout components included  
✅ Mobile responsive  
✅ Accessible (WCAG compliant)

### Testing Checklist
Once our integration is complete, test:
- [ ] All basic fields render correctly
- [ ] Validation works
- [ ] Layout components display properly
- [ ] Conditional logic functions
- [ ] File uploads work with R2
- [ ] Submissions save to database
- [ ] Mobile responsive
- [ ] Dark mode compatible (our theme)

---

## Live Examples We Can Create

Once Phase 3 is complete, we can build:

1. **Contact Form** (5 fields)
   - Name, Email, Subject, Message, Submit

2. **Survey Form** (15 fields)
   - Multiple choice, ratings, text areas

3. **Registration Form** (20 fields)
   - Personal info, address, preferences

4. **Kitchen Sink Clone** (50+ fields)
   - Everything - test all features

---

## Related Resources

- **Kitchen Sink:** https://formio.github.io/formio.js/app/examples/kitchen.html
- **All Examples:** https://formio.github.io/formio.js/app/examples/
- **Form Builder Demo:** https://formio.github.io/formio.js/app/builder
- **CodePen Example:** https://codepen.io/travist/full/xVyMjo/
- **Our Fork:** https://github.com/mmcintosh/formio.js-sonic
- **Form.io Docs:** https://help.form.io

---

## Implementation Notes

### In SonicJS Builder
When users open our form builder (`/admin/forms/:id/builder`), they get:
- All field types from Kitchen Sink
- Drag & drop interface
- Property configuration
- Live preview
- Save to database

### In Public Forms
When forms render (`/forms/:name`), they display:
- Full form with all fields
- Validation
- Submission handling
- Success messages
- Error handling

**Zero additional code needed - Form.io handles it all!** ✨

---

**Added:** January 23, 2026  
**Status:** Reference for Phase 3 testing  
**Purpose:** Comprehensive field type examples
