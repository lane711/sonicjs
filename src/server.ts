import { Hono } from "hono";

import { api } from "./cms/api/api";
import { Bindings } from "./cms/types/bindings";
import { admin } from "./cms/admin/admin";
import { content } from "./cms/api/content";
import { example } from "./custom/example";


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
app.route('/admin', admin)
app.route('v1/example', example)


export default app;
