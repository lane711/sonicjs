import { getAllPosts } from '@/lib/blog'

export async function GET() {
  const posts = await getAllPosts()
  const baseUrl = 'https://sonicjs.com'

  const escapeXml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>SonicJS Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Tutorials, guides, and updates about SonicJS - the edge-first headless CMS for Cloudflare Workers</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/sonicjs-logo.png</url>
      <title>SonicJS Blog</title>
      <link>${baseUrl}/blog</link>
    </image>
    ${posts
      .slice(0, 20)
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <author>noreply@sonicjs.com (${escapeXml(post.author.name)})</author>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
