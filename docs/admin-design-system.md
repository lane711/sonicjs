# SonicJS AI Admin Design System Specification

## Overview

This document defines the comprehensive design system for SonicJS AI admin interfaces based on the Catalyst UI Kit design principles. All admin screens must follow these specifications to ensure visual consistency and maintainability.

## Design Philosophy

The admin interface uses a **clean, professional** design pattern inspired by Catalyst UI Kit, emphasizing clarity, simplicity, and accessibility with a modern zinc-based color palette.

### Core Principles
- **Clarity and simplicity**: Clean interfaces with clear hierarchy
- **Professional aesthetic**: Minimal, refined design language
- **Consistent spacing**: Predictable rhythm improves usability
- **Smooth interactions**: Transitions enhance perceived performance
- **Dark mode support**: Built-in support for light and dark themes

## Color Palette

### Primary Colors (Zinc Scale)
```css
/* Light mode */
text-zinc-950       /* Primary text */
text-zinc-500       /* Secondary text */
text-zinc-400       /* Tertiary text/placeholders */
bg-white            /* Main backgrounds */
bg-zinc-50          /* Subtle backgrounds */
bg-zinc-100         /* Hover states */

/* Dark mode */
dark:text-white     /* Primary text */
dark:text-zinc-400  /* Secondary text */
dark:text-zinc-500  /* Tertiary text/placeholders */
dark:bg-zinc-900    /* Main backgrounds */
dark:bg-zinc-800    /* Subtle backgrounds */
dark:bg-zinc-700    /* Hover states */
```

### Semantic Colors
```css
/* Success */
bg-green-50 dark:bg-green-500/10
text-green-700 dark:text-green-400
ring-green-600/20 dark:ring-green-500/20

/* Error */
bg-red-50 dark:bg-red-500/10
text-red-700 dark:text-red-400
ring-red-600/20 dark:ring-red-500/20

/* Warning */
bg-amber-50 dark:bg-amber-500/10
text-amber-700 dark:text-amber-400
ring-amber-600/20 dark:ring-amber-500/20

/* Info */
bg-blue-50 dark:bg-blue-500/10
text-blue-700 dark:text-blue-400
ring-blue-600/20 dark:ring-blue-500/20
```

### Border & Ring Colors
```css
/* Light mode */
ring-1 ring-zinc-950/5        /* Subtle borders */
ring-1 ring-zinc-950/10       /* Standard borders */

/* Dark mode */
dark:ring-white/5             /* Subtle borders */
dark:ring-white/10            /* Standard borders */
```

## Typography

### Font Hierarchy
1. **Page Titles**: `text-2xl font-semibold text-zinc-950 dark:text-white`
2. **Section Headings**: `text-xl font-semibold text-zinc-950 dark:text-white`
3. **Subsection Headings**: `text-base font-semibold text-zinc-950 dark:text-white`
4. **Body Text**: `text-sm text-zinc-950 dark:text-white`
5. **Secondary Text**: `text-sm text-zinc-500 dark:text-zinc-400`
6. **Small Text**: `text-xs text-zinc-500 dark:text-zinc-400`

### Font Weights
- **Semibold**: 600 (headings, buttons)
- **Medium**: 500 (labels, emphasis)
- **Regular**: 400 (body text)

## Spacing System

### Base Unit: 0.25rem (4px)
```css
/* Common spacing values */
space-y-8     /* 32px - Between major sections */
space-y-6     /* 24px - Between form sections */
space-y-4     /* 16px - Between form fields */
gap-x-3       /* 12px - Horizontal gaps */
p-8           /* 32px - Large container padding */
p-6           /* 24px - Medium container padding */
p-4           /* 16px - Small container padding */
```

## Component Specifications

### Containers

#### Primary Container
```html
<div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8">
  <!-- Content -->
</div>
```

#### Card Container
```html
<div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
  <!-- Content -->
</div>
```

### Buttons

#### Primary Button
```html
<button class="rounded-lg bg-zinc-950 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
  Button Text
</button>
```

#### Primary Button with Icon
```html
<button class="inline-flex items-center gap-x-2 rounded-lg bg-zinc-950 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Icon path -->
  </svg>
  Button Text
</button>
```

#### Secondary Button
```html
<button class="rounded-lg bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
  Button Text
</button>
```

#### Danger Button
```html
<button class="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
  Delete
</button>
```

#### Link Button
```html
<button class="text-sm font-semibold text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
  Learn more →
</button>
```

### Forms

#### Text Input
```html
<div>
  <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
    Label Text
  </label>
  <input
    type="text"
    placeholder="Enter text..."
    class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
  />
</div>
```

#### Select Dropdown
```html
<div>
  <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
    Label Text
  </label>
  <select class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow">
    <option value="">Choose an option</option>
  </select>
</div>
```

#### Textarea
```html
<div>
  <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
    Label Text
  </label>
  <textarea
    rows="3"
    placeholder="Enter description..."
    class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
  ></textarea>
</div>
```

#### Checkbox
```html
<div class="flex items-center gap-x-2">
  <input
    type="checkbox"
    id="checkbox-id"
    class="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white focus:ring-offset-0"
  />
  <label for="checkbox-id" class="text-sm text-zinc-950 dark:text-white">
    Checkbox label
  </label>
</div>
```

#### Radio Button
```html
<div class="flex items-center gap-x-2">
  <input
    type="radio"
    id="radio-id"
    name="radio-group"
    class="h-4 w-4 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white focus:ring-offset-0"
  />
  <label for="radio-id" class="text-sm text-zinc-950 dark:text-white">
    Radio label
  </label>
</div>
```

### Tables

#### Table Container
```html
<div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 overflow-hidden">
  <table class="min-w-full divide-y divide-zinc-950/5 dark:divide-white/5">
    <thead class="bg-zinc-50 dark:bg-zinc-800/50">
      <tr>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Column Name
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-zinc-950/5 dark:divide-white/5">
      <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-950 dark:text-white">
          Cell Content
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges

#### Status Badges
```html
<!-- Success -->
<span class="inline-flex items-center rounded-md bg-green-50 dark:bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">
  Published
</span>

<!-- Warning -->
<span class="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/20">
  Draft
</span>

<!-- Error -->
<span class="inline-flex items-center rounded-md bg-red-50 dark:bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20">
  Failed
</span>

<!-- Default -->
<span class="inline-flex items-center rounded-md bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/10 dark:ring-zinc-400/20">
  Default
</span>
```

### Alerts and Notifications

#### Success Alert
```html
<div class="rounded-lg bg-green-50 dark:bg-green-500/10 p-4 ring-1 ring-green-600/20 dark:ring-green-500/20">
  <div class="flex items-start gap-x-3">
    <svg class="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <div>
      <h3 class="text-sm font-semibold text-green-900 dark:text-green-300">Success</h3>
      <p class="mt-1 text-sm text-green-700 dark:text-green-400">Your changes have been saved successfully.</p>
    </div>
  </div>
</div>
```

#### Error Alert
```html
<div class="rounded-lg bg-red-50 dark:bg-red-500/10 p-4 ring-1 ring-red-600/20 dark:ring-red-500/20">
  <div class="flex items-start gap-x-3">
    <svg class="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <div>
      <h3 class="text-sm font-semibold text-red-900 dark:text-red-300">Error</h3>
      <p class="mt-1 text-sm text-red-700 dark:text-red-400">There was a problem with your request.</p>
    </div>
  </div>
</div>
```

#### Warning Alert
```html
<div class="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-4 ring-1 ring-amber-600/20 dark:ring-amber-500/20">
  <div class="flex items-start gap-x-3">
    <svg class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.632 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
    </svg>
    <div>
      <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-300">Warning</h3>
      <p class="mt-1 text-sm text-amber-700 dark:text-amber-400">Please review your changes before continuing.</p>
    </div>
  </div>
</div>
```

#### Info Alert
```html
<div class="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-4 ring-1 ring-blue-600/20 dark:ring-blue-500/20">
  <div class="flex items-start gap-x-3">
    <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <div>
      <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-300">Information</h3>
      <p class="mt-1 text-sm text-blue-700 dark:text-blue-400">Here's some helpful information about this feature.</p>
    </div>
  </div>
</div>
```

### Cards

#### Basic Card
```html
<div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
  <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-2">Card Title</h3>
  <p class="text-sm text-zinc-500 dark:text-zinc-400">Card content</p>
</div>
```

#### Interactive Card
```html
<div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 hover:shadow-md hover:ring-zinc-950/10 dark:hover:ring-white/20 transition-all cursor-pointer">
  <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-2">Card Title</h3>
  <p class="text-sm text-zinc-500 dark:text-zinc-400">Card content</p>
</div>
```

#### Card with Icon
```html
<div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
  <div class="flex items-center gap-x-3 mb-3">
    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 dark:bg-white">
      <svg class="h-5 w-5 text-white dark:text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <!-- Icon path -->
      </svg>
    </div>
    <h3 class="text-base font-semibold text-zinc-950 dark:text-white">Card Title</h3>
  </div>
  <p class="text-sm text-zinc-500 dark:text-zinc-400">Card content</p>
</div>
```

## Interaction Patterns

### Hover States
- **Buttons**: Darken background color by one shade
- **Links**: Change from `text-zinc-950` to `text-zinc-600` (light) or `text-white` to `text-zinc-300` (dark)
- **Cards**: Increase shadow and ring opacity
- **Table rows**: Subtle background change with `hover:bg-zinc-50 dark:hover:bg-zinc-800/50`

### Focus States
- **Inputs**: Show 2px ring with `focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white`
- **Buttons**: Use browser default focus styles
- **Links**: Use `focus:outline-none focus:ring-2`

### Transitions
- **Default**: `transition-colors` for color-only changes
- **Complex**: `transition-all` for multiple property changes
- **Shadow**: `transition-shadow` for shadow-only changes
- **Duration**: Default 150ms (Tailwind default)

## Responsive Design

### Breakpoints
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (640px+)
- **Desktop**: `md:` (768px+)
- **Large**: `lg:` (1024px+)

### Mobile Adaptations
- Stack horizontal layouts vertically
- Reduce padding on mobile
- Full-width buttons on mobile
- Simplified navigation

## Accessibility Guidelines

### Color Contrast
- Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Test in both light and dark modes
- Use semantic colors appropriately

### Interactive Elements
- Minimum touch target: 44x44px
- Clear focus indicators
- Keyboard navigation support
- ARIA labels for icons and interactive elements

### Motion
- Respect `prefers-reduced-motion`
- Keep transitions under 300ms
- Provide alternatives to animated content

## Dark Mode Implementation

All components must support both light and dark modes using Tailwind's `dark:` prefix:

```html
<!-- Example with dark mode support -->
<div class="bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white">
  Content
</div>
```

## Maintenance Notes

1. **Consistency**: Always use the predefined classes and patterns
2. **Dark Mode**: Test all components in both light and dark modes
3. **Accessibility**: Verify keyboard navigation and screen reader support
4. **Updates**: Document any new patterns in this specification
5. **Reviews**: Regular design audits to ensure adherence

## Migration from Glass Morphism

If migrating from the previous glass morphism design:

1. Replace `backdrop-blur-xl bg-white/10` with `bg-white dark:bg-zinc-900`
2. Replace gradient colors with solid zinc colors
3. Update border styles from `border-white/20` to `ring-1 ring-zinc-950/5 dark:ring-white/10`
4. Update text colors to use zinc scale
5. Add dark mode variants to all components

---

**Last Updated**: January 2025
**Version**: 2.0.0 (Catalyst-inspired)
**Maintained By**: SonicJS AI Development Team
