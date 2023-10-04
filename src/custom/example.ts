import { Hono } from "hono";
import qs from "qs";
import { getRecords } from "../cms/data/data";
import * as schema from "../db/schema";
import { drizzle } from "drizzle-orm/d1";

const example = new Hono();

example.get("/", (ctx) => {
  return ctx.text("Hello SonicJs!");
});

example.get("/users", async (ctx) => {
  var params = qs.parse(ctx.req.query());
  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "users",
    params,
    ctx.req.url,
    "fastest"
  );
  return ctx.json(data);
});

example.post("/users", async (ctx) => {
  var params = qs.parse(ctx.req.query());
  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "users",
    params,
    ctx.req.url,
    "fastest"
  );
  return ctx.json(data);
});

example.get("/blog-post", async (ctx) => {

  const db = drizzle(ctx.env.D1DATA, { schema });


  const post = await db.query.postsTable.findMany({
    with: {
      user: true,
      comments: { with: { user: true } },
      categories: { with: { category: true } },
    },
  });

  
  return ctx.json(post);
});

export { example };
