# Choices.js - Form.io's Select Dropdown Library
**URL:** https://github.com/Choices-js/Choices  
**Usage in Form.io:** https://formio.github.io/formio.js/app/examples/select.html  
**License:** MIT  
**Stars:** 6.7k ⭐

---

## What is Choices.js?

A vanilla, lightweight (~20kb gzipped), configurable select box/text input plugin that Form.io uses for all dropdown/select fields.

**Key Features:**
- ✅ No jQuery dependency
- ✅ Lightweight (~20kb gzipped)
- ✅ Configurable sorting
- ✅ Flexible styling
- ✅ Fast search/filtering
- ✅ Clean API
- ✅ Right-to-left support
- ✅ Custom templates

---

## Why Form.io Uses Choices.js

Form.io integrates Choices.js for all select controls, giving you:
- Single select dropdowns
- Multi-select dropdowns
- Searchable dropdowns
- Remote data loading
- Lazy loading
- Infinite scroll
- Custom templates
- HTML5 fallback option

---

## Form.io Select Examples

From https://formio.github.io/formio.js/app/examples/select.html

### 1. Single Select
```javascript
{
  type: "select",
  label: "Single Select",
  key: "single",
  placeholder: "Select one",
  data: {
    values: [
      {value: 'apple', label: 'Apple'},
      {value: 'banana', label: 'Banana'},
      {value: 'pear', label: 'Pear'},
      {value: 'orange', label: 'Orange'}
    ]
  },
  dataSrc: "values",
  defaultValue: 'banana',
  template: "<span>{{ item.label }}</span>"
}
```

### 2. Multi-Select
```javascript
{
  type: "select",
  label: "Favorite Things",
  key: "favoriteThings",
  placeholder: "These are a few of your favorite things...",
  data: {
    values: [
      {value: "raindropsOnRoses", label: "Raindrops on roses"},
      {value: "whiskersOnKittens", label: "Whiskers on Kittens"}
    ]
  },
  multiple: true
}
```

### 3. External Source (URL)
```javascript
{
  type: 'select',
  label: 'Model',
  dataSrc: 'url',
  data: {
    url: 'https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/honda?format=json'
  },
  valueProperty: 'Model_Name',
  template: '<span>{{ item.Model_Name }}</span>',
  selectValues: 'Results'
}
```

### 4. Lazy Loading
```javascript
{
  type: 'select',
  label: 'Model',
  dataSrc: 'url',
  lazyLoad: true,  // Only loads when clicked
  data: {
    url: 'https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/honda?format=json'
  },
  valueProperty: 'Model_Name',
  template: '<span>{{ item.Model_Name }}</span>'
}
```

### 5. Infinite Scroll
```javascript
{
  type: 'select',
  label: 'Companies',
  dataSrc: 'url',
  data: {
    url: 'https://example.form.io/company/submission?limit={{ limit }}&skip={{ skip }}'
  },
  limit: 10,
  lazyLoad: true,
  searchField: 'data.name__regex'
}
```

### 6. HTML5 Widget (Non-Choices.js)
```javascript
{
  type: "select",
  widget: 'html5',  // Use native HTML select
  data: {
    values: [
      {value: 'apple', label: 'Apple'},
      {value: 'banana', label: 'Banana'}
    ]
  }
}
```

---

## Choices.js Features

### Configuration Options

**Core Options:**
- `items` - Pre-selected items
- `choices` - Available options
- `maxItemCount` - Limit selections (-1 = unlimited)
- `addItems` - Allow adding items
- `removeItems` - Allow removing items
- `searchEnabled` - Show search input
- `searchFields` - Fields to search
- `placeholder` - Placeholder text

**Performance Options:**
- `renderChoiceLimit` - Max choices to render (-1 = unlimited)
- `searchResultLimit` - Max search results
- `searchFloor` - Min search length
- `shouldSort` - Sort choices alphabetically
- `resetScrollPosition` - Reset scroll on add

**Styling Options:**
- `classNames` - Custom CSS classes
- `position` - Dropdown position ('auto', 'top', 'bottom')
- Custom CSS properties (v11.2+)

---

## CSS Custom Properties (Dark Mode Support)

Choices.js v11.2+ supports CSS custom properties:

```css
:root {
  --choices-primary-color: #005F75;
  --choices-bg-color: #f9f9f9;
  --choices-text-color: #333;
  --choices-keyline-color: #ddd;
  --choices-highlighted-color: #f2f2f2;
  --choices-font-size-lg: 16px;
  --choices-border-radius: 2.5px;
  --choices-z-index: 1;
}

/* Dark mode example */
@media (prefers-color-scheme: dark) {
  :root {
    --choices-primary-color: #38daff;
    --choices-bg-color: #101010;
    --choices-keyline-color: #3b3e40;
    --choices-highlighted-color: #16292d;
  }
}
```

---

## How SonicJS Uses This

### In Form.io Builder
When users drag a "Select" field into our form builder:
- Choices.js automatically handles the UI
- Single vs. multi-select
- Search functionality
- Remote data sources
- Lazy loading
- Custom templates

### In Public Forms
When forms render on the frontend:
- Choices.js renders the dropdown
- Handles user interactions
- Manages validation
- Submits selected values

**We get all of this for free from Form.io!** 🎉

---

## Browser Compatibility

Choices.js requires these features (or polyfills):
- `Array.from`
- `Array.prototype.find`
- `Array.prototype.includes`
- `Symbol`
- `DOMTokenList`
- `Object.assign`
- `CustomEvent`
- `Element.prototype.classList`
- `Element.prototype.closest`
- `Element.prototype.dataset`

**Good news:** Modern browsers (Chrome, Firefox, Safari, Edge) all support these natively!

---

## Installation (If We Self-Host)

If we migrate to self-hosting Form.io:

**Via NPM:**
```bash
npm install choices.js
```

**Via CDN:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css" />
<script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
```

**Direct Usage:**
```javascript
const choices = new Choices(element, {
  searchEnabled: true,
  searchFields: ['label', 'value'],
  shouldSort: true
});
```

---

## Events & Methods

**Events:**
- `addItem` - Item added
- `removeItem` - Item removed
- `choice` - Choice selected
- `search` - User searched
- `showDropdown` - Dropdown opened
- `hideDropdown` - Dropdown closed

**Methods:**
- `setValue(items)` - Set value
- `setChoices(choices)` - Set available choices
- `clearChoices()` - Clear all choices
- `getValue()` - Get current value
- `enable()` / `disable()` - Toggle state
- `destroy()` - Clean up

---

## Why This Matters for SonicJS

### No Additional Work Needed
Form.io's CDN already includes Choices.js, so:
- ✅ All select dropdowns work automatically
- ✅ Search functionality built-in
- ✅ Multi-select support
- ✅ Remote data loading
- ✅ Beautiful UI

### When We Self-Host
If we migrate Form.io to our fork + Cloudflare:
- Choices.js is bundled in Form.io
- Or we can include it separately
- Same functionality, our infrastructure

---

## Testing Checklist

When testing our Form.io integration:
- [ ] Single select dropdown works
- [ ] Multi-select works
- [ ] Search filters choices
- [ ] Default values display correctly
- [ ] Placeholder text shows
- [ ] Can add/remove selections
- [ ] Keyboard navigation works
- [ ] Mobile friendly
- [ ] Dark mode compatible

---

## Related Links

- **Choices.js GitHub:** https://github.com/Choices-js/Choices
- **Choices.js Demo:** https://choices-js.github.io/Choices/
- **Form.io Select Examples:** https://formio.github.io/formio.js/app/examples/select.html
- **Kitchen Sink (all fields):** https://formio.github.io/formio.js/app/examples/kitchen.html
- **Our Integration Plan:** docs/FORMIO_INTEGRATION_PLAN.md

---

## Summary

**Choices.js provides:**
- Professional dropdown UI
- Search & filtering
- Multi-select support
- Remote data loading
- Lightweight & fast
- MIT licensed (free!)

**In SonicJS:**
- Automatically included via Form.io
- No additional setup needed
- Works out of the box
- 40+ field types using it

**Result:** Professional form dropdowns with zero effort! ✨

---

**Added:** January 23, 2026  
**Status:** Documentation reference  
**Used by:** Form.io for all select controls
