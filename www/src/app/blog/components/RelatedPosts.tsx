import Link from 'next/link'
import Image from 'next/image'
import { BlogPostMeta, BLOG_CATEGORIES } from '@/types/blog'
import { formatDate } from '@/lib/utils'

interface RelatedPostsProps {
  posts: BlogPostMeta[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Related Articles</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const categoryLabel =
            BLOG_CATEGORIES.find((c) => c.value === post.category)?.label || post.category

          return (
            <article
              key={post.slug}
              className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              {post.featuredImage && (
                <div className="relative mb-3 aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {categoryLabel}
                </span>
                <span aria-hidden="true">&middot;</span>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>

              <h3 className="mt-2 font-semibold text-zinc-900 line-clamp-2 dark:text-white">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.title}
                </Link>
              </h3>

              <p className="mt-1 text-sm text-zinc-600 line-clamp-2 dark:text-zinc-400">
                {post.description}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
