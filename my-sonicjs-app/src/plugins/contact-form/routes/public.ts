import { Hono } from 'hono'
import { html } from 'hono/html'
import type { Context } from 'hono'
import { ContactService } from '../services/contact'
import { TurnstileService } from '@sonicjs-cms/core/plugins'

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

  // Get Turnstile settings - only show if BOTH global Turnstile is enabled AND contact form has it enabled
  let turnstileSiteKey = ''
  let turnstileEnabled = false
  let turnstileTheme = 'light'
  let turnstileSize = 'normal'
  let turnstileMode = 'managed'
  let turnstileAppearance = 'always'
  const contactUseTurnstile = settings.useTurnstile === true || settings.useTurnstile === 1 || settings.useTurnstile === 'true' || settings.useTurnstile === 'on'
  
  if (contactUseTurnstile) {
    try {
      const turnstileResult = await db.prepare('SELECT settings FROM plugins WHERE id = ?').bind('turnstile').first()
      if (turnstileResult?.settings) {
        const turnstileSettings = JSON.parse(turnstileResult.settings)
        turnstileSiteKey = turnstileSettings.siteKey || ''
        turnstileEnabled = turnstileSettings.enabled === true
        turnstileTheme = turnstileSettings.theme || 'light'
        turnstileSize = turnstileSettings.size || 'normal'
        turnstileMode = turnstileSettings.mode || 'managed'
        turnstileAppearance = turnstileSettings.appearance || 'always'
      }
    } catch (e) {
      console.log('Turnstile plugin not found or not configured')
    }
  }

  return c.html(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Contact ${company}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        ${turnstileEnabled && turnstileSiteKey ? html`<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` : ''}
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
               ${turnstileEnabled && turnstileSiteKey ? html`
               <div class="mb-3">
                 <div 
                   class="cf-turnstile" 
                   data-sitekey="${turnstileSiteKey}" 
                   data-theme="${turnstileTheme}"
                   data-size="${turnstileSize}"
                   data-action="submit"
                   data-appearance="${turnstileAppearance}"
                   ${turnstileMode !== 'managed' ? `data-execution="${turnstileMode}"` : ''}
                 ></div>
               </div>
               ` : ''}
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
            
            // Get Turnstile token if widget is present
            const turnstileWidget = e.target.querySelector('.cf-turnstile');
            if (turnstileWidget) {
              console.log('Turnstile widget found');
              
              // Turnstile automatically creates a hidden input with the token
              const tokenInput = e.target.querySelector('input[name="cf-turnstile-response"]');
              
              if (tokenInput && tokenInput.value) {
                console.log('Token found in hidden input');
                data['cf-turnstile-response'] = tokenInput.value;
              } else if (typeof turnstile !== 'undefined') {
                console.log('Attempting to get token via API');
                const token = turnstile.getResponse();
                if (!token) {
                  alert('Please complete the security check');
                  return;
                }
                data['cf-turnstile-response'] = token;
              } else {
                console.error('No Turnstile token found');
                alert('Please complete the security check');
                return;
              }
            }
            
            console.log('Submitting form data:', { ...data, 'cf-turnstile-response': data['cf-turnstile-response'] ? '***token***' : 'missing' });
            
            const r = await fetch('/api/contact', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(data)
            });
            
            const res = await r.json();
            console.log('Response:', res);
            
            if (res.success) {
              document.getElementById('success-alert').classList.remove('d-none');
              e.target.reset();
              // Reset Turnstile widget if present
              if (turnstileWidget && typeof turnstile !== 'undefined') {
                turnstile.reset();
              }
              setTimeout(() => document.getElementById('success-alert').classList.add('d-none'), 5000);
            } else {
              console.error('Submission error:', res);
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
 * Protected by Turnstile if enabled in contact form settings
 */
publicRoutes.post('/api/contact', async (c: any) => {
  try {
    // Get DB from context
    const db = c.get('db') || c.env?.DB
    if (!db) {
      return c.json({ success: false, error: 'Service unavailable' }, 503)
    }

    const service = new ContactService(db)
    
    // Check if contact form has Turnstile enabled
    const { data: settings } = await service.getSettings()
    const useTurnstile = settings.useTurnstile === true || settings.useTurnstile === 1 || settings.useTurnstile === 'true' || settings.useTurnstile === 'on'
    
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
    
    // If Turnstile is enabled for this form, verify it
    if (useTurnstile) {
      console.log('[Contact Form] Turnstile verification enabled for this form')
      const turnstileService = new TurnstileService(db)
      const isTurnstileEnabled = await turnstileService.isEnabled()
      console.log('[Contact Form] Turnstile plugin enabled:', isTurnstileEnabled)
      
      if (isTurnstileEnabled) {
        const token = data['cf-turnstile-response'] || data['turnstile-token']
        console.log('[Contact Form] Token present:', !!token)
        
        if (!token) {
          console.error('[Contact Form] No Turnstile token provided')
          return c.json({
            success: false,
            error: 'Turnstile verification required',
            message: 'Please complete the security check'
          }, 400)
        }
        
        const remoteIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')
        console.log('[Contact Form] Verifying token with IP:', remoteIp)
        const result = await turnstileService.verifyToken(token, remoteIp)
        console.log('[Contact Form] Verification result:', result)
        
        if (!result.success) {
          console.error('[Contact Form] Turnstile verification failed:', result.error)
          return c.json({
            success: false,
            error: 'Turnstile verification failed',
            message: result.error || 'Security verification failed. Please try again.'
          }, 403)
        }
        
        console.log('[Contact Form] Turnstile verification successful')
      }
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
