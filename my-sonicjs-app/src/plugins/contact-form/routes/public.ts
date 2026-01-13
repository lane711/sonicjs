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
  
  // Defensive: Ensure values are strings, not undefined
  const safeStreet = String(street || '123 Web Dev Lane')
  const safeCity = String(city || 'Baltimore')
  const safeState = String(state || 'MD')
  
  const fullAddressDisplay = city ? `${street}, ${city}, ${state}` : street
  const isEnabled = settings.showMap === 1 || settings.showMap === true || settings.showMap === 'true' || settings.showMap === 'on'
  const hasKey = apiKey && apiKey.length > 5
  
  // Only show map if we have valid address data (prevent "undefined undefined" in URL)
  const hasValidAddress = city && city !== 'undefined' && city.length > 0
  const showMap = isEnabled && hasKey && hasValidAddress
  
  console.log('[Contact Form Public] settings.showMap:', settings.showMap, 'type:', typeof settings.showMap)
  console.log('[Contact Form Public] isEnabled:', isEnabled, 'hasKey:', hasKey, 'showMap:', showMap)
  console.log('[Contact Form Public] apiKey length:', apiKey.length, 'city:', city)
  
  // Use safe values for map query to prevent "undefined undefined" in URL
  const mapQuery = `${safeStreet} ${safeCity} ${safeState}`.trim()
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(mapQuery)}`

  // Check if Turnstile is enabled and available
  const useTurnstile = settings.useTurnstile === 1 || settings.useTurnstile === true || settings.useTurnstile === 'true' || settings.useTurnstile === 'on'
  let turnstileSiteKey = ''
  let turnstileEnabled = false
  let turnstileTheme = 'auto'
  let turnstileSize = 'normal'
  let turnstileMode = 'managed'
  let turnstileAppearance = 'always'
  
  if (useTurnstile) {
    try {
      const turnstilePlugin = await db
        .prepare(`SELECT settings, status FROM plugins WHERE id = ? AND status = 'active'`)
        .bind('turnstile')
        .first()
      
      if (turnstilePlugin && turnstilePlugin.settings) {
        const turnstileSettings = JSON.parse(turnstilePlugin.settings as string)
        turnstileSiteKey = turnstileSettings.siteKey || ''
        turnstileEnabled = turnstileSettings.enabled && turnstileSiteKey.length > 0
        turnstileTheme = turnstileSettings.theme || 'auto'
        turnstileSize = turnstileSettings.size || 'normal'
        turnstileMode = turnstileSettings.mode || 'managed'
        turnstileAppearance = turnstileSettings.appearance || 'always'
      }
    } catch (error) {
      console.log('Turnstile plugin not available:', error)
    }
  }

  return c.html(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Contact ${company}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        ${turnstileEnabled ? html`<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` : ''}
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
               ${turnstileEnabled ? html`
               <div class="cf-turnstile mb-3" 
                    data-sitekey="${turnstileSiteKey}"
                    data-theme="${turnstileTheme}"
                    data-size="${turnstileSize}"
                    data-appearance="${turnstileAppearance}"
                    data-execution="render"></div>
               ` : ''}
               <button class="btn btn-primary">Send Message</button>
            </form>
            <a href="/" class="btn btn-link mt-3">← Back Home</a>
          </div>
        </div>
        <script>
          const turnstileEnabled = ${turnstileEnabled ? 'true' : 'false'};
          document.getElementById('cf').addEventListener('submit', async(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            // Add Turnstile token if enabled
            if (turnstileEnabled) {
              const turnstileWidget = document.querySelector('.cf-turnstile');
              if (turnstileWidget) {
                const turnstileResponse = turnstile.getResponse(turnstileWidget);
                if (!turnstileResponse) {
                  alert('Please complete the security check');
                  return;
                }
                data['cf-turnstile-response'] = turnstileResponse;
              }
            }
            
            try {
              const r = await fetch('/api/contact', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
              });
              
              console.log('Response status:', r.status);
              const res = await r.json();
              console.log('Response data:', res);
              
              if (res.success) {
                console.log('Showing success message');
                const successAlert = document.getElementById('success-alert');
                if (successAlert) {
                  successAlert.classList.remove('d-none');
                  console.log('Success alert classes:', successAlert.className);
                }
                e.target.reset();
                if (turnstileEnabled && window.turnstile) {
                  turnstile.reset();
                }
                setTimeout(() => {
                  if (successAlert) {
                    successAlert.classList.add('d-none');
                  }
                }, 5000);
              } else {
                console.error('Error response:', res);
                alert('Error sending message: ' + (res.message || res.error || 'Please try again.'));
              }
            } catch (error) {
              console.error('Fetch error:', error);
              alert('Error sending message. Please try again.');
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

    // Check if Turnstile is enabled for this form
    const { data: settings } = await service.getSettings()
    const useTurnstile = settings.useTurnstile === 1 || settings.useTurnstile === true || settings.useTurnstile === 'true' || settings.useTurnstile === 'on'
    
    if (useTurnstile) {
      // Verify Turnstile token if enabled
      const token = data['cf-turnstile-response']
      
      if (!token) {
        return c.json({
          success: false,
          error: 'Security verification required'
        }, 400)
      }
      
      try {
        // Get Turnstile plugin settings
        const turnstilePlugin = await db
          .prepare(`SELECT settings FROM plugins WHERE id = ? AND status = 'active'`)
          .bind('turnstile')
          .first()
        
        if (!turnstilePlugin || !turnstilePlugin.settings) {
          console.error('Turnstile plugin not available or not configured')
          return c.json({
            success: false,
            error: 'Security verification unavailable'
          }, 500)
        }
        
        const turnstileSettings = JSON.parse(turnstilePlugin.settings as string)
        const secretKey = turnstileSettings.secretKey
        
        if (!secretKey) {
          console.error('Turnstile secret key not configured')
          return c.json({
            success: false,
            error: 'Security verification unavailable'
          }, 500)
        }
        
        // Verify the token with Cloudflare
        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            secret: secretKey,
            response: token
          })
        })
        
        const verifyResult = await verifyResponse.json() as any
        
        if (!verifyResult.success) {
          console.error('Turnstile verification failed:', verifyResult['error-codes'])
          return c.json({
            success: false,
            error: 'Security verification failed. Please try again.'
          }, 400)
        }
        
        console.log('Turnstile verification successful')
      } catch (error) {
        console.error('Error verifying Turnstile token:', error)
        return c.json({
          success: false,
          error: 'Security verification error'
        }, 500)
      }
    }

    // Remove Turnstile token from data before saving
    delete data['cf-turnstile-response']

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
