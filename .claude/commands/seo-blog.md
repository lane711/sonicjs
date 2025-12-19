# Generate SEO-Optimized Blog Post

Generate a high-quality, SEO-optimized blog post for SonicJS on the topic: $ARGUMENTS

## Instructions

1. **Research Phase**:
   - Search the web for current trends and competitor content on this topic
   - Identify the primary keyword and 3-5 secondary keywords
   - Find the search intent (informational, transactional, navigational)

2. **Content Creation**:
   - Write a comprehensive blog post (1500-2500 words)
   - Use proper heading hierarchy (H1 > H2 > H3)
   - **IMPORTANT**: Include a TL;DR box with Key Stats immediately after the H1 (see format below)
   - Include code examples where relevant (use SonicJS syntax)
   - Add internal links to SonicJS documentation
   - Include a clear call-to-action

3. **TL;DR Box (Required for Featured Snippets)**:
   Place this immediately after the H1 title:
   ```markdown
   > **TL;DR** — [2-3 sentence summary directly answering the main question]
   >
   > **Key Stats:**
   > - [Specific number/metric - e.g., "Under 50ms response time globally"]
   > - [Specific number/metric - e.g., "Zero cold starts with V8 isolates"]
   > - [Specific number/metric - e.g., "300+ edge locations worldwide"]
   ```

   **Why this matters:**
   - Featured snippets can increase CTR by 8.6%
   - AI Overviews (Google SGE) extract from concise summaries
   - Voice search prefers 2-3 sentence answers
   - 35% increase in AI visibility reported with TL;DR sections

4. **SEO Elements**:
   - Meta title (50-60 characters)
   - Meta description (150-160 characters)
   - URL slug (lowercase, hyphenated)
   - OpenGraph tags
   - Target keyword density: 1-2%

5. **Output Format**:
   Create the blog post as an MDX file with frontmatter metadata.

## File Location

Create the file at: `www/src/app/blog/[generated-slug]/page.mdx`

Or if blog directory doesn't exist, create: `www/src/content/blog/[generated-slug].mdx`

## Content Guidelines

- Write for developers (technical audience)
- Be specific and actionable
- Include working code examples
- Reference official SonicJS features accurately
- Compare fairly with competitors (when relevant)
- End with next steps or call-to-action

## Example Topics

- "Building a REST API with SonicJS in 10 Minutes"
- "SonicJS vs Strapi: Which Headless CMS Should You Choose?"
- "How to Deploy SonicJS to Cloudflare Workers"
- "Creating Custom Collections in SonicJS"
- "SonicJS Authentication: A Complete Guide"
