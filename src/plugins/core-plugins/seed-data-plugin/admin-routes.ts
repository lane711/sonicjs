import { Hono } from 'hono'
import { SeedDataService } from './services/seed-data-service'

export function createSeedDataAdminRoutes() {
  const routes = new Hono()

  // Get seed data status/info
  routes.get('/', async (c) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Seed Data - SonicJS Admin</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f5f5f5;
              padding: 2rem;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              padding: 2rem;
            }
            h1 {
              color: #333;
              margin-bottom: 1rem;
              font-size: 2rem;
            }
            .description {
              color: #666;
              margin-bottom: 2rem;
              line-height: 1.6;
            }
            .card {
              background: #f9f9f9;
              border-radius: 6px;
              padding: 1.5rem;
              margin-bottom: 1.5rem;
            }
            .card h2 {
              color: #333;
              font-size: 1.25rem;
              margin-bottom: 0.75rem;
            }
            .card p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 1rem;
            }
            .card ul {
              color: #666;
              margin-left: 1.5rem;
              margin-bottom: 1rem;
            }
            .card li {
              margin-bottom: 0.5rem;
            }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 6px;
              font-size: 1rem;
              cursor: pointer;
              transition: background 0.2s;
            }
            button:hover {
              background: #2563eb;
            }
            button:disabled {
              background: #94a3b8;
              cursor: not-allowed;
            }
            .danger {
              background: #ef4444;
            }
            .danger:hover {
              background: #dc2626;
            }
            .warning {
              background: #f59e0b;
              color: #fff;
              padding: 1rem;
              border-radius: 6px;
              margin-bottom: 1.5rem;
            }
            .success {
              background: #10b981;
              color: #fff;
              padding: 1rem;
              border-radius: 6px;
              margin-bottom: 1.5rem;
              display: none;
            }
            .error {
              background: #ef4444;
              color: #fff;
              padding: 1rem;
              border-radius: 6px;
              margin-bottom: 1.5rem;
              display: none;
            }
            .loading {
              display: none;
              margin-left: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌱 Seed Data Generator</h1>
            <p class="description">
              Generate realistic example data for testing and development. This will create 20 users and 200 content items with realistic data.
            </p>

            <div class="warning">
              <strong>⚠️ Warning:</strong> This will create new data in your database. Make sure you're not running this in production!
            </div>

            <div class="success" id="successMessage"></div>
            <div class="error" id="errorMessage"></div>

            <div class="card">
              <h2>What will be created?</h2>
              <ul>
                <li><strong>20 Users:</strong> With realistic names, emails, and various roles (admin, editor, author, viewer)</li>
                <li><strong>200 Content Items:</strong> Including blog posts, pages, and products with realistic titles and data</li>
                <li><strong>All passwords:</strong> Set to "password123" for testing</li>
                <li><strong>Random dates:</strong> Created within the last year</li>
                <li><strong>Various statuses:</strong> Draft, published, and archived content</li>
              </ul>
            </div>

            <div class="card">
              <h2>Generate Seed Data</h2>
              <p>Click the button below to generate example data. This may take a few moments.</p>
              <button id="seedButton" onclick="generateSeedData()">
                Generate Data
                <span class="loading" id="loading">...</span>
              </button>
            </div>

            <div class="card">
              <h2>Clear Seed Data</h2>
              <p>Remove all users and content from the database (except admin users).</p>
              <button class="danger" id="clearButton" onclick="clearSeedData()">
                Clear All Data
                <span class="loading" id="clearLoading">...</span>
              </button>
            </div>
          </div>

          <script>
            async function generateSeedData() {
              const button = document.getElementById('seedButton');
              const loading = document.getElementById('loading');
              const success = document.getElementById('successMessage');
              const error = document.getElementById('errorMessage');

              button.disabled = true;
              loading.style.display = 'inline';
              success.style.display = 'none';
              error.style.display = 'none';

              try {
                const response = await fetch('/admin/seed-data/generate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                });

                const data = await response.json();

                if (response.ok) {
                  success.textContent = \`✅ Successfully created \${data.users} users and \${data.content} content items!\`;
                  success.style.display = 'block';
                } else {
                  throw new Error(data.error || 'Failed to generate seed data');
                }
              } catch (err) {
                error.textContent = \`❌ Error: \${err.message}\`;
                error.style.display = 'block';
              } finally {
                button.disabled = false;
                loading.style.display = 'none';
              }
            }

            async function clearSeedData() {
              if (!confirm('Are you sure you want to clear all data? This cannot be undone!')) {
                return;
              }

              const button = document.getElementById('clearButton');
              const loading = document.getElementById('clearLoading');
              const success = document.getElementById('successMessage');
              const error = document.getElementById('errorMessage');

              button.disabled = true;
              loading.style.display = 'inline';
              success.style.display = 'none';
              error.style.display = 'none';

              try {
                const response = await fetch('/admin/seed-data/clear', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                });

                const data = await response.json();

                if (response.ok) {
                  success.textContent = '✅ Successfully cleared all seed data!';
                  success.style.display = 'block';
                } else {
                  throw new Error(data.error || 'Failed to clear seed data');
                }
              } catch (err) {
                error.textContent = \`❌ Error: \${err.message}\`;
                error.style.display = 'block';
              } finally {
                button.disabled = false;
                loading.style.display = 'none';
              }
            }
          </script>
        </body>
      </html>
    `
    return c.html(html)
  })

  // Generate seed data
  routes.post('/generate', async (c) => {
    try {
      const db = c.get('db')
      const seedService = new SeedDataService(db)

      const result = await seedService.seedAll()

      return c.json({
        success: true,
        users: result.users,
        content: result.content
      })
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message
      }, 500)
    }
  })

  // Clear seed data
  routes.post('/clear', async (c) => {
    try {
      const db = c.get('db')
      const seedService = new SeedDataService(db)

      await seedService.clearSeedData()

      return c.json({
        success: true
      })
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message
      }, 500)
    }
  })

  return routes
}
