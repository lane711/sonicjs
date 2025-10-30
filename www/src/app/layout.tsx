import glob from 'fast-glob'
import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'
import { type Section } from '@/components/SectionProvider'

import '@/styles/tailwind.css'

// Force static rendering at build time
export const dynamic = 'force-static'
export const dynamicParams = false

export const metadata: Metadata = {
  title: {
    template: '%s - SonicJS Documentation',
    default: 'SonicJS - Modern Headless CMS',
  },
  description: 'SonicJS is a modern, blazingly fast headless CMS built with TypeScript, Hono, and Cloudflare Workers.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
}

async function getAllSections() {
  // In production/Workers, fast-glob won't work, so we return empty
  // The sections are only needed for navigation which is client-side
  if (typeof process === 'undefined' || !process.cwd) {
    return {}
  }

  try {
    let pages = await glob('**/*.mdx', { cwd: 'src/app' })
    let allSectionsEntries = (await Promise.all(
      pages.map(async (filename) => [
        '/' + filename.replace(/(^|\/)page\.mdx$/, ''),
        (await import(`./${filename}`)).sections,
      ]),
    )) as Array<[string, Array<Section>]>
    return Object.fromEntries(allSectionsEntries)
  } catch (error) {
    console.warn('Failed to load sections:', error)
    return {}
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let allSections = await getAllSections()

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <Providers>
          <div className="w-full">
            <Layout allSections={allSections}>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
