import { Hono } from "hono";
// import { html } from 'hono/html'
// import { jsx } from 'hono/jsx'

import { api } from "./cms/api/api";
import { Bindings } from "./cms/types/bindings";
import { admin } from "./cms/admin/admin";
import { content } from "./cms/api/content";
import { search } from "./cms/api/search";

const app = new Hono<{ Bindings: Bindings }>()

app.get("/", async (ctx) => {
  return ctx.redirect('/admin');
});

app.get("/binding", async (ctx) => {
  return ctx.json(ctx.env.KVDATA,);
});

app.get("/public/*", async (ctx) => {
  return await ctx.env.ASSETS.fetch(ctx.req.raw);
});

app.route('/v1', api)
app.route('/v1/content', content)
app.route('/v1/search', search)
app.route('/admin', admin)

export default app;
