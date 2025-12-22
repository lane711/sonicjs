'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation } from '@/components/Navigation'

interface BreadcrumbItem {
  name: string
  href: string
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', href: '/' }]

  if (pathname === '/') {
    return breadcrumbs
  }

  // Find the current page in navigation
  for (const group of navigation) {
    for (const link of group.links) {
      if (link.href === pathname) {
        breadcrumbs.push({
          name: group.title,
          href: group.links[0].href,
        })
        if (link.title !== group.title) {
          breadcrumbs.push({
            name: link.title,
            href: link.href,
          })
        }
        return breadcrumbs
      }
    }
  }

  // Fallback for pages not in navigation
  const segments = pathname.split('/').filter(Boolean)
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    breadcrumbs.push({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: currentPath,
    })
  }

  return breadcrumbs
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  // Don't show breadcrumbs on homepage
  if (pathname === '/') {
    return null
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://sonicjs.com${item.href}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mt-4 mb-4">
        <ol className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
          {breadcrumbs.map((item, index) => (
            <li key={`${item.href}-${index}`} className="flex items-center">
              {index > 0 && (
                <svg
                  className="mx-2 h-4 w-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-zinc-900 dark:text-white font-medium">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
