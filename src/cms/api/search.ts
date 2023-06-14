import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { drizzle } from 'drizzle-orm/d1';
import { customers } from "../../db/customers";

export interface Env {
  D1DATA: D1Database;
}

const search = new Hono<{ Bindings: Bindings }>();

search.get("/", async (ctx) => {

  console.log('searching data with d1')

  const db = drizzle(ctx.env.D1DATA);
  const result = await db.select().from(customers).all()

    return ctx.json(result);
  
});


search.get("/raw", async (ctx) => {

  console.log('searching data with d1')

  const { results } = await ctx.env.D1DATA.prepare(
    "SELECT * FROM Customers"
  )
    .all();
    return ctx.json(results);
  
});

export { search };
