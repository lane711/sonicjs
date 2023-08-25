import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { getD1DataByTable } from "../data/d1-data";
import { getById } from "../data/kv-data";

const status = new Hono<{ Bindings: Bindings }>();

status.get("/", async (ctx) => {
  console.log("status", Date());
  var status = {};

  status.webServer = "ok";

  //D1
  try {
    const { results } = await ctx.env.D1DATA.prepare(
      "SELECT * FROM users"
    ).all();
    status.d1 = "ok";
  } catch (error) {
    status.d1 = "error: " + error;
  }

  //drizzle
  try {
    const d1Data = await getD1DataByTable(ctx.env.D1DATA, "users", {
      limit: 1,
    });
    status.drizzle = "ok";
  } catch (error) {
    status.drizzle = "error: " + error;
  }

  //kv
  try {
    const allCacheItems = await getById(ctx.env.KVDATA, "1");
    status.kv = "ok";
  } catch (error) {
    status.kv = "error: " + error;
  }

  return ctx.json(status);
});

export { status };
