import glob from 'fast-glob'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function extractSections(content) {
  // Extract the sections export from MDX content
  const sectionsMatch = content.match(/export\s+const\s+sections\s*=\s*(\[[\s\S]*?\n\])/);
  if (!sectionsMatch) {
    return []
  }

  try {
    // Clean up the sections array for JSON parsing
    const sectionsStr = sectionsMatch[1]
      .replace(/'/g, '"')  // Replace single quotes with double quotes
      .replace(/(\w+):/g, '"$1":')  // Quote property names
      .replace(/,(\s*[\]}])/g, '$1')  // Remove trailing commas
    return JSON.parse(sectionsStr)
  } catch (error) {
    console.warn(`Error parsing sections:`, error.message)
    return []
  }
}

async function generateSections() {
  console.log('Generating allSections.json...')

  const pages = await glob('**/*.mdx', { cwd: 'src/app' })

  const allSectionsEntries = pages.map((filename) => {
    const path = '/' + filename.replace(/(^|\/)page\.mdx$/, '')
    try {
      const content = readFileSync(join(__dirname, '../src/app', filename), 'utf-8')
      const sections = extractSections(content)
      return [path, sections]
    } catch (error) {
      console.warn(`Warning: Could not read ${filename}:`, error.message)
      return [path, []]
    }
  })

  const allSections = Object.fromEntries(allSectionsEntries)

  const outputPath = join(__dirname, '../src/app/allSections.json')
  writeFileSync(outputPath, JSON.stringify(allSections, null, 2))

  console.log(`✅ Generated allSections.json with ${Object.keys(allSections).length} routes`)
}

generateSections().catch(console.error)
