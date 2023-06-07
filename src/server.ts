import { Hono } from "hono";
// import { html } from 'hono/html'
// import { jsx } from 'hono/jsx'

import { api } from "./cms/api/api";
import { Bindings } from "./cms/types/bindings";
import { admin } from "./cms/admin/admin";
import { content } from "./cms/api/content";
import { contentType } from "./cms/api/content-type";

const app = new Hono<{ Bindings: Bindings }>()

app.get("/", async (ctx) => {
  // const result = await ctx.env.KVDATA.put("test123b", JSON.stringify({ test: "123b" }));
  // console.log("result", ctx.env.KVDATA, result);
  // let value = await ctx.env.KVDATA.list({});
  // console.log("test is", value);

  return ctx.redirect('/admin');
});

app.get("/binding", async (ctx) => {
  // const result = await ctx.env.KVDATA.put("test123b", JSON.stringify({ test: "123b" }));
  // console.log("result", ctx.env.KVDATA, result);
  // let value = await ctx.env.KVDATA.list({});
  // console.log("test is", value);
  return ctx.json(ctx.env.KVDATA,);

});

app.get("/public/*", async (ctx) => {
  return await ctx.env.ASSETS.fetch(ctx.req.raw);
});

app.route('/v1', api)
app.route('/v1/content', content)
app.route('/v1/content-type', contentType)

app.route('/admin', admin)

// setAdmin(app);

export default app;
