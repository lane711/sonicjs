// Example of how to use the template system in a route

import { renderContentListTemplate, ContentListTemplateData } from './admin/content-list.template'

// In your route handler:
export function exampleRouteHandler() {
  // Prepare your data
  const templateData: ContentListTemplateData = {
    modelName: 'blog_post',
    status: 'all',
    page: 1,
    models: [
      { name: 'blog_post', displayName: 'Blog Post' },
      { name: 'page', displayName: 'Page' }
    ],
    contentItems: [
      {
        id: '123',
        title: 'My Blog Post',
        slug: 'my-blog-post',
        modelName: 'blog_post',
        statusBadge: '<span class="badge">Published</span>',
        authorName: 'John Doe',
        formattedDate: '2025-01-01',
        availableActions: ['edit', 'delete']
      }
    ],
    paginationStart: 1,
    paginationEnd: 10,
    totalResults: 25,
    showPrevious: false,
    previousPage: 0,
    nextPage: 2
  }

  // Render the template
  const html = renderContentListTemplate(templateData)
  
  // Return as HTML response
  // return c.html(html)
}

// Benefits of this approach:
// ✅ Templates are in separate, readable files
// ✅ TypeScript provides full type safety
// ✅ Works with Cloudflare Workers (no file system access needed)
// ✅ Easy to edit HTML without touching route logic
// ✅ Can be version controlled and diffed easily
// ✅ Intellisense support for template data
// ✅ Templates can be unit tested independently