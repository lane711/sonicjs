// Example: How to use the new component-based template system

import { renderContentListPage, ContentListPageData } from './pages/admin-content-list.template'

// In your route handler, you would use it like this:
export function exampleContentListRoute() {
  // Prepare your data
  const pageData: ContentListPageData = {
    modelName: 'blog_post',
    status: 'all', 
    page: 1,
    models: [
      { name: 'blog_post', displayName: 'Blog Post' },
      { name: 'page', displayName: 'Page' },
      { name: 'product', displayName: 'Product' }
    ],
    contentItems: [
      {
        id: '123',
        title: 'Welcome to SonicJS',
        slug: 'welcome-to-sonicjs',
        modelName: 'Blog Post',
        statusBadge: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Published</span>',
        authorName: 'John Doe',
        formattedDate: '2025-01-01',
        availableActions: ['archive', 'duplicate']
      },
      {
        id: '456',
        title: 'Getting Started Guide',
        slug: 'getting-started-guide',
        modelName: 'Page',
        statusBadge: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Draft</span>',
        authorName: 'Jane Smith',
        formattedDate: '2025-01-02',
        availableActions: ['publish', 'review']
      }
    ],
    totalItems: 25,
    itemsPerPage: 20,
    user: {
      name: 'Admin User',
      email: 'admin@sonicjs.com',
      role: 'admin'
    }
  }

  // Render the complete page
  const html = renderContentListPage(pageData)
  
  // Return as HTML response
  // return c.html(html)
  
  return html
}

/* 

🎯 Benefits of this Component-Based Approach:

✅ **DRY Principle**: No duplicate headers, layouts, or common components
✅ **Maintainable**: Edit the header once in admin-layout.template.ts
✅ **Reusable**: Table, filter bar, and pagination components work anywhere
✅ **Type Safe**: Full TypeScript support with interfaces
✅ **Modular**: Easy to add new components or modify existing ones
✅ **Consistent**: All admin pages use the same layout and components

📁 Template Structure:
/templates
  /layouts
    admin-layout.template.ts     - Main layout with header/footer
  /components  
    table.template.ts            - Reusable data table
    filter-bar.template.ts       - Filter controls
    pagination.template.ts       - Pagination component
  /pages
    admin-content-list.template.ts - Complete content list page

🔧 How to Add New Pages:
1. Create new page template in /pages
2. Import layout and needed components  
3. Pass data to components
4. Use layout wrapper with your content

🎨 How to Modify Styles:
1. Edit admin-layout.template.ts for global styles
2. Edit individual components for specific styling
3. Add custom styles to page templates as needed

*/