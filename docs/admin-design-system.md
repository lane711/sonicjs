# SonicJS AI Admin Design System Specification

## Overview

This document defines the comprehensive design system for SonicJS AI admin interfaces. All admin screens must follow these specifications to ensure visual consistency and maintainability.

## Design Philosophy

The admin interface uses a **Glass Morphism** design pattern, creating a modern, sophisticated experience with depth and layering through translucent elements and backdrop blur effects.

### Core Principles
- **Clarity through translucency**: Semi-transparent layers create visual hierarchy
- **Depth and dimension**: Multiple glass layers suggest spatial relationships
- **Consistent spacing**: Predictable rhythm improves usability
- **Smooth interactions**: Transitions enhance perceived performance
- **Dark-first design**: Optimized for extended use and reduced eye strain

## Color Palette

### Background Colors
```css
/* Primary backgrounds */
bg-black/20        /* Main glass containers */
bg-white/10        /* Secondary containers */
bg-white/5         /* Subtle backgrounds */
bg-white/20        /* Hover states */

/* Status backgrounds */
bg-red-500/10      /* Error states */
bg-green-500/10    /* Success states */
bg-amber-500/20    /* Warning states */
bg-blue-500/10     /* Info states */
```

### Text Colors
```css
/* Primary text */
text-white         /* Primary headings and content */
text-gray-300      /* Secondary text and descriptions */
text-gray-400      /* Tertiary text and metadata */

/* Interactive text */
text-white hover:text-gray-300    /* Links and buttons */
text-gray-300 hover:text-white    /* Secondary actions */
```

### Border Colors
```css
border-white/10    /* Default borders */
border-white/20    /* Emphasized borders */
border-white/30    /* Focus states */
```

## Typography

### Font Hierarchy
1. **Page Titles**: `text-4xl font-bold text-white` (40px)
2. **Section Headings**: `text-2xl font-bold text-white` (24px)
3. **Subsection Headings**: `text-xl font-semibold text-white` (20px)
4. **Card Titles**: `text-lg font-semibold text-white` (18px)
5. **Body Text**: `text-sm text-gray-300` (14px)
6. **Small Text**: `text-xs text-gray-400` (12px)

### Font Weights
- **Bold**: 700 (headings)
- **Semibold**: 600 (subheadings, emphasis)
- **Medium**: 500 (buttons, labels)
- **Regular**: 400 (body text)

## Spacing System

### Base Unit: 0.25rem (4px)
```css
/* Common spacing values */
space-y-6     /* 24px - Between major sections */
space-y-4     /* 16px - Between form fields */
space-x-3     /* 12px - Horizontal spacing */
p-8           /* 32px - Large container padding */
p-6           /* 24px - Medium container padding */
p-4           /* 16px - Small container padding */
```

## Component Specifications

### Page Layout

```html
<div class="min-h-screen py-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Page content -->
  </div>
</div>
```

### Glass Containers

#### Primary Container
```css
.glass-container {
  @apply backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl;
}
```

#### Secondary Container
```css
.glass-container-secondary {
  @apply backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl;
}
```

### Page Headers

```html
<!-- Glass Morphism Header Card -->
<div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
  <!-- Breadcrumb -->
  <nav class="flex mb-6" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-3">
      <!-- Breadcrumb items -->
    </ol>
  </nav>
  
  <!-- Title Section with Gradient -->
  <div class="relative">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
    <div class="relative">
      <h1 class="text-4xl font-bold text-white mb-3">Page Title</h1>
      <p class="text-gray-300 text-lg">Page description</p>
    </div>
  </div>
</div>
```

### Buttons

#### Primary Button (Gradient)
```html
<button class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
  <svg class="w-5 h-5 mr-2"><!-- Icon --></svg>
  Button Text
</button>
```

#### Secondary Button (Glass)
```html
<button class="inline-flex items-center px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-colors border border-white/10">
  <svg class="w-4 h-4 mr-2"><!-- Icon --></svg>
  Button Text
</button>
```

#### Danger Button
```html
<button class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium">
  <svg class="w-4 h-4 mr-2"><!-- Icon --></svg>
  Delete
</button>
```

### Forms

#### Form Container
```html
<div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
  <!-- Form Header -->
  <div class="relative px-8 py-6 border-b border-white/10">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
    <div class="relative flex items-center gap-3">
      <div class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
        <!-- Icon -->
      </div>
      <div>
        <h2 class="text-xl font-semibold text-white">Form Title</h2>
        <p class="text-sm text-gray-300">Form description</p>
      </div>
    </div>
  </div>
  
  <!-- Form Content -->
  <div class="p-8">
    <!-- Form fields -->
  </div>
</div>
```

#### Form Inputs
```css
.form-input {
  @apply w-full px-3 py-2 bg-white/5 backdrop-filter backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all;
}
```

### Tables

```html
<div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl overflow-hidden">
  <table class="w-full">
    <thead class="bg-white/5">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
          Column Header
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-white/10">
      <tr class="hover:bg-white/5 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
          Cell Content
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Cards

#### Basic Card
```html
<div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6">
  <h3 class="text-lg font-semibold text-white mb-4">Card Title</h3>
  <p class="text-gray-300">Card content</p>
</div>
```

#### Interactive Card
```html
<div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 hover:shadow-3xl hover:scale-[1.02] transition-all cursor-pointer">
  <!-- Card content -->
</div>
```

### Alerts and Notifications

#### Success Alert
```html
<div class="backdrop-blur-xl bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
  <div class="flex items-start space-x-3">
    <svg class="w-5 h-5 text-green-400 mt-0.5"><!-- Icon --></svg>
    <div>
      <h5 class="text-sm font-medium text-green-300">Success</h5>
      <p class="text-sm text-green-200 mt-1">Operation completed successfully.</p>
    </div>
  </div>
</div>
```

### Navigation

#### Sidebar Navigation
```html
<nav class="backdrop-blur-md bg-black/30 rounded-xl border border-white/10 shadow-xl p-6">
  <a href="/admin/path" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all">
    <svg class="w-5 h-5"><!-- Icon --></svg>
    <span class="font-medium">Navigation Item</span>
  </a>
</nav>
```

### Empty States

```html
<div class="text-center py-16">
  <div class="flex justify-center mb-4">
    <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
      <svg class="w-8 h-8 text-white"><!-- Icon --></svg>
    </div>
  </div>
  <h3 class="text-lg font-semibold text-white mb-2">No items found</h3>
  <p class="text-gray-300 mb-6">Get started by creating your first item.</p>
  <button class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
    Create New Item
  </button>
</div>
```

## Interaction Patterns

### Hover States
- **Containers**: Add `hover:bg-white/20` or increase opacity
- **Buttons**: Darken gradients or increase glass opacity
- **Links**: Change from `text-gray-300` to `text-white`
- **Cards**: Add `hover:shadow-3xl` and subtle scale `hover:scale-[1.02]`

### Focus States
- **Inputs**: Show ring with `focus:ring-2 focus:ring-white/20`
- **Buttons**: Add outline with `focus:outline-none focus:ring-2 focus:ring-white/30`

### Transitions
- **Default**: `transition-all` for smooth state changes
- **Colors**: `transition-colors` for color-only changes
- **Transform**: `transition-transform` for scale/rotate changes
- **Duration**: Default 200ms, use `duration-300` for slower animations

## Responsive Design

### Breakpoints
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (640px+)
- **Desktop**: `lg:` (1024px+)
- **Wide**: `xl:` (1280px+)

### Mobile Adaptations
- Stack horizontal layouts vertically
- Reduce padding: `p-4` instead of `p-8`
- Full-width buttons on mobile
- Simplified navigation (hamburger menu)

## Accessibility Guidelines

### Color Contrast
- Ensure 4.5:1 contrast ratio for normal text
- Ensure 3:1 contrast ratio for large text
- Test with translucent backgrounds

### Interactive Elements
- Minimum touch target: 44x44px
- Clear focus indicators
- Keyboard navigation support
- ARIA labels for icons

### Motion
- Respect `prefers-reduced-motion`
- Provide alternatives to animated content
- Keep transitions under 300ms

## Implementation Examples

### Complete Page Template
```html
<div class="min-h-screen py-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <!-- Page Header -->
    <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
      <!-- Header content -->
    </div>
    
    <!-- Main Content -->
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl">
      <!-- Content -->
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Action cards -->
    </div>
  </div>
</div>
```

## CSS Variables (Future Enhancement)

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-hover: rgba(255, 255, 255, 0.2);
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
}
```

## Maintenance Notes

1. **Consistency**: Always use the predefined classes and patterns
2. **Performance**: Limit backdrop-blur usage on mobile devices
3. **Testing**: Verify glass effects across different backgrounds
4. **Updates**: Document any new patterns in this specification
5. **Reviews**: Regular design audits to ensure adherence

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintained By**: SonicJS AI Development Team