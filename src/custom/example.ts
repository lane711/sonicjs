import { Hono } from "hono";
import qs from "qs";
import { getRecords } from "../cms/data/data";
import * as schema from "../db/schema";
import { drizzle } from "drizzle-orm/d1";
import { getD1Binding } from "../cms/util/d1-binding";
import { sql } from "drizzle-orm";
import { postsTable } from "../db/schema";

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

example.get("/blog-posts", async (ctx) => {
  const start = Date.now();
  var params = qs.parse(ctx.req.query());
  const d1 = getD1Binding(ctx);
  const limit = params.limit ? params.limit : 10;
  const offset = params.offset ? params.offset : 0;

  const func = async function () {
    const db = drizzle(d1, { schema });

    return await db.query.postsTable.findMany({
      with: {
        user: true,
        comments: { with: { user: true } },
        categories: { with: { category: true } },
      },
      limit,
      offset,
      extras: {
        total: sql`COUNT() OVER()`.as("total"),
      },
    });
  };

  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "custom",
    params,
    ctx.req.url,
    "fastest",
    func
  );

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ ...data, executionTime });
});

export { example };
