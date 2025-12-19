import Image from 'next/image'
import Link from 'next/link'
import { BlogPost, BLOG_CATEGORIES } from '@/types/blog'
import { formatDate } from '@/lib/utils'

interface BlogHeaderProps {
  post: BlogPost
}

export function BlogHeader({ post }: BlogHeaderProps) {
  const categoryLabel =
    BLOG_CATEGORIES.find((c) => c.value === post.category)?.label || post.category

  return (
    <header className="mb-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/blog" className="hover:text-zinc-700 dark:hover:text-zinc-300">
          Blog
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/blog/category/${post.category}`}
          className="hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          {categoryLabel}
        </Link>
      </nav>

      {/* Category & Reading Time */}
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/blog/category/${post.category}`}
          className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
        >
          {categoryLabel}
        </Link>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {post.readingTime} min read
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
        {post.title}
      </h1>

      {/* Description */}
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{post.description}</p>

      {/* Author & Date */}
      <div className="mt-6 flex items-center gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {post.author.avatar && (
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-medium text-zinc-900 dark:text-white">{post.author.name}</p>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>Updated {formatDate(post.updatedAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Author Social Links */}
        <div className="ml-auto flex items-center gap-3">
          {post.author.twitter && (
            <a
              href={`https://twitter.com/${post.author.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label={`${post.author.name} on Twitter`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
          {post.author.github && (
            <a
              href={`https://github.com/${post.author.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label={`${post.author.name} on GitHub`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}
    </header>
  )
}
