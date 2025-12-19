import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostsByCategory, getAllCategories } from '@/lib/blog'
import { BlogCard } from '../../components/BlogCard'
import { CategoryFilter } from '../../components/CategoryFilter'
import { BLOG_CATEGORIES, BlogCategory } from '@/types/blog'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({ category }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const categoryInfo = BLOG_CATEGORIES.find((c) => c.value === category)

  if (!categoryInfo) {
    return {
      title: 'Category Not Found | SonicJS Blog',
    }
  }

  return {
    title: `${categoryInfo.label} | SonicJS Blog`,
    description: `Browse ${categoryInfo.label.toLowerCase()} about SonicJS - the edge-first headless CMS for Cloudflare Workers.`,
    openGraph: {
      type: 'website',
      title: `${categoryInfo.label} | SonicJS Blog`,
      description: `Browse ${categoryInfo.label.toLowerCase()} about SonicJS - the edge-first headless CMS for Cloudflare Workers.`,
      url: `https://sonicjs.com/blog/category/${category}`,
      siteName: 'SonicJS',
    },
    alternates: {
      canonical: `https://sonicjs.com/blog/category/${category}`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const categoryInfo = BLOG_CATEGORIES.find((c) => c.value === category)

  if (!categoryInfo) {
    notFound()
  }

  const posts = await getPostsByCategory(category as BlogCategory)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          {categoryInfo.label}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Browse all {categoryInfo.label.toLowerCase()} about SonicJS and edge-first content
          management.
        </p>
      </div>

      {/* Category Filter */}
      <section className="mb-8">
        <CategoryFilter />
      </section>

      {/* Posts */}
      {posts.length > 0 ? (
        <section>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            No posts in this category yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}
