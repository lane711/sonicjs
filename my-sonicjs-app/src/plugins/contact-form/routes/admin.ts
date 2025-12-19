import { Hono } from 'hono'
import { ContactService } from '../services/contact'
import { renderSettingsPage } from '../components/settings-page'

const admin = new Hono()

admin.get('/', (c) => c.redirect('/admin/plugins/contact-form/settings'))

admin.get('/settings', async (c: any) => {
  const service = new ContactService(c.env.DB)
  const { data } = await service.getSettings()
  return c.html(renderSettingsPage(data))
})

admin.post('/settings', async (c: any) => {
  const body = await c.req.json()
  const service = new ContactService(c.env.DB)
  await service.saveSettings(body)
  return c.json({ success: true })
})

export default admin
