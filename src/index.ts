import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { prettyJSON } from 'hono/pretty-json'
import api from './api'
import { Bindings } from './bindings'

const app = new Hono()
app.get('/', (c) => c.text('Pretty Blog API'))
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

const middleware = new Hono<{ Bindings: Bindings }>()
middleware.use('*', prettyJSON())
middleware.use('/posts/*', async (c, next) => {
  if (c.req.method !== 'GET') {
    const auth = basicAuth({ username: c.env.USERNAME, password: c.env.PASSWORD })
    return auth(c, next)
  } else {
    await next()
  }
})

app.route('/api', middleware)
app.route('/api', api)

export default app
