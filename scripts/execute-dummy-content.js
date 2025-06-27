#!/usr/bin/env node

/**
 * Script to execute dummy content insertion in smaller batches
 * This avoids the SQLite statement length limit
 */

import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

// Sample data arrays for generating realistic content  
const blogTitles = [
  "Getting Started with Modern Web Development",
  "The Future of Artificial Intelligence in Business", 
  "Best Practices for Database Design",
  "Understanding Cloud Computing Architecture",
  "Building Scalable APIs with Node.js",
  "The Rise of Serverless Computing",
  "Cybersecurity Trends to Watch in 2024",
  "Machine Learning for Beginners",
  "Microservices vs Monolithic Architecture",
  "The Power of Progressive Web Apps",
  "DevOps Best Practices for Small Teams",
  "Understanding Blockchain Technology",
  "Mobile-First Design Principles", 
  "The Impact of 5G on IoT Devices",
  "Building Accessible Web Applications",
  "Data Privacy in the Digital Age",
  "The Evolution of JavaScript Frameworks",
  "Cloud Security Best Practices",
  "Introduction to Docker and Containerization",
  "The Art of Code Review",
  "Agile Development Methodologies",
  "Testing Strategies for Modern Applications",
  "Performance Optimization Techniques",
  "The Role of AI in Software Development",
  "Building Real-time Applications"
];

const newsHeadlines = [
  "Tech Industry Sees Record Growth in Q4",
  "New Cybersecurity Regulations Take Effect",
  "Breakthrough in Quantum Computing Research",
  "Major Cloud Provider Announces New Services",
  "Open Source Project Reaches Million Users",
  "AI Startup Raises $50M in Series B Funding",
  "New Privacy Laws Impact Data Collection",
  "Remote Work Trends Continue to Evolve",
  "Green Technology Investment Hits New High",
  "Semiconductor Shortage Shows Signs of Recovery",
  "Virtual Reality Market Expands Rapidly",
  "Edge Computing Adoption Accelerates",
  "Renewable Energy Powers Data Centers",
  "Autonomous Vehicle Testing Advances",
  "Digital Banking Revolution Continues"
];

const pageNames = [
  "About Us", "Contact Information", "Privacy Policy", "Terms of Service", "FAQ",
  "Services Overview", "Team Members", "Company History", "Mission Statement", "Product Features",
  "Pricing Plans", "Support Center", "Documentation", "Getting Started Guide", "API Documentation",
  "Security Information", "Careers", "Press Kit", "Partners", "Community Guidelines"
];

const authors = [
  { id: "author-1", name: "Alice Johnson" },
  { id: "author-2", name: "Bob Smith" },
  { id: "author-3", name: "Carol Davis" },
  { id: "author-4", name: "David Wilson" },
  { id: "author-5", name: "Emma Brown" },
  { id: "admin-user-id", name: "Admin User" }
];

const categories = ["Technology", "Business", "Security", "Development", "AI", "Cloud", "Mobile", "Web"];
const tags = ["javascript", "nodejs", "react", "vue", "angular", "python", "aws", "docker", "kubernetes", "ai", "ml", "blockchain", "security", "api", "database"];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateLoremContent(paragraphs = 3) {
  const sentences = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
    "Deserunt mollit anim id est laborum sed ut perspiciatis unde omnis.",
    "Iste natus error sit voluptatem accusantium doloremque laudantium.",
    "Totam rem aperiam eaque ipsa quae ab illo inventore veritatis.",
    "Et quasi architecto beatae vitae dicta sunt explicabo nemo enim.",
    "Ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit."
  ];
  
  let content = "";
  for (let p = 0; p < paragraphs; p++) {
    let paragraph = "";
    const sentenceCount = Math.floor(Math.random() * 4) + 3;
    
    for (let s = 0; s < sentenceCount; s++) {
      paragraph += getRandomElement(sentences) + " ";
    }
    
    content += `<p>${paragraph.trim()}</p>\\n`;
  }
  
  return content.trim();
}

function generateBlogPost(index) {
  const title = getRandomElement(blogTitles) + ` #${index}`;
  const slug = generateSlug(title);
  const author = getRandomElement(authors);
  const selectedTags = getRandomElements(tags, Math.floor(Math.random() * 5) + 1);
  const status = Math.random() > 0.3 ? 'published' : 'draft';
  
  return {
    id: randomUUID(),
    collection_id: "blog-posts-collection",
    slug: slug,
    title: title.replace(/'/g, "''"),
    data: JSON.stringify({
      title: title,
      content: generateLoremContent(Math.floor(Math.random() * 5) + 2),
      excerpt: "This is a sample excerpt for the blog post. " + generateLoremContent(1).substring(0, 150) + "...",
      featured_image: `https://picsum.photos/800/400?random=${index}`,
      tags: selectedTags,
      status: status
    }).replace(/'/g, "''"),
    status: status,
    published_at: status === 'published' ? Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
    author_id: author.id,
    created_at: Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000),
    updated_at: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
  };
}

function generateNewsArticle(index) {
  const title = getRandomElement(newsHeadlines) + ` - Update ${index}`;
  const slug = generateSlug(title);
  const author = getRandomElement(authors);
  const category = getRandomElement(categories);
  const status = Math.random() > 0.2 ? 'published' : 'draft';
  
  return {
    id: randomUUID(),
    collection_id: "news-collection",
    slug: slug,
    title: title.replace(/'/g, "''"),
    data: JSON.stringify({
      title: title,
      content: generateLoremContent(Math.floor(Math.random() * 4) + 2),
      publish_date: new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)).toISOString(),
      author: author.name,
      category: category
    }).replace(/'/g, "''"),
    status: status,
    published_at: status === 'published' ? Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000) : null,
    author_id: author.id,
    created_at: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    updated_at: Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)
  };
}

function generatePage(index) {
  const title = getRandomElement(pageNames) + (index > pageNames.length ? ` ${index}` : '');
  const slug = generateSlug(title);
  const author = getRandomElement(authors);
  const status = 'published';
  
  return {
    id: randomUUID(),
    collection_id: "pages-collection",
    slug: slug,
    title: title.replace(/'/g, "''"),
    data: JSON.stringify({
      title: title,
      content: generateLoremContent(Math.floor(Math.random() * 6) + 2),
      slug: slug,
      meta_description: `${title} - Learn more about our ${title.toLowerCase()} and how it can help you.`,
      featured_image: `https://picsum.photos/1200/600?random=${index + 1000}`
    }).replace(/'/g, "''"),
    status: status,
    published_at: Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
    author_id: author.id,
    created_at: Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000),
    updated_at: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
  };
}

function executeSQL(sql) {
  try {
    const result = execSync(`npx wrangler d1 execute sonicjs-dev --local --command "${sql}"`, 
      { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function populateDatabase() {
  console.log('🚀 Starting database population with dummy content...');
  
  const entries = [];
  
  // Generate all entries
  console.log('📝 Generating content entries...');
  
  // 60 blog posts
  for (let i = 1; i <= 60; i++) {
    entries.push(generateBlogPost(i));
  }
  
  // 25 news articles  
  for (let i = 1; i <= 25; i++) {
    entries.push(generateNewsArticle(i));
  }
  
  // 15 pages
  for (let i = 1; i <= 15; i++) {
    entries.push(generatePage(i));
  }
  
  console.log(`✅ Generated ${entries.length} content entries`);
  
  // Insert entries one by one
  let successCount = 0;
  let errorCount = 0;
  
  console.log('💾 Inserting into database...');
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const publishedAt = entry.published_at ? entry.published_at : 'NULL';
    
    const sql = `INSERT INTO content (id, collection_id, slug, title, data, status, published_at, author_id, created_at, updated_at) VALUES ('${entry.id}', '${entry.collection_id}', '${entry.slug}', '${entry.title}', '${entry.data}', '${entry.status}', ${publishedAt}, '${entry.author_id}', ${entry.created_at}, ${entry.updated_at})`;
    
    const result = executeSQL(sql);
    
    if (result.success) {
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`   ✅ Inserted ${successCount}/${entries.length} entries...`);
      }
    } else {
      errorCount++;
      console.log(`   ❌ Failed to insert entry ${i + 1}: ${entry.title}`);
      console.log(`      Error: ${result.error}`);
    }
  }
  
  console.log('');
  console.log('🎉 Database population completed!');
  console.log(`✅ Successfully inserted: ${successCount} entries`);
  console.log(`❌ Failed insertions: ${errorCount} entries`);
  console.log(`📊 Total processed: ${entries.length} entries`);
  
  // Verify final count
  console.log('');
  console.log('🔍 Verifying database content...');
  const countResult = executeSQL('SELECT COUNT(*) as count FROM content');
  if (countResult.success) {
    console.log('📈 Current content count in database:');
    console.log(countResult.result);
  }
}

// Run the population
populateDatabase().catch(console.error);