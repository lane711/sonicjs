// Script to seed production database with 120 content items
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const collections = [
  { id: 'blog-posts-collection', name: 'blog_posts', prefix: 'bp', count: 40 },
  { id: 'pages-collection', name: 'pages', prefix: 'pg', count: 40 },
  { id: 'news-collection', name: 'news', prefix: 'nw', count: 40 }
];

const blogTitles = [
  'Getting Started with SonicJS', 'Understanding Cloudflare Workers', 'Building APIs with Hono',
  'Database Design Patterns', 'Content Management Strategies', 'Performance Optimization Tips',
  'Security Best Practices', 'Modern CSS Techniques', 'JavaScript Design Patterns',
  'TypeScript for Beginners', 'API Versioning Strategies', 'Caching Strategies for Edge Computing',
  'Monitoring and Logging Best Practices', 'Microservices Architecture Guide', 'Serverless Design Patterns',
  'Testing Strategies for Modern Apps', 'Deployment Automation with CI/CD', 'Web Accessibility Guidelines',
  'Building Progressive Web Apps', 'Introduction to GraphQL', 'Docker Basics for Developers',
  'Kubernetes Essentials', 'React Hooks Deep Dive', 'State Management Patterns',
  'Authentication Strategies', 'Data Visualization Techniques', 'Building Real-Time Applications',
  'SEO Optimization Guide', 'Mobile-First Design Approach', 'Error Handling Patterns',
  'Code Review Best Practices', 'Git Workflow Strategies', 'Agile Development Principles',
  'Writing Technical Documentation', 'Web Components Guide', 'Internationalization Best Practices',
  'Web Performance Metrics', 'Database Migration Strategies', 'API Documentation with OpenAPI',
  'Service Workers Guide'
];

const pageTitles = [
  'About Us', 'Contact', 'Pricing', 'Features', 'Documentation',
  'Privacy Policy', 'Terms of Service', 'Careers', 'Partners', 'Case Studies',
  'Security', 'Support', 'Blog', 'API Overview', 'Getting Started',
  'Product Roadmap', 'Changelog', 'Integrations', 'Testimonials', 'Events',
  'Resources', 'Community', 'FAQ', 'Enterprise', 'For Startups',
  'For Developers', 'Education', 'Compliance', 'System Status', 'Glossary',
  'Marketplace', 'Comparison', 'Migration Guide', 'Best Practices', 'Release Notes',
  'Newsletter', 'White Papers', 'Press', 'Investor Relations', 'Sustainability'
];

const newsTitles = [
  'Major Product Launch Announced', 'Series B Funding Round Complete', 'Strategic Partnership with Tech Giant',
  'Company Wins Innovation Award', 'Global Expansion to Europe', 'Major Platform Update Released',
  'SOC 2 Compliance Achieved', '10,000 Customers Milestone', 'Engineering Team Doubles in Size',
  'Platinum Sponsor at TechConf 2024', 'Major Open Source Contribution', 'Enterprise Case Study Released',
  'Monthly Webinar Series Launches', 'API Version 2.0 Released', 'Carbon Neutral Commitment',
  'Mobile App Now Available', 'Integration Marketplace Opens', 'Customer Advisory Board Formed',
  '50% Performance Boost', 'New Enterprise Plan Available', 'GDPR Compliance Certified',
  'Annual Community Summit', 'University Research Partnership', '99.99% Uptime Achievement',
  'Developer Grant Program', 'Hackathon Winners Announced', 'Industry Report Published',
  'Preview of Upcoming Features', 'Customer Success Stories', 'Security Enhancement Release',
  'Pricing Changes Announcement', 'Strategic Acquisition Completed', 'Free Training Program Launch',
  'Professional Certification', 'Asia-Pacific Expansion', 'Accessibility Improvements',
  'Partner Program Expansion', 'New Developer Tools Released', 'Brand Refresh Unveiled',
  '2024 Year in Review'
];

async function seedContent() {
  console.log('🌱 Starting to seed production database...\n');

  let totalInserted = 0;
  const baseTime = Date.now() - (120 * 24 * 60 * 60 * 1000); // Start 120 days ago

  for (const collection of collections) {
    console.log(`📝 Creating ${collection.count} items for ${collection.name}...`);

    const titles = collection.prefix === 'bp' ? blogTitles :
                   collection.prefix === 'pg' ? pageTitles : newsTitles;

    for (let i = 0; i < collection.count; i++) {
      const id = `${collection.prefix}-${String(i + 1).padStart(3, '0')}`;
      const title = titles[i];
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const content = `Learn more about ${title}. This is sample content for demonstration purposes.`;
      const status = (i % 10 === 0) ? 'draft' : 'published'; // 10% draft, 90% published
      const createdAt = baseTime + (i * 24 * 60 * 60 * 1000); // One per day

      const data = JSON.stringify({ content });
      const metaTitle = title;
      const metaDescription = `${title} - Learn more about this topic`;

      const sql = `INSERT INTO content (id, collection_id, slug, title, data, status, meta_title, meta_description, author_id, created_at, updated_at)
                   VALUES ('${id}', '${collection.id}', '${slug}', '${title}', '${data.replace(/'/g, "''")}', '${status}', '${metaTitle}', '${metaDescription}', 'admin-user-id', ${createdAt}, ${createdAt})`;

      try {
        await execAsync(`wrangler d1 execute sonicjs-ai --env production --remote --command "${sql.replace(/"/g, '\\"')}"`);
        totalInserted++;
        process.stdout.write(`\r  ✓ Inserted ${totalInserted}/120 items`);
      } catch (error) {
        console.error(`\n❌ Error inserting ${id}:`, error);
      }
    }
    console.log(`\n✅ Completed ${collection.name}\n`);
  }

  console.log(`\n🎉 Successfully created ${totalInserted} content items in production!`);
}

seedContent().catch(console.error);
