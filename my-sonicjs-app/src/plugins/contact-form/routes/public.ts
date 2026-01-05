import { Hono } from 'hono'
import { html } from 'hono/html'
import type { Context } from 'hono'
import { ContactService } from '../services/contact'

const publicRoutes = new Hono()

/**
 * GET /contact
 * Display the public contact form
 */
publicRoutes.get('/contact', async (c: any) => {
  try {
    // Get DB from context
    const db = c.get('db') || c.env?.DB
    if (!db) {
      return c.html('<h1>Service temporarily unavailable</h1>', 503)
    }

    const service = new ContactService(db)
    const { status, data: settings } = await service.getSettings()

    // For testing: Allow form to work even if not activated
    // TODO: Remove this after proper plugin activation
    // if (status !== 'active') {
    //   return c.text('Contact form is currently disabled.', 503)
    // }

  const company = settings.companyName || 'My Company'
  const street = settings.address || '123 Web Dev Lane'
  const city = settings.city || ''
  const state = settings.state || ''
  const description = settings.description || ''
  const phone = settings.phoneNumber || '555-0199'
  const apiKey = settings.mapApiKey || ''
  
  const fullAddressDisplay = city ? `${street}, ${city}, ${state}` : street
  const isEnabled = settings.showMap === 1 || settings.showMap === true || settings.showMap === 'true' || settings.showMap === 'on'
  const hasKey = apiKey && apiKey.length > 5
  const showMap = isEnabled && hasKey
  const mapQuery = `${street} ${city} ${state}`
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(mapQuery)}`

  return c.html(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Contact ${company}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <h1 class="mb-4">Contact ${company}</h1>
            ${description ? html`<div class="lead mb-4 text-muted">${description}</div>` : ''}
            <p class="text-muted mb-4">
               <strong>📍 Address:</strong> ${fullAddressDisplay} <br>
               <strong>📞 Phone:</strong> ${phone}
            </p>
            ${showMap ? html`<div class="ratio ratio-16x9 mb-4 border rounded shadow-sm"><iframe src="${mapSrc}" style="border:0" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ''}
            ${isEnabled && !hasKey ? html`<div class="alert alert-warning">⚠️ Map is enabled but API Key is missing.</div>` : ''}
            <div id="success-alert" class="alert alert-success d-none">Message sent!</div>
            <form id="cf" class="card p-4 shadow-sm mt-4">
               <div class="mb-3"><label class="form-label">Name</label><input type="text" name="name" class="form-control" required></div>
               <div class="mb-3"><label class="form-label">Email</label><input type="email" name="email" class="form-control" required></div>
               <div class="mb-3"><label class="form-label">Message</label><textarea name="msg" class="form-control" rows="5" required></textarea></div>
               <button class="btn btn-primary">Send Message</button>
            </form>
            <a href="/" class="btn btn-link mt-3">← Back Home</a>
          </div>
        </div>
        <script>
          document.getElementById('cf').addEventListener('submit', async(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            const r = await fetch('/api/contact', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(data)
            });
            
            const res = await r.json();
            
            if (res.success) {
              document.getElementById('success-alert').classList.remove('d-none');
              e.target.reset();
              setTimeout(() => document.getElementById('success-alert').classList.add('d-none'), 5000);
            } else {
              alert('Error sending message: ' + (res.message || res.error || 'Please try again.'));
            }
          });
        </script>
      </body>
    </html>
  `)
  } catch (error) {
    console.error('Error rendering contact page:', error)
    return c.html('<h1>Error loading contact form</h1>', 500)
  }
})

/**
 * POST /api/contact
 * Submit a contact form message
 */
publicRoutes.post('/api/contact', async (c: any) => {
  try {
    // Get DB from context
    const db = c.get('db') || c.env?.DB
    if (!db) {
      return c.json({ success: false, error: 'Service unavailable' }, 503)
    }

    const service = new ContactService(db)
    
    // Get request data
    let data: any = {}
    const contentType = c.req.header('content-type') || ''
    
    if (contentType.includes('application/json')) {
      data = await c.req.json()
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      formData.forEach((value, key) => {
        data[key] = value;
      });
    }
    
    // Basic validation
    if (!data.name || !data.email || !data.msg) {
      return c.json({ 
        success: false, 
        error: 'All fields are required' 
      }, 400)
    }

    await service.saveMessage(data)
    
    return c.json({ 
      success: true, 
      message: 'Message sent successfully' 
    })
  } catch (error) {
    console.error('Error saving contact message:', error)
    return c.json({ 
      success: false, 
      error: 'Failed to send message' 
    }, 500)
  }
})

export default publicRoutes
