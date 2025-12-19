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

export interface FeaturedImage {
  url: string
  alt: string
  width: number
  height: number
}

export interface BlogPostFrontmatter {
  title: string
  description: string
  keywords: string[]
  category: BlogCategory
  tags: string[]
  publishedAt: string
  updatedAt?: string
  author: Author
  featuredImage?: FeaturedImage
  featured?: boolean
  draft?: boolean
}

export interface BlogPost extends BlogPostFrontmatter {
  slug: string
  content: string
  readingTime: number
  wordCount: number
}

export interface BlogPostMeta extends Omit<BlogPost, 'content'> {}

export const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: 'tutorials', label: 'Tutorials' },
  { value: 'comparisons', label: 'Comparisons' },
  { value: 'guides', label: 'Guides' },
  { value: 'news', label: 'News' },
  { value: 'deep-dives', label: 'Deep Dives' },
]

export const DEFAULT_AUTHOR: Author = {
  name: 'SonicJS Team',
  avatar: '/images/authors/sonicjs-team.png',
  twitter: 'sonicjs',
  github: 'lane711/sonicjs',
}
