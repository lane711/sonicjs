# SonicJS WWW SEO-Centric Blog Feature Plan

**Date**: December 12, 2025
**Purpose**: Add an SEO-optimized blog to the SonicJS documentation site to drive organic traffic and establish thought leadership
**Location**: `/www/src/app/blog/`

---

## Executive Summary

This plan outlines the implementation of a fully-featured, SEO-centric blog for the SonicJS documentation website. The blog will target key search terms in the headless CMS, Cloudflare Workers, and edge computing space to drive organic traffic and establish SonicJS as a thought leader.

---

## 1. Technical Architecture

### 1.1 Directory Structure

```
www/src/app/blog/
├── page.tsx                    # Blog index (listing all posts)
├── [slug]/
│   └── page.tsx                # Dynamic blog post page
├── category/
│   └── [category]/
│       └── page.tsx            # Category archive pages
├── tag/
│   └── [tag]/
│       └── page.tsx            # Tag archive pages
├── feed.xml/
│   └── route.ts                # RSS feed endpoint
└── components/
    ├── BlogCard.tsx            # Blog post card for listings
    ├── BlogHeader.tsx          # Post header with meta info
    ├── BlogFooter.tsx          # Post footer with related posts
    ├── AuthorCard.tsx          # Author bio component
    ├── ShareButtons.tsx        # Social sharing buttons
    ├── TableOfContents.tsx     # Auto-generated TOC
    ├── RelatedPosts.tsx        # Related posts component
    └── NewsletterSignup.tsx    # Email capture component

www/content/blog/
├── tutorials/
│   └── *.mdx                   # Tutorial posts
├── comparisons/
│   └── *.mdx                   # Comparison posts
├── guides/
│   └── *.mdx                   # How-to guides
├── news/
│   └── *.mdx                   # Announcements & updates
└── deep-dives/
    └── *.mdx                   # Technical deep dives
```

### 1.2 Blog Post MDX Schema

```typescript
// www/src/types/blog.ts
export interface BlogPost {
  // SEO & Meta
  title: string                    // H1 + meta title
  description: string              // Meta description (150-160 chars)
  keywords: string[]               // Target keywords
  canonicalUrl?: string            // Optional canonical URL

  // Content Organization
  slug: string                     // URL slug
  category: BlogCategory           // Primary category
  tags: string[]                   // Secondary tags

  // Publishing
  publishedAt: string              // ISO date string
  updatedAt?: string               // Last updated date
  author: Author                   // Author details
  status: 'draft' | 'published'    // Publication status

  // SEO Enhancements
  featuredImage?: {
    url: string
    alt: string
    width: number
    height: number
  }
  readingTime: number              // Estimated reading time

  // Rich Snippets
  structuredData?: {
    type: 'Article' | 'TechArticle' | 'HowTo' | 'FAQPage'
    faqItems?: FAQItem[]           // For FAQ schema
  }
}

export type BlogCategory =
  | 'tutorials'
  | 'comparisons'
  | 'guides'
  | 'news'
  | 'deep-dives'

export interface Author {
  name: string
  avatar?: string
  bio?: string
  twitter?: string
  github?: string
}
```

### 1.3 Blog Post Frontmatter Template

```mdx
---
title: "How to Build a Blog with SonicJS and Cloudflare Workers"
description: "Learn to create a blazingly fast blog using SonicJS headless CMS deployed on Cloudflare Workers with D1 database and R2 storage."
keywords:
  - "sonicjs blog tutorial"
  - "cloudflare workers blog"
  - "edge cms blog"
  - "headless cms tutorial"
category: "tutorials"
tags:
  - "getting-started"
  - "cloudflare"
  - "blog"
publishedAt: "2025-12-15"
updatedAt: "2025-12-15"
author:
  name: "SonicJS Team"
  avatar: "/images/authors/sonicjs-team.png"
  twitter: "sonicjs"
  github: "lane711/sonicjs"
featuredImage:
  url: "/images/blog/sonicjs-blog-tutorial.png"
  alt: "Building a blog with SonicJS"
  width: 1200
  height: 630
structuredData:
  type: "TechArticle"
---

# How to Build a Blog with SonicJS and Cloudflare Workers

[Post content...]
```

---

## 2. SEO Implementation

### 2.1 Meta Tags & Open Graph

```typescript
// www/src/app/blog/[slug]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: `${post.title} | SonicJS Blog`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `https://sonicjs.com/blog/${post.slug}`,
      siteName: 'SonicJS',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.featuredImage?.url || 'https://sonicjs.com/og-blog.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.featuredImage?.url || 'https://sonicjs.com/og-blog.png'],
    },
    alternates: {
      canonical: `https://sonicjs.com/blog/${post.slug}`,
    },
  }
}
```

### 2.2 JSON-LD Structured Data

```typescript
// www/src/components/blog/StructuredData.tsx
export function BlogPostSchema({ post }: { post: BlogPost }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.description,
    image: post.featuredImage?.url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.twitter
        ? `https://twitter.com/${post.author.twitter}`
        : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SonicJS',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sonicjs.com/sonicjs-logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://sonicjs.com/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
    wordCount: post.wordCount,
    timeRequired: `PT${post.readingTime}M`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// BreadcrumbList schema
export function BreadcrumbSchema({ post }: { post: BlogPost }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://sonicjs.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://sonicjs.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.category,
        item: `https://sonicjs.com/blog/category/${post.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
        item: `https://sonicjs.com/blog/${post.slug}`,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 2.3 Sitemap Updates

```typescript
// www/src/app/sitemap.ts - Update to include blog posts
import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sonicjs.com'
  const posts = await getAllPosts()

  // Existing documentation pages
  const docPages = [
    // ... existing pages
  ]

  // Blog index page
  const blogIndex = {
    url: `${baseUrl}/blog`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }

  // Individual blog posts
  const blogPosts = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Category pages
  const categories = ['tutorials', 'comparisons', 'guides', 'news', 'deep-dives']
  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/blog/category/${cat}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...docPages, blogIndex, ...blogPosts, ...categoryPages]
}
```

### 2.4 RSS Feed

```typescript
// www/src/app/blog/feed.xml/route.ts
import { getAllPosts } from '@/lib/blog'

export async function GET() {
  const posts = await getAllPosts()
  const baseUrl = 'https://sonicjs.com'

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SonicJS Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Tutorials, guides, and updates about SonicJS - the edge-first headless CMS for Cloudflare Workers</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .slice(0, 20)
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category>${post.category}</category>
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
```

---

## 3. Target Keyword Strategy

### 3.1 Primary Keywords (High Priority)

| Keyword | Search Volume | Difficulty | Content Type |
|---------|---------------|------------|--------------|
| headless cms cloudflare | Medium | Medium | Comparison, Tutorial |
| edge cms | Low-Medium | Low | Deep Dive |
| typescript headless cms | Medium | Medium | Comparison |
| cloudflare workers cms | Low | Low | Tutorial |
| serverless cms | Medium | High | Comparison |
| self-hosted headless cms | Medium | Medium | Guide |

### 3.2 Long-Tail Keywords (Quick Wins)

| Keyword | Content Type | Priority |
|---------|--------------|----------|
| how to build cms on cloudflare workers | Tutorial | High |
| best headless cms for cloudflare | Comparison | High |
| hono cms tutorial | Tutorial | Medium |
| d1 database cms | Tutorial | Medium |
| htmx admin panel | Deep Dive | Medium |
| cloudflare r2 file storage cms | Tutorial | Medium |

### 3.3 Competitor Comparison Keywords

| Keyword | Competitors | Content Type |
|---------|-------------|--------------|
| sonicjs vs strapi | Strapi | Comparison |
| sonicjs vs sanity | Sanity | Comparison |
| sonicjs vs payload | Payload CMS | Comparison |
| sonicjs vs directus | Directus | Comparison |
| sonicjs vs contentful | Contentful | Comparison |

---

## 4. Content Calendar (Initial 8 Weeks)

### Week 1-2: Foundation & Launch Posts

1. **"Why Edge-First CMS is the Future of Content Management"** (Deep Dive)
   - Keywords: edge cms, edge-first content management
   - Goal: Establish thought leadership

2. **"Getting Started with SonicJS: Complete Beginner's Guide"** (Tutorial)
   - Keywords: sonicjs tutorial, cloudflare workers cms
   - Goal: Capture getting-started searches

### Week 3-4: Comparison Content

3. **"SonicJS vs Strapi: Edge-First CMS Comparison"** (Comparison)
   - Keywords: sonicjs vs strapi, headless cms comparison
   - Goal: Capture comparison traffic

4. **"SonicJS vs Sanity: Which Headless CMS is Right for You?"** (Comparison)
   - Keywords: sonicjs vs sanity, typescript headless cms
   - Goal: Capture comparison traffic

### Week 5-6: Tutorial Content

5. **"How to Build a Blog with SonicJS and Cloudflare Workers"** (Tutorial)
   - Keywords: cloudflare workers blog, how to build cms
   - Goal: Drive practical use cases

6. **"Building an E-commerce Product Catalog with SonicJS"** (Tutorial)
   - Keywords: headless cms ecommerce, sonicjs tutorial
   - Goal: Show real-world applications

### Week 7-8: Technical Deep Dives

7. **"Understanding SonicJS Three-Tiered Caching Strategy"** (Deep Dive)
   - Keywords: cloudflare workers caching, edge caching
   - Goal: Demonstrate technical depth

8. **"Plugin Development in SonicJS: Complete Guide"** (Guide)
   - Keywords: sonicjs plugins, headless cms extensibility
   - Goal: Attract developers

---

## 5. Blog Components Implementation

### 5.1 Blog Index Page

```tsx
// www/src/app/blog/page.tsx
import { Metadata } from 'next'
import { getAllPosts, getFeaturedPosts } from '@/lib/blog'
import { BlogCard } from './components/BlogCard'
import { CategoryFilter } from './components/CategoryFilter'
import { NewsletterSignup } from './components/NewsletterSignup'

export const metadata: Metadata = {
  title: 'Blog | SonicJS',
  description: 'Tutorials, guides, and updates about SonicJS - the edge-first headless CMS for Cloudflare Workers.',
  alternates: {
    canonical: 'https://sonicjs.com/blog',
    types: {
      'application/rss+xml': 'https://sonicjs.com/blog/feed.xml',
    },
  },
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  const featuredPosts = await getFeaturedPosts()

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          SonicJS Blog
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Tutorials, guides, and updates about edge-first content management
        </p>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Featured</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {featuredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} featured />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter */}
      <CategoryFilter />

      {/* All Posts */}
      <section className="mt-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  )
}
```

### 5.2 Blog Post Page

```tsx
// www/src/app/blog/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPost, getAllPosts, getRelatedPosts } from '@/lib/blog'
import { BlogHeader } from '../components/BlogHeader'
import { TableOfContents } from '../components/TableOfContents'
import { RelatedPosts } from '../components/RelatedPosts'
import { ShareButtons } from '../components/ShareButtons'
import { BlogPostSchema, BreadcrumbSchema } from '../components/StructuredData'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}

  return {
    title: `${post.title} | SonicJS Blog`,
    description: post.description,
    // ... full metadata as shown in 2.1
  }
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post)

  return (
    <>
      <BlogPostSchema post={post} />
      <BreadcrumbSchema post={post} />

      <article className="mx-auto max-w-4xl px-4 py-16">
        <BlogHeader post={post} />

        <div className="mt-8 flex gap-8">
          {/* Table of Contents - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <TableOfContents />
          </aside>

          {/* Post Content */}
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {/* MDX content rendered here */}
          </div>
        </div>

        <ShareButtons post={post} />
        <RelatedPosts posts={relatedPosts} />
      </article>
    </>
  )
}
```

### 5.3 Blog Card Component

```tsx
// www/src/app/blog/components/BlogCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <article
      className={`group relative flex flex-col rounded-2xl border border-zinc-100 p-6 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 ${
        featured ? 'col-span-2' : ''
      }`}
    >
      {post.featuredImage && (
        <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="capitalize">{post.category}</span>
        <span>·</span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span>·</span>
        <span>{post.readingTime} min read</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-white">
        <Link href={`/blog/${post.slug}`}>
          <span className="absolute inset-0" />
          {post.title}
        </Link>
      </h3>

      <p className="mt-2 text-zinc-600 dark:text-zinc-400 line-clamp-3">
        {post.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
```

---

## 6. Navigation Integration

### 6.1 Update Navigation Component

```typescript
// Update www/src/components/Navigation.tsx
export const navigation: Array<NavGroup> = [
  {
    title: 'Getting Started',
    links: [
      { title: 'Introduction', href: '/' },
      { title: 'Quickstart', href: '/quickstart' },
    ],
  },
  // ... existing navigation groups
  {
    title: 'Resources',
    links: [
      { title: 'Blog', href: '/blog' },  // Add blog link
      { title: 'Roadmap', href: '/roadmap' },
      { title: 'Examples', href: '/examples' },
      { title: 'FAQ', href: '/faq' },
      { title: 'Changelog', href: '/changelog' },
      { title: 'Community', href: '/community' },
      { title: 'Contributing', href: '/contributing' },
      { title: 'Telemetry', href: '/telemetry' },
    ],
  },
]
```

### 6.2 Header Blog Link

Add a prominent "Blog" link in the header navigation for visibility.

---

## 7. Performance & Core Web Vitals

### 7.1 Image Optimization

```typescript
// www/next.config.mjs - Add image optimization
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sonicjs.com',
      },
    ],
  },
}
```

### 7.2 Lazy Loading

- Implement intersection observer for blog card images
- Use Next.js `priority` prop for above-the-fold images
- Lazy load related posts component

### 7.3 Caching Headers

```typescript
// www/public/_headers - Add blog caching
/blog/*
  Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800

/blog/feed.xml
  Cache-Control: public, max-age=3600, s-maxage=3600
  Content-Type: application/xml
```

---

## 8. Analytics & Tracking

### 8.1 Blog-Specific Events

```typescript
// Track blog engagement
gtag('event', 'blog_view', {
  post_title: post.title,
  post_category: post.category,
  post_author: post.author.name,
})

gtag('event', 'blog_share', {
  post_title: post.title,
  share_platform: platform,
})

gtag('event', 'newsletter_signup', {
  source: 'blog_post',
  post_slug: post.slug,
})
```

### 8.2 Search Console Setup

- Submit new sitemap after blog launch
- Monitor blog-specific search queries
- Track impressions and clicks per post
- Set up URL inspection for new posts

---

## 9. Implementation Phases

### Phase 1: Core Infrastructure (2-3 days)
- [ ] Create blog directory structure
- [ ] Implement MDX processing for blog posts
- [ ] Create blog index page
- [ ] Create dynamic post page
- [ ] Add JSON-LD structured data
- [ ] Update sitemap

### Phase 2: Components (2 days)
- [ ] Build BlogCard component
- [ ] Build BlogHeader component
- [ ] Build TableOfContents component
- [ ] Build ShareButtons component
- [ ] Build RelatedPosts component
- [ ] Build CategoryFilter component

### Phase 3: SEO Optimization (1 day)
- [ ] Implement full meta tags
- [ ] Create RSS feed endpoint
- [ ] Add breadcrumb navigation
- [ ] Test structured data with Google's Rich Results Test
- [ ] Verify sitemap includes all blog URLs

### Phase 4: Content Creation (Ongoing)
- [ ] Write launch blog post
- [ ] Write first tutorial
- [ ] Write first comparison post
- [ ] Create editorial calendar
- [ ] Set up content review process

### Phase 5: Launch & Monitor (1 day)
- [ ] Update navigation to include blog
- [ ] Deploy to production
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor Core Web Vitals
- [ ] Track initial traffic and engagement

---

## 10. Success Metrics

### Launch Goals (First 30 Days)
- 5+ indexed blog posts
- Blog pages appearing in search results
- < 2.5s LCP for blog pages
- 0 CLS issues
- RSS feed discoverable

### 90-Day Goals
- 15+ published blog posts
- 1,000+ organic blog page views
- Top 10 ranking for at least 3 target keywords
- 5+ backlinks to blog content
- Email newsletter signups from blog

### 6-Month Goals
- 30+ published blog posts
- 10,000+ monthly organic blog views
- Top 5 ranking for primary keywords
- Recognized as resource in headless CMS space
- Regular content production cadence

---

## 11. Content Quality Guidelines

### Writing Standards
1. **Technical Accuracy**: All code examples must be tested and working
2. **Keyword Usage**: Natural integration, no stuffing (1-2% density)
3. **Readability**: Aim for Grade 8-10 reading level
4. **Structure**: Use H2/H3 headings every 300-400 words
5. **Length**: Tutorials 1,500-2,500 words; comparisons 2,000-3,000 words

### SEO Checklist for Each Post
- [ ] Title includes primary keyword (under 60 chars)
- [ ] Meta description includes keyword (150-160 chars)
- [ ] URL slug is short and descriptive
- [ ] H1 matches or closely relates to title
- [ ] At least one image with optimized alt text
- [ ] Internal links to relevant docs pages
- [ ] External links to authoritative sources
- [ ] Code examples with syntax highlighting
- [ ] Clear call-to-action at end

---

## Appendix: Key SonicJS Differentiators for Content

When creating blog content, emphasize these unique selling points:

1. **Edge-First Architecture**: Runs on Cloudflare Workers globally
2. **Zero Cold Starts**: Unlike serverless functions, no warmup time
3. **TypeScript-Native**: Full type safety throughout
4. **Built-in Storage**: D1 database + R2 file storage
5. **Three-Tiered Caching**: Memory → KV → D1 for optimal performance
6. **HTMX Admin**: Modern, fast admin without heavy JavaScript
7. **Plugin System**: Extensible architecture for customization
8. **Open Source**: MIT licensed, community-driven development

---

**Plan Version**: 1.0
**Last Updated**: December 12, 2025
**Status**: Ready for Implementation
