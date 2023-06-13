import { Hono } from "hono";
import { Bindings } from "../types/bindings";

const search = new Hono<{ Bindings: Bindings }>();

search.get("/", async (ctx) => {

  console.log('searching data with d1')

  const { results } = await ctx.env.D1DATA.prepare(
    "SELECT * FROM Customers"
  )
    .all();
    return ctx.json(results);
  

});

export { search };
