import { Hono } from 'hono'
import { renderDesignPage, DesignPageData } from '../templates/pages/admin-design.template'

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

export const adminDesignRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

adminDesignRoutes.get('/', (c) => {
  const user = c.get('user')
  
  const pageData: DesignPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }
  
  return c.html(renderDesignPage(pageData))
})