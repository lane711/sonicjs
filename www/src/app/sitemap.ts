import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sonicjs.com'
  const currentDate = new Date().toISOString()

  // Main documentation pages with their priorities
  const pages = [
    // Homepage - highest priority
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },

    // Getting started - high priority
    { url: '/quickstart', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/installation', priority: 0.9, changeFrequency: 'weekly' as const },

    // Core concepts - high priority
    { url: '/architecture', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/collections', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/database', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/api', priority: 0.8, changeFrequency: 'weekly' as const },

    // Features - medium-high priority
    { url: '/authentication', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/routing', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/templating', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/plugins', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/plugins/core', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/plugins/development', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/caching', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/attachments', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/webhooks', priority: 0.7, changeFrequency: 'monthly' as const },

    // Reference - medium priority
    { url: '/deployment', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/errors', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/pagination', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/testing', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/sdks', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/telemetry', priority: 0.5, changeFrequency: 'monthly' as const },

    // Examples and guides
    { url: '/examples', priority: 0.7, changeFrequency: 'weekly' as const },

    // Community and support
    { url: '/faq', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/community', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/contributing', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/contacts', priority: 0.5, changeFrequency: 'monthly' as const },

    // Other pages
    { url: '/conversations', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/messages', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/groups', priority: 0.5, changeFrequency: 'monthly' as const },

    // Updates
    { url: '/changelog', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/roadmap', priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  return pages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
