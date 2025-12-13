# SEO Audit for SonicJS Website

Perform a comprehensive SEO audit of the SonicJS documentation website (www/).

## Audit Checklist

### 1. Technical SEO
- [ ] Check for sitemap.xml existence and validity
- [ ] Check for robots.txt configuration
- [ ] Verify meta tags on all pages (title, description)
- [ ] Check for canonical URLs
- [ ] Verify proper heading hierarchy (H1-H6)
- [ ] Check for broken internal links
- [ ] Verify mobile responsiveness
- [ ] Check page load performance

### 2. On-Page SEO
- [ ] Review title tags (50-60 chars, include keywords)
- [ ] Review meta descriptions (150-160 chars)
- [ ] Check OpenGraph tags for social sharing
- [ ] Verify image alt text
- [ ] Check URL structure (clean, descriptive)
- [ ] Review internal linking structure
- [ ] Check for duplicate content issues

### 3. Content SEO
- [ ] Identify thin content pages
- [ ] Find keyword opportunities
- [ ] Check content freshness
- [ ] Review heading optimization
- [ ] Identify content gaps vs competitors

### 4. Structured Data
- [ ] Check for JSON-LD implementation
- [ ] Verify Organization schema
- [ ] Check for Article/BlogPosting schema
- [ ] Verify Breadcrumb schema
- [ ] Check SoftwareApplication schema for CMS

## Files to Inspect

```
www/
├── src/app/layout.tsx          # Root layout with meta
├── src/app/page.mdx            # Homepage
├── src/app/*/page.mdx          # All doc pages
├── public/robots.txt           # Robots file
├── public/sitemap.xml          # Sitemap
└── next.config.mjs             # Next.js config
```

## Output Format

Create a report with:
1. **Score**: Overall SEO health (0-100)
2. **Critical Issues**: Must fix immediately
3. **Warnings**: Should fix soon
4. **Opportunities**: Nice to have improvements
5. **Action Items**: Prioritized list of fixes

## Recommended Fixes

After audit, implement fixes in this order:
1. Add/fix sitemap.xml
2. Add/fix robots.txt
3. Add missing meta tags
4. Implement structured data
5. Fix broken links
6. Optimize images
