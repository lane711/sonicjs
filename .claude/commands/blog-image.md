# Blog Image Generation Agent (ChatGPT DALL-E)

Generate professional blog post images using OpenAI's DALL-E API for the topic: $ARGUMENTS

## Instructions

This agent generates high-quality, on-brand images for SonicJS blog posts using OpenAI's DALL-E image generation API.

### 1. Image Requirements Analysis

Based on the blog topic provided, determine:
- **Image Type**: Hero image, diagram, illustration, or screenshot mockup
- **Style**: 3D isometric visualization with depth and dimension
- **Color Palette**: Dark slate background (nearly black), electric blue (#3B82F6) glowing elements
- **Dimensions**: 1792x1024px (hero image)

### 2. Prompt Engineering

Create an optimized DALL-E prompt following these guidelines:

**Effective Prompt Structure**:
```
[Style] [Subject] [Setting/Context] [Color/Lighting] [Technical Details]
```

**Example Prompts**:
- "3D isometric visualization of edge computing network, floating platforms with global server nodes connected by glowing circuits, dark slate background nearly black, electric blue (#3B82F6) glowing connections, sophisticated futuristic tech aesthetic, clean geometric shapes, no text, professional enterprise visualization with depth"
- "3D isometric visualization of three-tiered caching architecture, horizontal layers showing memory cache, KV storage, and database with glowing data packets flowing upward, dark slate background nearly black, electric blue accents, futuristic tech aesthetic"
- "3D isometric visualization of content management system, floating content cards connected to central glowing database cylinder with data streams to cloud icons, dark slate background nearly black, electric blue glowing elements"

**Brand Guidelines for SonicJS Images**:
- Background: Dark slate, nearly black (#1E293B or darker)
- Accent color: Electric blue (#3B82F6) for glowing elements and connections
- Style: 3D isometric with depth and dimension, futuristic tech aesthetic
- Avoid: Flat 2D designs, cartoonish elements, light backgrounds, text in images
- Include: Floating platforms, glowing connections, circuit-like patterns, geometric shapes, professional enterprise feel

### 3. API Integration

To generate images, use the OpenAI API with the following approach:

**API Endpoint**: `https://api.openai.com/v1/images/generations`

**Request Format**:
```json
{
  "model": "dall-e-3",
  "prompt": "[Your optimized prompt]",
  "n": 1,
  "size": "1792x1024",
  "quality": "hd",
  "style": "vivid"
}
```

**Headers Required**:
```
Authorization: Bearer $OPENAI_API_KEY
Content-Type: application/json
```

**Implementation Steps**:
1. Construct the prompt based on the blog topic
2. Make the API call to generate the image
3. Download the generated image URL
4. Save to the appropriate location
5. Optimize the image for web (compress if needed)

### 4. File Location

Save generated images to: `www/public/images/blog/[blog-slug]/`

**Naming Convention**:
- Hero image: `hero.webp` or `hero.jpg`
- Supporting images: `[description]-[number].webp`

### 5. Output Deliverables

After generating the image, provide:

1. **Generated Image URL** (temporary, expires in 1 hour)
2. **Suggested Filename**: Following naming convention
3. **Alt Text**: Descriptive, SEO-friendly alt text (125 chars max)
4. **Image Metadata**:
   ```mdx
   // Add to blog post frontmatter:
   image: '/images/blog/[slug]/hero.webp'
   imageAlt: '[Generated alt text]'
   ```
5. **Download Instructions**: How to save and optimize the image

### 6. Prompt Templates by Blog Type

**Tutorial Posts**:
```
3D isometric visualization of [specific technology/concept], floating pathway of connected platforms showing progression, ascending steps with glowing checkpoints, dark slate background nearly black, electric blue (#3B82F6) glowing connections and path markers, sophisticated futuristic tech aesthetic, clean geometric shapes, no text, professional enterprise visualization with depth
```

**Comparison Posts**:
```
3D isometric visualization comparing [Product A] vs [Product B] architectures side by side, left platform showing [concept A], right platform showing [concept B], floating platforms with glowing blue circuit connections, dark slate background nearly black, electric blue (#3B82F6) glowing elements, sophisticated futuristic tech aesthetic, clean geometric shapes, no text, professional enterprise visualization with depth
```

**Technical Deep Dives**:
```
3D isometric visualization of [technical concept], layered architecture with glowing data packets flowing between tiers, interconnected nodes and data flow patterns, dark slate background nearly black, electric blue (#3B82F6) glowing connections, sophisticated futuristic tech aesthetic, clean geometric shapes, no text, professional enterprise visualization with depth
```

**Use Case/Case Study**:
```
3D isometric visualization of [use case scenario], floating content elements connected to central system, data streams flowing to cloud deployment, dark slate background nearly black, electric blue (#3B82F6) glowing elements and connections, sophisticated futuristic tech aesthetic, clean geometric shapes, no text, professional enterprise visualization with depth
```

### 7. Quality Checklist

Before finalizing the image:
- [ ] Image is relevant to blog topic
- [ ] No text in image (DALL-E struggles with text)
- [ ] Colors align with SonicJS brand
- [ ] Composition leaves space for title overlay if needed
- [ ] Image is appropriate for professional tech blog
- [ ] Alt text is descriptive and accessible

### 8. Fallback Options

If DALL-E generation fails or produces unsuitable results:

1. **Retry with modified prompt**: Simplify or clarify the prompt
2. **Alternative sources**: Suggest Unsplash, Pexels for stock alternatives
3. **Placeholder**: Provide solid color gradient matching brand

## Example Usage

```
/blog-image Building a REST API with SonicJS
```

**Generated Prompt**:
"3D isometric visualization of REST API architecture, floating endpoint nodes connected by glowing data pathways, request and response flows between client and server platforms, dark slate background nearly black, electric blue (#3B82F6) glowing connections and data packets, sophisticated futuristic tech aesthetic, clean geometric shapes, no text, professional enterprise visualization with depth"

**Output**:
- Image URL: [temporary URL]
- Filename: `hero.png`
- Alt text: "3D isometric visualization of REST API architecture with connected endpoint nodes and data pathways"

## Environment Setup

Ensure the following environment variable is configured:

```bash
# Add to your environment or .env file
OPENAI_API_KEY=sk-your-api-key-here
```

For Cloudflare Workers deployment, add to `wrangler.toml`:
```toml
[vars]
OPENAI_API_KEY = "sk-your-api-key-here"
```

Or use Cloudflare secrets:
```bash
wrangler secret put OPENAI_API_KEY
```

## Notes

- DALL-E 3 costs approximately $0.040-0.120 per image depending on size/quality
- Generated image URLs expire after 1 hour - download promptly
- For batch generation, consider rate limiting (50 images/minute max)
- Always review generated images for appropriateness before publishing
