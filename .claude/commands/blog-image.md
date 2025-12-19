# Blog Image Generation Agent (ChatGPT DALL-E)

Generate professional blog post images using OpenAI's DALL-E API for the topic: $ARGUMENTS

## Instructions

This agent generates high-quality, on-brand images for SonicJS blog posts using OpenAI's DALL-E image generation API.

### 1. Image Requirements Analysis

Based on the blog topic provided, determine:
- **Image Type**: Hero image, diagram, illustration, or screenshot mockup
- **Style**: Modern tech aesthetic, clean lines, professional
- **Color Palette**: SonicJS brand colors (blue gradients, dark backgrounds, white accents)
- **Dimensions**: 1200x630px (OpenGraph standard) or 1600x900px (hero image)

### 2. Prompt Engineering

Create an optimized DALL-E prompt following these guidelines:

**Effective Prompt Structure**:
```
[Style] [Subject] [Setting/Context] [Color/Lighting] [Technical Details]
```

**Example Prompts**:
- "Modern minimalist tech illustration of cloud computing with edge servers, blue gradient background, geometric shapes, professional business style, clean vector art"
- "Abstract digital art showing data flowing through a global network, dark background with glowing blue nodes, futuristic tech aesthetic, 3D render"
- "Isometric illustration of a developer workspace with code on screens showing CMS dashboard, soft lighting, modern flat design style"

**Brand Guidelines for SonicJS Images**:
- Primary colors: #3B82F6 (blue), #1E293B (dark slate), #F8FAFC (light)
- Style: Modern, minimalist, tech-forward
- Avoid: Cartoonish elements, stock photo clichés, cluttered compositions
- Include: Clean typography space, professional atmosphere, development/cloud themes

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
Modern illustration showing [specific technology/concept], step-by-step visual guide aesthetic, clean flat design, blue and white color scheme, developer-friendly, educational infographic style
```

**Comparison Posts**:
```
Split-screen tech comparison visualization, [Product A] vs [Product B] concept, balanced composition, professional analysis theme, modern gradient background, corporate presentation style
```

**Technical Deep Dives**:
```
Abstract representation of [technical concept], architectural diagram style, interconnected nodes and data flow, dark theme with glowing accents, sophisticated tech aesthetic
```

**Use Case/Case Study**:
```
Professional business scenario illustration showing [use case], modern office/tech environment, success-oriented imagery, warm professional lighting, corporate but approachable
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
"Modern minimalist illustration of REST API architecture, interconnected endpoints and data nodes, blueprint-style technical diagram, blue gradient on dark background, clean vector art style, professional developer documentation aesthetic"

**Output**:
- Image URL: [temporary URL]
- Filename: `rest-api-hero.webp`
- Alt text: "Illustration of REST API architecture showing interconnected endpoints and data flow patterns"

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
