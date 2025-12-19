import Link from 'next/link'
import Image from 'next/image'
import { BlogPostMeta, BLOG_CATEGORIES } from '@/types/blog'
import { formatDate } from '@/lib/utils'

interface BlogCardProps {
  post: BlogPostMeta
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const categoryLabel =
    BLOG_CATEGORIES.find((c) => c.value === post.category)?.label || post.category

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      {post.featuredImage && (
        <div className="relative mb-4 aspect-video overflow-hidden rounded-xl">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
          />
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href={`/blog/category/${post.category}`}
          className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          {categoryLabel}
        </Link>
        <span aria-hidden="true">&middot;</span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden="true">&middot;</span>
        <span>{post.readingTime} min read</span>
      </div>

      <h3
        className={`mt-3 font-semibold text-zinc-900 dark:text-white ${
          featured ? 'text-xl md:text-2xl' : 'text-lg'
        }`}
      >
        <Link href={`/blog/${post.slug}`}>
          <span className="absolute inset-0" />
          {post.title}
        </Link>
      </h3>

      <p
        className={`mt-2 text-zinc-600 dark:text-zinc-400 ${
          featured ? 'line-clamp-4' : 'line-clamp-3'
        }`}
      >
        {post.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
        {post.tags.length > 3 && (
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
            +{post.tags.length - 3}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {post.author.avatar && (
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{post.author.name}</span>
      </div>
    </article>
  )
}
