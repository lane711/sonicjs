# Generate/Update Sitemap for SonicJS

Create or update the sitemap.xml for the SonicJS documentation website.

## Instructions

1. **Discover all pages** in the www/ Next.js app:
   - Scan `www/src/app/` for all `page.mdx` and `page.tsx` files
   - Include the homepage
   - Include all documentation pages
   - Include blog posts (if any)

2. **Generate sitemap.xml** with:
   - Full URLs (https://sonicjs.com/...)
   - Last modified dates (from git or file mtime)
   - Change frequency estimates
   - Priority values (1.0 for homepage, 0.8 for main docs, 0.6 for sub-pages)

3. **Create sitemap route** for Next.js:
   - Create `www/src/app/sitemap.ts` for dynamic sitemap generation
   - Or create static `www/public/sitemap.xml`

## Sitemap Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sonicjs.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- More URLs -->
</urlset>
```

## Next.js Dynamic Sitemap (Preferred)

```typescript
// www/src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sonicjs.com'

  // Get all doc pages dynamically
  const docs = [
    { url: '/', priority: 1.0 },
    { url: '/getting-started', priority: 0.9 },
    // ... discover all pages
  ]

  return docs.map(doc => ({
    url: `${baseUrl}${doc.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: doc.priority,
  }))
}
```

## Also Create robots.txt

```
# www/public/robots.txt
User-agent: *
Allow: /

Sitemap: https://sonicjs.com/sitemap.xml
```

## Verification

After creating:
1. Visit /sitemap.xml to verify it loads
2. Test with Google Search Console
3. Submit sitemap to search engines
