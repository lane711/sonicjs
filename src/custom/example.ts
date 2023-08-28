import { Hono } from "hono";
import qs from "qs";
import { getRecords } from "../cms/data/data";

const example = new Hono();

example.get("/", (ctx) => {
  return c.text("Hello SonicJs!");
});

example.get("/users", async (ctx) => {
    var params = qs.parse(ctx.req.query());
    const data = await getRecords(ctx.env.D1DATA, ctx.env.KVDATA, 'users', params,ctx.req.url, 'fastest' );
    return ctx.json(data);
  });

  example.post("/users", async (ctx) => {
    var params = qs.parse(ctx.req.query());
    const data = await getRecords(ctx.env.D1DATA, ctx.env.KVDATA, 'users', params,ctx.req.url, 'fastest' );
    return ctx.json(data);
  });

export { example };
