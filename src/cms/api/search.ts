import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { drizzle } from "drizzle-orm/d1";
import { user } from "../../db/users";
import { blog } from "../../db/posts";

export interface Env {
  D1DATA: D1Database;
}

const search = new Hono<{ Bindings: Bindings }>();

search.get("/", async (ctx) => {
  console.log("searching data with d1");

  const db = drizzle(ctx.env.D1DATA);
  const result = await db.select().from(user).all();

  return ctx.json(result);
});

search.get("/raw", async (ctx) => {
  console.log("searching data with d1");

  const db = drizzle(ctx.env.D1DATA);

  // const result = await db
  //   .insert(blog)
  //   .values({ title: "Ipsum 2", body: "De Lor" })
  //   .run();
  // console.log("result", result);

  // await db.insert(user).values({ name: 'Joe' }).run();


  
  const { results } = await ctx.env.D1DATA.prepare("SELECT * FROM blog").all();
  return ctx.json(results);
});

export { search };
