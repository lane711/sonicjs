import { BlogPost } from '@/types/blog'

interface BlogPostSchemaProps {
  post: BlogPost
}

export function BlogPostSchema({ post }: BlogPostSchemaProps) {
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
        : post.author.github
          ? `https://github.com/${post.author.github}`
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
    articleSection: post.category,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  post: BlogPost
}

export function BreadcrumbSchema({ post }: BreadcrumbSchemaProps) {
  const categoryLabels: Record<string, string> = {
    tutorials: 'Tutorials',
    comparisons: 'Comparisons',
    guides: 'Guides',
    news: 'News',
    'deep-dives': 'Deep Dives',
  }

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
        name: categoryLabels[post.category] || post.category,
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

export function BlogListSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'SonicJS Blog',
    description:
      'Tutorials, guides, and updates about SonicJS - the edge-first headless CMS for Cloudflare Workers',
    url: 'https://sonicjs.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'SonicJS',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sonicjs.com/sonicjs-logo.png',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
