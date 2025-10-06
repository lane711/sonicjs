import { Hono } from 'hono'
import { renderDesignPage, DesignPageData } from '../../templates/pages/admin-design.template'
import packageJson from '../../../package.json'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

type Variables = {
  user: {
    userId: string
    email: string
    role: string
  }
}

export const designRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

designRoutes.get('/', (c) => {
  const user = c.get('user')

  const pageData: DesignPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    version: `v${packageJson.version}`
  }

  return c.html(renderDesignPage(pageData))
})
