import { eq } from 'drizzle-orm'
import { users, content, collections } from '../../../../db/schema'
// import bcrypt from 'bcryptjs' // TODO: Install bcryptjs or use alternative

export class SeedDataService {
  constructor(private db: any) {}

  // First names for generating realistic users
  private firstNames = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
    'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
    'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'
  ]

  // Last names for generating realistic users
  private lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
  ]

  // Content titles for blog posts
  private blogTitles = [
    'Getting Started with Modern Web Development',
    'The Future of JavaScript Frameworks',
    'Building Scalable Applications with Microservices',
    'Understanding TypeScript: A Complete Guide',
    'Best Practices for API Design',
    'Introduction to Cloud Computing',
    'Mastering Git and Version Control',
    'The Art of Code Review',
    'Performance Optimization Techniques',
    'Security Best Practices for Web Apps',
    'Exploring Serverless Architecture',
    'Database Design Fundamentals',
    'Testing Strategies for Modern Apps',
    'CI/CD Pipeline Implementation',
    'Mobile-First Development Approach'
  ]

  // Content titles for pages
  private pageTitles = [
    'About Us', 'Contact', 'Privacy Policy', 'Terms of Service',
    'FAQ', 'Our Team', 'Careers', 'Press Kit',
    'Support', 'Documentation', 'Pricing', 'Features'
  ]

  // Content titles for products
  private productTitles = [
    'Premium Wireless Headphones',
    'Smart Watch Pro',
    'Laptop Stand Adjustable',
    'Mechanical Keyboard RGB',
    'HD Webcam 4K',
    'USB-C Hub 7-in-1',
    'Portable SSD 1TB',
    'Wireless Mouse Ergonomic',
    'Monitor 27" 4K',
    'Desk Lamp LED',
    'Phone Case Premium',
    'Tablet Stand Aluminum',
    'Cable Management Kit',
    'Power Bank 20000mAh',
    'Bluetooth Speaker Portable'
  ]

  // Content for generating blog posts
  private blogContent = [
    'This comprehensive guide covers everything you need to know about modern development practices and tools.',
    'Learn the fundamentals and advanced concepts that will help you build better applications.',
    'Discover the latest trends and best practices used by industry professionals.',
    'A deep dive into the technologies and methodologies shaping the future of software development.',
    'Practical tips and real-world examples to improve your development workflow.',
    'Explore cutting-edge techniques and proven strategies for building robust applications.',
    'Master the essential skills needed to excel in modern software development.',
    'An in-depth look at the tools and frameworks that power today\'s web applications.',
    'Step-by-step instructions and expert insights for developers of all levels.',
    'Understanding the core principles that drive successful software projects.'
  ]

  // Generate a random ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Generate a slug from a title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Generate random date within the last year
  private randomDate(): Date {
    const now = new Date()
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const randomTime = yearAgo.getTime() + Math.random() * (now.getTime() - yearAgo.getTime())
    return new Date(randomTime)
  }

  // Create 20 example users
  async createUsers(): Promise<void> {
    const roles = ['admin', 'editor', 'author', 'viewer']
    // const hashedPassword = await bcrypt.hash('password123', 10)
    const hashedPassword = 'password123' // TODO: Use actual bcrypt hash

    for (let i = 0; i < 20; i++) {
      const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)]
      const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)]
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`
      const email = `${username}@example.com`
      const createdAt = this.randomDate()

      await this.db.insert(users).values({
        id: this.generateId(),
        email,
        username,
        firstName,
        lastName,
        passwordHash: hashedPassword,
        role: roles[Math.floor(Math.random() * roles.length)],
        isActive: Math.random() > 0.1, // 90% active
        lastLoginAt: Math.random() > 0.3 ? Math.floor(createdAt.getTime() / 1000) : null,
        createdAt: Math.floor(createdAt.getTime() / 1000),
        updatedAt: Math.floor(createdAt.getTime() / 1000),
      })
    }
  }

  // Create 200 content items across different types
  async createContent(): Promise<void> {
    // Get all users and collections
    const allUsers = await this.db.select().from(users)
    const allCollections = await this.db.select().from(collections)

    if (allUsers.length === 0) {
      throw new Error('No users found. Please create users first.')
    }

    if (allCollections.length === 0) {
      throw new Error('No collections found. Please create collections first.')
    }

    const statuses = ['draft', 'published', 'archived']

    // Create 200 content items
    for (let i = 0; i < 200; i++) {
      const collection = allCollections[Math.floor(Math.random() * allCollections.length)]
      const author = allUsers[Math.floor(Math.random() * allUsers.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      let title: string
      let contentData: any

      // Generate content based on collection type
      if (collection.name === 'blog_posts' || collection.name.includes('blog')) {
        title = this.blogTitles[Math.floor(Math.random() * this.blogTitles.length)]
        contentData = {
          body: this.blogContent[Math.floor(Math.random() * this.blogContent.length)],
          excerpt: 'A brief introduction to this article that provides an overview of the main topics covered.',
          tags: this.generateTags(),
          featured: Math.random() > 0.7
        }
      } else if (collection.name === 'pages' || collection.name.includes('page')) {
        title = this.pageTitles[Math.floor(Math.random() * this.pageTitles.length)]
        contentData = {
          body: 'This is a standard page with important information about our services and policies.',
          template: 'default',
          showInMenu: Math.random() > 0.5
        }
      } else if (collection.name === 'products' || collection.name.includes('product')) {
        title = this.productTitles[Math.floor(Math.random() * this.productTitles.length)]
        contentData = {
          description: 'High-quality product with excellent features and great value for money.',
          price: (Math.random() * 500 + 10).toFixed(2),
          sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          inStock: Math.random() > 0.2,
          rating: (Math.random() * 2 + 3).toFixed(1) // 3.0 - 5.0
        }
      } else {
        // Generic content
        title = `${collection.displayName} Item ${i + 1}`
        contentData = {
          description: 'This is a sample content item with generic data.',
          value: Math.floor(Math.random() * 1000)
        }
      }

      const slug = `${this.generateSlug(title)}-${i}`
      const createdAt = this.randomDate()
      const publishedAt = status === 'published' ? createdAt : null

      await this.db.insert(content).values({
        id: this.generateId(),
        collectionId: collection.id,
        slug,
        title: `${title} ${i}`,
        data: contentData,
        status,
        publishedAt,
        authorId: author.id,
        createdAt,
        updatedAt: createdAt,
      })
    }
  }

  // Generate random tags for blog posts
  private generateTags(): string[] {
    const allTags = [
      'tutorial', 'guide', 'javascript', 'typescript', 'web-dev',
      'backend', 'frontend', 'best-practices', 'security', 'performance',
      'testing', 'deployment', 'cloud', 'database', 'api'
    ]

    const numTags = Math.floor(Math.random() * 4) + 1 // 1-4 tags
    const shuffled = allTags.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, numTags)
  }

  // Seed all data
  async seedAll(): Promise<{ users: number; content: number }> {
    await this.createUsers()
    await this.createContent()

    const userCount = await this.db.select().from(users)
    const contentCount = await this.db.select().from(content)

    return {
      users: userCount.length,
      content: contentCount.length
    }
  }

  // Clear all seed data (optional cleanup method)
  async clearSeedData(): Promise<void> {
    // Delete content first (due to foreign key constraints)
    await this.db.delete(content)

    // Delete users (but keep the admin user if it exists)
    await this.db.delete(users).where(
      eq(users.email, 'admin@example.com') // Keep admin
    )
  }
}
