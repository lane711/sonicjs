import { Hono } from "hono";
import { cors } from "hono/cors";

import { api } from "./cms/api/api";
import { Bindings } from "./cms/types/bindings";
import { admin } from "./cms/admin/admin";
import { example } from "./custom/example";
import { status } from "./cms/api/status";

const app = new Hono<{ Bindings: Bindings }>();

//CORS
app.use(
  "/v1/*",
  cors({
    origin: (origin) => {
      console.log("origin", origin);
      return origin.indexOf("localhost") > 0 || origin.endsWith(".sonicjs.com")
        ? origin
        : "https://sonicjs.com";
    },
  })
);

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('SonicJs Error', 500)
})

app.get("/", async (ctx) => {
  return ctx.redirect("/admin");
});

app.get("/public/*", async (ctx) => {
  return await ctx.env.ASSETS.fetch(ctx.req.raw);
});

app.route("/v1", api);
app.route("/admin", admin);
app.route("v1/example", example);
app.route("/status", status);

export default app;
