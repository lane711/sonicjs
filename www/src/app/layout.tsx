import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'
import { type Section } from '@/components/SectionProvider'

import '@/styles/tailwind.css'
import allSections from './allSections.json'

export const metadata: Metadata = {
  title: {
    template: '%s - SonicJS Documentation',
    default: 'SonicJS - Modern Headless CMS',
  },
  description: 'SonicJS is a modern, blazingly fast headless CMS built with TypeScript, Hono, and Cloudflare Workers.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <Providers>
          <div className="w-full">
            <Layout allSections={allSections as Record<string, Array<Section>>}>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
