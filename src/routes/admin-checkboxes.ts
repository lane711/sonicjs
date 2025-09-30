import { Hono } from 'hono'
import { renderCheckboxPage, CheckboxPageData } from '../templates/pages/admin-checkboxes.template'

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

export const adminCheckboxRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

adminCheckboxRoutes.get('/', (c) => {
  const user = c.get('user')

  const pageData: CheckboxPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }

  return c.html(renderCheckboxPage(pageData))
})
