#!/usr/bin/env node
/**
 * Blog Image Generator using OpenAI DALL-E API
 *
 * Usage:
 *   node scripts/generate-blog-image.mjs "blog topic" [options]
 *
 * Options:
 *   --slug <slug>     Blog post slug for file naming
 *   --style <style>   Image style: vivid (default) or natural
 *   --size <size>     Image size: 1024x1024, 1792x1024 (default), or 1024x1792
 *   --quality <qual>  Image quality: standard or hd (default)
 *   --output <path>   Custom output directory
 *
 * Environment:
 *   OPENAI_API_KEY    Required: Your OpenAI API key (loaded from ~/Dropbox/Data/.env)
 *
 * Example:
 *   node scripts/generate-blog-image.mjs "Building REST APIs with SonicJS" --slug rest-api-guide
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { homedir } from 'os'

// Load environment variables from shared .env file
const envPath = `${homedir()}/Dropbox/Data/.env`
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=')
      }
    }
  }
}
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Parse command line arguments
function parseArgs(args) {
  const parsed = {
    topic: '',
    slug: '',
    style: 'vivid',
    size: '1792x1024',
    quality: 'hd',
    output: ''
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]
    if (arg === '--slug' && args[i + 1]) {
      parsed.slug = args[++i]
    } else if (arg === '--style' && args[i + 1]) {
      parsed.style = args[++i]
    } else if (arg === '--size' && args[i + 1]) {
      parsed.size = args[++i]
    } else if (arg === '--quality' && args[i + 1]) {
      parsed.quality = args[++i]
    } else if (arg === '--output' && args[i + 1]) {
      parsed.output = args[++i]
    } else if (!arg.startsWith('--')) {
      parsed.topic = arg
    }
    i++
  }

  return parsed
}

// Generate a slug from the topic if not provided
function generateSlug(topic) {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/-$/, '')
}

// Determine image type and create optimized prompt
function createDallePrompt(topic) {
  const topicLower = topic.toLowerCase()

  // Detect blog type and customize prompt
  let stylePrefix = ''
  let contextSuffix = ''

  if (topicLower.includes('vs') || topicLower.includes('comparison') || topicLower.includes('versus')) {
    stylePrefix = 'Split-screen modern tech comparison visualization,'
    contextSuffix = 'balanced composition showing two approaches, professional analysis theme'
  } else if (topicLower.includes('tutorial') || topicLower.includes('guide') || topicLower.includes('how to')) {
    stylePrefix = 'Modern educational illustration showing'
    contextSuffix = 'step-by-step visual guide aesthetic, clean flat design, developer-friendly'
  } else if (topicLower.includes('architecture') || topicLower.includes('deep dive') || topicLower.includes('under the hood')) {
    stylePrefix = 'Abstract technical architecture visualization of'
    contextSuffix = 'interconnected nodes and data flow, sophisticated engineering diagram style'
  } else if (topicLower.includes('api') || topicLower.includes('rest') || topicLower.includes('graphql')) {
    stylePrefix = 'Modern minimalist illustration of API architecture for'
    contextSuffix = 'blueprint-style technical diagram, endpoints and data connections'
  } else if (topicLower.includes('deploy') || topicLower.includes('cloud') || topicLower.includes('cloudflare')) {
    stylePrefix = 'Futuristic cloud infrastructure illustration showing'
    contextSuffix = 'global network with edge servers, cloud computing visualization'
  } else if (topicLower.includes('database') || topicLower.includes('d1') || topicLower.includes('data')) {
    stylePrefix = 'Modern data architecture illustration representing'
    contextSuffix = 'database schemas and data relationships, clean technical visualization'
  } else {
    stylePrefix = 'Modern professional tech illustration representing'
    contextSuffix = 'clean contemporary design, developer-focused aesthetic'
  }

  // Build the full prompt with SonicJS brand guidelines
  const prompt = `${stylePrefix} ${topic}, ${contextSuffix}, blue gradient on dark slate background (#1E293B to #3B82F6), minimalist geometric shapes, no text in image, professional business quality, clean vector art style, soft ambient lighting, modern tech aesthetic suitable for a developer blog hero image`

  return prompt
}

// Generate alt text for the image
function generateAltText(topic) {
  const cleanTopic = topic.replace(/['"]/g, '')
  return `Illustration representing ${cleanTopic} for SonicJS blog`.substring(0, 125)
}

// Call OpenAI DALL-E API
async function generateImage(prompt, options) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }

  console.log('\n📝 DALL-E Prompt:')
  console.log(prompt)
  console.log('')

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: options.size,
      quality: options.quality,
      style: options.style
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.data[0]
}

// Download image from URL
async function downloadImage(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

// Main function
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Blog Image Generator for SonicJS

Usage:
  node scripts/generate-blog-image.mjs "blog topic" [options]

Options:
  --slug <slug>     Blog post slug for file naming
  --style <style>   Image style: vivid (default) or natural
  --size <size>     Image size: 1024x1024, 1792x1024 (default), or 1024x1792
  --quality <qual>  Image quality: standard or hd (default)
  --output <path>   Custom output directory

Environment:
  OPENAI_API_KEY    Required: Your OpenAI API key

Examples:
  node scripts/generate-blog-image.mjs "Building REST APIs"
  node scripts/generate-blog-image.mjs "SonicJS vs Strapi" --slug sonicjs-vs-strapi
  node scripts/generate-blog-image.mjs "Edge Computing Guide" --style natural --quality standard
`)
    process.exit(0)
  }

  const options = parseArgs(args)

  if (!options.topic) {
    console.error('❌ Error: Blog topic is required')
    process.exit(1)
  }

  // Generate slug if not provided
  const slug = options.slug || generateSlug(options.topic)

  // Determine output directory
  const outputDir = options.output || join(__dirname, '../public/images/blog', slug)

  console.log('🎨 Blog Image Generator')
  console.log('=======================')
  console.log(`Topic: ${options.topic}`)
  console.log(`Slug: ${slug}`)
  console.log(`Style: ${options.style}`)
  console.log(`Size: ${options.size}`)
  console.log(`Quality: ${options.quality}`)
  console.log(`Output: ${outputDir}`)

  try {
    // Create the prompt
    const prompt = createDallePrompt(options.topic)

    // Generate the image
    console.log('\n🔄 Generating image with DALL-E 3...')
    const result = await generateImage(prompt, options)

    console.log('\n✅ Image generated successfully!')
    console.log(`\n🔗 Temporary URL (expires in 1 hour):`)
    console.log(result.url)

    if (result.revised_prompt) {
      console.log('\n📝 Revised prompt (by DALL-E):')
      console.log(result.revised_prompt)
    }

    // Download the image
    console.log('\n📥 Downloading image...')
    const imageBuffer = await downloadImage(result.url)

    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    // Save the image
    const filename = 'hero.png'
    const filepath = join(outputDir, filename)
    writeFileSync(filepath, imageBuffer)
    console.log(`\n💾 Saved to: ${filepath}`)

    // Generate metadata
    const altText = generateAltText(options.topic)
    const relativePath = `/images/blog/${slug}/${filename}`

    console.log('\n📋 Blog Post Metadata:')
    console.log('----------------------')
    console.log(`image: '${relativePath}'`)
    console.log(`imageAlt: '${altText}'`)

    console.log('\n📄 MDX Frontmatter:')
    console.log('-------------------')
    console.log(`export const metadata = {
  // ... other metadata
  openGraph: {
    images: [{ url: '${relativePath}', alt: '${altText}' }]
  }
}`)

    console.log('\n✨ Done!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
