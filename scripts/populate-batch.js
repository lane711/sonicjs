#!/usr/bin/env node

/**
 * Simple script to populate database with a few dummy entries to test
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';

function executeSQL(sql) {
  try {
    // Write SQL to temp file
    const tempFile = '/tmp/temp-sql.sql';
    writeFileSync(tempFile, sql);
    
    const result = execSync(`npx wrangler d1 execute sonicjs-dev --local --file="${tempFile}"`, 
      { encoding: 'utf8', stdio: 'pipe' });
    
    // Clean up temp file
    unlinkSync(tempFile);
    
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function createSimpleContent() {
  const entries = [
    {
      id: randomUUID(),
      collection_id: 'blog-posts-collection',
      slug: 'getting-started-with-modern-web-dev',
      title: 'Getting Started with Modern Web Development',
      data: JSON.stringify({
        title: 'Getting Started with Modern Web Development',
        content: '<p>This is a comprehensive guide to modern web development practices.</p><p>Learn about the latest frameworks, tools, and techniques used by professional developers.</p>',
        excerpt: 'A comprehensive guide to modern web development practices and tools.',
        featured_image: 'https://picsum.photos/800/400?random=1',
        tags: ['javascript', 'react', 'nodejs'],
        status: 'published'
      }),
      status: 'published',
      published_at: Date.now() - 86400000, // 1 day ago
      author_id: 'admin-user-id',
      created_at: Date.now() - 172800000, // 2 days ago
      updated_at: Date.now() - 86400000
    },
    {
      id: randomUUID(),
      collection_id: 'blog-posts-collection',
      slug: 'intro-to-ai-and-machine-learning',
      title: 'Introduction to AI and Machine Learning',
      data: JSON.stringify({
        title: 'Introduction to AI and Machine Learning',
        content: '<p>Artificial Intelligence and Machine Learning are transforming industries worldwide.</p><p>This post explores the fundamentals and practical applications.</p>',
        excerpt: 'Explore the fundamentals of AI and ML and their practical applications.',
        featured_image: 'https://picsum.photos/800/400?random=2',
        tags: ['ai', 'ml', 'python'],
        status: 'published'
      }),
      status: 'published',
      published_at: Date.now() - 259200000, // 3 days ago
      author_id: 'admin-user-id',
      created_at: Date.now() - 345600000, // 4 days ago
      updated_at: Date.now() - 259200000
    },
    {
      id: randomUUID(),
      collection_id: 'news-collection',
      slug: 'tech-industry-growth-q4',
      title: 'Tech Industry Sees Record Growth in Q4',
      data: JSON.stringify({
        title: 'Tech Industry Sees Record Growth in Q4',
        content: '<p>The technology sector has reported unprecedented growth in the fourth quarter.</p><p>Major companies are expanding their workforce and investing in new technologies.</p>',
        publish_date: new Date(Date.now() - 86400000).toISOString(),
        author: 'News Team',
        category: 'Technology'
      }),
      status: 'published',
      published_at: Date.now() - 86400000,
      author_id: 'admin-user-id',
      created_at: Date.now() - 172800000,
      updated_at: Date.now() - 86400000
    },
    {
      id: randomUUID(),
      collection_id: 'pages-collection',
      slug: 'about-us',
      title: 'About Us',
      data: JSON.stringify({
        title: 'About Us',
        content: '<p>We are a leading technology company focused on innovation and excellence.</p><p>Our team of experts delivers cutting-edge solutions to businesses worldwide.</p>',
        slug: 'about-us',
        meta_description: 'Learn more about our company, mission, and the talented team behind our success.',
        featured_image: 'https://picsum.photos/1200/600?random=1000'
      }),
      status: 'published',
      published_at: Date.now() - 2592000000, // 30 days ago
      author_id: 'admin-user-id',
      created_at: Date.now() - 5184000000, // 60 days ago
      updated_at: Date.now() - 1296000000 // 15 days ago
    },
    {
      id: randomUUID(),
      collection_id: 'pages-collection',
      slug: 'contact-us',
      title: 'Contact Us',
      data: JSON.stringify({
        title: 'Contact Us',
        content: '<p>Get in touch with our team for any questions or support needs.</p><p>We are here to help you succeed with our products and services.</p>',
        slug: 'contact-us',
        meta_description: 'Contact our support team for assistance with our products and services.',
        featured_image: 'https://picsum.photos/1200/600?random=1001'
      }),
      status: 'published',
      published_at: Date.now() - 2592000000,
      author_id: 'admin-user-id',
      created_at: Date.now() - 5184000000,
      updated_at: Date.now() - 1296000000
    }
  ];
  
  return entries;
}

async function populateDatabase() {
  console.log('🚀 Starting database population with sample content...');
  
  const entries = createSimpleContent();
  console.log(`✅ Generated ${entries.length} content entries`);
  
  let successCount = 0;
  let errorCount = 0;
  
  console.log('💾 Inserting into database...');
  
  for (const entry of entries) {
    const publishedAt = entry.published_at ? entry.published_at : 'NULL';
    
    const sql = `INSERT INTO content (id, collection_id, slug, title, data, status, published_at, author_id, created_at, updated_at) 
VALUES ('${entry.id}', '${entry.collection_id}', '${entry.slug}', '${entry.title.replace(/'/g, "''")}', '${entry.data.replace(/'/g, "''")}', '${entry.status}', ${publishedAt}, '${entry.author_id}', ${entry.created_at}, ${entry.updated_at});`;
    
    const result = executeSQL(sql);
    
    if (result.success) {
      successCount++;
      console.log(`   ✅ Inserted: ${entry.title}`);
    } else {
      errorCount++;
      console.log(`   ❌ Failed: ${entry.title}`);
      console.log(`      Error: ${result.error}`);
    }
  }
  
  console.log('');
  console.log('🎉 Database population completed!');
  console.log(`✅ Successfully inserted: ${successCount} entries`);
  console.log(`❌ Failed insertions: ${errorCount} entries`);
  
  // Verify final count
  console.log('');
  console.log('🔍 Verifying database content...');
  const countResult = executeSQL('SELECT COUNT(*) as count FROM content;');
  if (countResult.success) {
    console.log('📈 Current content count:');
    console.log(countResult.result);
  }
}

populateDatabase().catch(console.error);