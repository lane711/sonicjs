'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BLOG_CATEGORIES } from '@/types/blog'
import clsx from 'clsx'

export function CategoryFilter() {
  const pathname = usePathname()
  const isAllActive = pathname === '/blog'

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={clsx(
          'rounded-full px-4 py-2 text-sm font-medium transition-colors',
          isAllActive
            ? 'bg-emerald-600 text-white'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
        )}
      >
        All
      </Link>
      {BLOG_CATEGORIES.map((category) => {
        const isActive = pathname === `/blog/category/${category.value}`
        return (
          <Link
            key={category.value}
            href={`/blog/category/${category.value}`}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            )}
          >
            {category.label}
          </Link>
        )
      })}
    </div>
  )
}
