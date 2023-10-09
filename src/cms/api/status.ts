import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { getD1DataByTable } from "../data/d1-data";
import { getById } from "../data/kv-data";
import axios from "axios";
import { datadogLogs } from "@datadog/browser-logs";
import { log } from "../util/logger";

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

  //env
  try {
    // status.env = ctx.env;
    var safeOutput = {};
    for (var prop in ctx.env) {
      if (Object.prototype.hasOwnProperty.call(ctx.env, prop)) {
        safeOutput[prop] = '[redacted]'
      }
      status.env = safeOutput;
  }
  } catch (error) {
    status.env = "error: " + error;
  }

  return ctx.json(status);
});

status.get("/log", async (ctx) => {
  log(ctx, { level: "error", messaage: "test from the logger 2" });

  return ctx.json({ ok: "ok" });
});

export { status };
