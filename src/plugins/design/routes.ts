import { Hono } from 'hono'
import { renderDesignPage, DesignPageData } from '../../templates/pages/admin-design.template'
import { APP_VERSION } from '../../index'

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
    version: APP_VERSION
  }

  return c.html(renderDesignPage(pageData))
})
