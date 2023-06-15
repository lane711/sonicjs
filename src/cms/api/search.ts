import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { drizzle } from "drizzle-orm/d1";
import { users, posts } from "../../db/schema";

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

  // await db
  //   .insert(users)
  //   .values({ id: "db722b76-0b88-11ee-be56-0242ac120002", name: "Joe" })
  //   .run();

  // const result = await db
  //   .insert(posts)
  //   .values({
  //     id: "db722b76-0b88-11ee-be56-0242ac120003",
  //     title: "Ipsum 2",
  //     body: "De Lor",
  //     userId: "db722b76-0b88-11ee-be56-0242ac120002",
  //   })
  //   .run();
  // console.log("result", result);

  const { results } = await ctx.env.D1DATA.prepare("SELECT * FROM users").all();
  return ctx.json(results);
});

export { search };
