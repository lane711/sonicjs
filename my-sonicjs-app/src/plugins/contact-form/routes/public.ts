import { Hono } from 'hono'
import { html } from 'hono/html'
import { ContactService } from '../services/contact'

const publicRoutes = new Hono()

publicRoutes.get('/contact', async (c: any) => {
  const service = new ContactService(c.env.DB)
  const { status, data: settings } = await service.getSettings()

  if (status !== 'active') return c.text('Contact form is currently disabled.', 503)

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
        <script>document.getElementById('cf').addEventListener('submit',async(e)=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const r=await fetch('/api/contact',{method:'POST',body:JSON.stringify(d)});if((await r.json()).success){document.getElementById('success-alert').classList.remove('d-none');e.target.reset()}});</script>
      </body>
    </html>
  `)
})

publicRoutes.post('/api/contact', async (c: any) => {
  const service = new ContactService(c.env.DB)
  await service.saveMessage(await c.req.json())
  return c.json({ success: true })
})

export default publicRoutes
