#!/usr/bin/env node

/**
 * Script to populate database with 95 more dummy entries (to reach 100 total)
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';

const blogTitles = [
  "Understanding Cloud Computing", "Building Scalable APIs", "The Rise of Serverless Computing",
  "Cybersecurity Best Practices", "Machine Learning Fundamentals", "Microservices Architecture",
  "DevOps for Small Teams", "Understanding Blockchain", "Mobile-First Design",
  "The Impact of 5G Technology", "Building Accessible Web Apps", "Data Privacy Essentials",
  "JavaScript Framework Evolution", "Cloud Security Guide", "Docker and Containerization",
  "The Art of Code Review", "Agile Development Methods", "Testing Modern Applications",
  "Performance Optimization", "AI in Software Development", "Building Real-time Apps",
  "Database Design Patterns", "API Documentation Best Practices", "Version Control with Git",
  "Continuous Integration Setup", "Monitoring and Logging", "Authentication and Authorization",
  "Scalability Planning", "Error Handling Strategies", "Code Quality Metrics",
  "Progressive Web Apps", "Responsive Design Principles", "Frontend Optimization",
  "Backend Architecture", "Distributed Systems", "Load Balancing Techniques",
  "Caching Strategies", "Message Queues", "Event-Driven Architecture", "Clean Code Principles"
];

const newsHeadlines = [
  "Major Cloud Provider Announces New Services", "Open Source Project Reaches Million Users",
  "AI Startup Raises Series B Funding", "New Privacy Laws Impact Data Collection",
  "Remote Work Trends Continue Evolution", "Green Technology Investment Increases",
  "Semiconductor Shortage Recovery", "Virtual Reality Market Expansion",
  "Edge Computing Adoption Growth", "Renewable Energy Data Centers",
  "Autonomous Vehicle Testing Advances", "Digital Banking Revolution",
  "Quantum Computing Breakthrough", "5G Network Deployment Update",
  "Cybersecurity Threat Analysis", "Tech Industry Merger Activity",
  "Startup Ecosystem Growth", "Digital Transformation Trends",
  "Cloud Migration Statistics", "Developer Tools Innovation"
];

const pageNames = [
  "Privacy Policy", "Terms of Service", "FAQ", "Services Overview", "Team Members",
  "Company History", "Mission Statement", "Product Features", "Pricing Plans",
  "Support Center", "Documentation", "Getting Started Guide", "API Documentation",
  "Security Information", "Careers", "Press Kit", "Partners", "Community Guidelines",
  "Customer Stories", "Case Studies", "White Papers", "Resource Center", "Blog Archive",
  "Newsletter Signup", "Contact Information"
];

function executeSQL(sql) {
  try {
    const tempFile = '/tmp/temp-sql.sql';
    writeFileSync(tempFile, sql);
    
    const result = execSync(`npx wrangler d1 execute sonicjs-dev --local --file="${tempFile}"`, 
      { encoding: 'utf8', stdio: 'pipe' });
    
    unlinkSync(tempFile);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

function createBlogPosts(count) {
  const entries = [];
  const authors = ['admin-user-id', 'author-1', 'author-2'];
  const tags = ['javascript', 'python', 'react', 'nodejs', 'aws', 'docker', 'api'];
  
  for (let i = 1; i <= count; i++) {
    const title = getRandomElement(blogTitles) + ` Part ${i}`;
    const slug = generateSlug(title);
    const author = getRandomElement(authors);
    const status = Math.random() > 0.2 ? 'published' : 'draft';
    const selectedTags = [];
    for (let j = 0; j < Math.floor(Math.random() * 4) + 1; j++) {
      const tag = getRandomElement(tags);
      if (!selectedTags.includes(tag)) selectedTags.push(tag);
    }
    
    entries.push({
      id: randomUUID(),
      collection_id: 'blog-posts-collection',
      slug: slug,
      title: title,
      data: JSON.stringify({
        title: title,
        content: `<p>This is an informative article about ${title.toLowerCase()}.</p><p>It covers important concepts and practical examples for developers.</p><p>Learn the best practices and common patterns used in modern development.</p>`,
        excerpt: `Learn about ${title.toLowerCase()} with practical examples and best practices.`,
        featured_image: `https://picsum.photos/800/400?random=${i + 100}`,
        tags: selectedTags,
        status: status
      }),
      status: status,
      published_at: status === 'published' ? Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      author_id: author,
      created_at: Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000),
      updated_at: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
    });
  }
  
  return entries;
}

function createNewsArticles(count) {
  const entries = [];
  const authors = ['admin-user-id', 'author-1', 'author-2'];
  const categories = ['Technology', 'Business', 'Security', 'Innovation'];
  
  for (let i = 1; i <= count; i++) {
    const title = getRandomElement(newsHeadlines) + ` - ${new Date().getFullYear()}`;
    const slug = generateSlug(title);
    const author = getRandomElement(authors);
    const category = getRandomElement(categories);
    
    entries.push({
      id: randomUUID(),
      collection_id: 'news-collection',
      slug: slug,
      title: title,
      data: JSON.stringify({
        title: title,
        content: `<p>Breaking news in the technology sector.</p><p>Industry experts share insights on the latest developments.</p><p>This story continues to develop as more information becomes available.</p>`,
        publish_date: new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)).toISOString(),
        author: 'News Team',
        category: category
      }),
      status: 'published',
      published_at: Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000),
      author_id: author,
      created_at: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      updated_at: Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)
    });
  }
  
  return entries;
}

function createPages(count) {
  const entries = [];
  const author = 'admin-user-id';
  
  for (let i = 1; i <= count; i++) {
    const title = getRandomElement(pageNames);
    const slug = generateSlug(title);
    
    entries.push({
      id: randomUUID(),
      collection_id: 'pages-collection',
      slug: slug + '-' + i,
      title: title + (i > 1 ? ` ${i}` : ''),
      data: JSON.stringify({
        title: title,
        content: `<p>This is the ${title.toLowerCase()} page.</p><p>It contains important information about our company and services.</p><p>Please read through this content carefully.</p>`,
        slug: slug,
        meta_description: `Learn more about ${title.toLowerCase()} and how it relates to our services.`,
        featured_image: `https://picsum.photos/1200/600?random=${i + 2000}`
      }),
      status: 'published',
      published_at: Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
      author_id: author,
      created_at: Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000),
      updated_at: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }
  
  return entries;
}

async function populateDatabase() {
  console.log('🚀 Starting large batch database population...');
  
  // Create entries: 60 blog posts + 20 news + 15 pages = 95 entries
  const blogEntries = createBlogPosts(60);
  const newsEntries = createNewsArticles(20);
  const pageEntries = createPages(15);
  
  const allEntries = [...blogEntries, ...newsEntries, ...pageEntries];
  console.log(`✅ Generated ${allEntries.length} content entries`);
  
  let successCount = 0;
  let errorCount = 0;
  
  console.log('💾 Inserting into database in batches...');
  
  // Process in smaller batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < allEntries.length; i += batchSize) {
    const batch = allEntries.slice(i, i + batchSize);
    console.log(`   Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allEntries.length/batchSize)}...`);
    
    for (const entry of batch) {
      const publishedAt = entry.published_at ? entry.published_at : 'NULL';
      
      const sql = `INSERT INTO content (id, collection_id, slug, title, data, status, published_at, author_id, created_at, updated_at) 
VALUES ('${entry.id}', '${entry.collection_id}', '${entry.slug}', '${entry.title.replace(/'/g, "''")}', '${entry.data.replace(/'/g, "''")}', '${entry.status}', ${publishedAt}, '${entry.author_id}', ${entry.created_at}, ${entry.updated_at});`;
      
      const result = executeSQL(sql);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        console.log(`   ❌ Failed: ${entry.title} - ${result.error.substring(0, 100)}...`);
      }
    }
    
    // Brief pause between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('');
  console.log('🎉 Large batch population completed!');
  console.log(`✅ Successfully inserted: ${successCount} entries`);
  console.log(`❌ Failed insertions: ${errorCount} entries`);
  
  // Verify final count
  console.log('');
  console.log('🔍 Verifying final database content...');
  const countResult = executeSQL('SELECT COUNT(*) as count FROM content;');
  if (countResult.success) {
    console.log('📈 Total content count:');
    console.log(countResult.result);
  }
  
  // Show breakdown by collection
  const breakdownResult = executeSQL(`
    SELECT collection_id, COUNT(*) as count 
    FROM content 
    GROUP BY collection_id 
    ORDER BY count DESC;
  `);
  if (breakdownResult.success) {
    console.log('📊 Content breakdown by collection:');
    console.log(breakdownResult.result);
  }
}

populateDatabase().catch(console.error);