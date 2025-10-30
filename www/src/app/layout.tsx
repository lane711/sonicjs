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
  // Check if we're in a Node.js environment with filesystem access
  // In Cloudflare Workers, process.versions will be undefined or won't have 'node'
  const isNodeEnvironment = typeof process !== 'undefined' &&
                           process.versions &&
                           process.versions.node

  if (!isNodeEnvironment) {
    // Running in Cloudflare Workers - return empty sections
    // The sections are baked into the static HTML at build time
    return {}
  }

  try {
    // Dynamically import glob only when in Node.js environment
    const { default: glob } = await import('fast-glob')
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
