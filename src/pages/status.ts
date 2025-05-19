import { getD1DataByTable } from "@services/d1-data";
import { kvGetAll } from "@services/kv";
import { return200 } from "@services/return-types";

export const GET = async (context) => {
  // const status = {
  //   webServer: "ok",
  //   d1: "ok",
  //   drizzle: "ok",
  //   kv: "ok",
  //   env: {
  //     ASSETS: {},
  //     CF_PAGES: "1",
  //     CF_PAGES_BRANCH: "main",
  //     CF_PAGES_COMMIT_SHA: "450099b920e1ea178a5bf0c48619c40d25ecd4ae",
  //     CF_PAGES_URL: "https://2c1d1144.sonicjs-emx.pages.dev",
  //     D1DATA: {
  //       fetcher: {},
  //     },
  //     KVDATA: {},
  //   },
  // };
  const status = await getStatus(context);
  return return200(status);
};

const getStatus = async (context) => {
  console.log("status", Date());
  // TODO any
  var status = {} as any;

  status.webServer = "ok";

  //kv
  try {
    const allKvItems = await kvGetAll(context);
    console.log("allKvItems", allKvItems);
    status.kv = "ok";
    status.kv_items_count = allKvItems.length;
  } catch (error) {
    status.kv = "error: " + error;
  }

  // //cache
  // try {
  //   const now = new Date().getTime().toString();
  //   const newCacheItem = await addToInMemoryCache(ctx, now, { status: 'ok' });
  //   const itemFromCache = await getFromInMemoryCache(ctx, now);
  //   status.cache = itemFromCache[0].data.status;
  //   status.cacheIsValid = await isCacheValid();
  // } catch (error) {
  //   status.cache = 'error: ' + error;
  // }

  //env
  try {
    // status.env = ctx.env;
    var safeOutput = {};
    for (var prop in context.env) {
      if (Object.prototype.hasOwnProperty.call(context.env, prop)) {
        safeOutput[prop] = "[redacted]";
      }
      status.env = safeOutput;
    }
  } catch (error) {
    status.env = "error: " + error;
  }

  //drizzle
  try {
    const d1Data = await getD1DataByTable(
      context.locals.runtime.env.D1,
      "users",
      {
        limit: 1,
      }
    );
    status.drizzle = "ok";
  } catch (error) {
    status.drizzle = "error: " + error;
  }

  //D1
  try {
    const { results } = await context.locals.runtime.env.D1.prepare(
      "SELECT name, type, sql FROM sqlite_schema WHERE type IN ('index');"
    ).all();
    status.d1 = "ok";
    status.d1_indexes = results;
  } catch (error) {
    status.d1 = "error: " + error;
  }

  return status;
};
