import { Hono } from "hono";
import { loadForm } from "../admin/forms/form";
import {
  clearAllKVRecords,
  clearKVCache,
  getAllKV,
  getById,
  getDataByPrefix,
  getDataListByPrefix,
  getKVCache,
  saveKVData,
  saveContent,
  saveContentType,
  getRecordFromKvCache,
  addToKvCache,
  clearKVKeysCache,
} from "../data/kv-data";
import { Bindings } from "../types/bindings";
import { apiConfig } from "../../db/schema";
import { getD1DataByTable, getD1ByTableAndId } from "../data/d1-data";
import { getForm } from "./forms";
import qs from "qs";
import {
  deleteRecord,
  getRecords,
  insertRecord,
  updateRecord,
} from "../data/data";
import {
  clearInMemoryCache,
  getAllFromInMemoryCache,
  rehydrateCacheFromKVKeys,
} from "../data/cache";

const api = new Hono<{ Bindings: Bindings }>();

apiConfig.forEach((entry) => {
  // console.log("setting route for " + entry.route);

  //ie /v1/users
  api.get(`/${entry.route}`, async (ctx) => {
    const start = Date.now();

    try {
      var params = qs.parse(ctx.req.query());
      params.limit = params.limit ?? 1000;
      ctx.env.D1DATA = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

      const data = await getRecords(
        ctx,
        entry.table,
        params,
        ctx.req.url,
        "fastest",
        undefined
      );

      const end = Date.now();
      const executionTime = end - start;

      return ctx.json({ ...data, executionTime });
    } catch (error) {
      console.log(error);
      return ctx.text(error);
    }
  });

  //get single record
  api.get(`/${entry.route}/:id`, async (ctx) => {
    const start = Date.now();

    const { includeContentType } = ctx.req.query();

    const id = ctx.req.param("id");
    var params = qs.parse(ctx.req.query());
    params.id = id;
    ctx.env.D1DATA = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

    let source = "fastest";
    if (includeContentType !== undefined) {
      source = "d1";
    }

    const data = await getRecords(
      ctx,
      entry.table,
      params,
      ctx.req.url,
      source,
      undefined
    );

    if (includeContentType !== undefined) {
      data.contentType = getForm(ctx, entry.table);
    }

    const end = Date.now();
    const executionTime = end - start;

    return ctx.json({ ...data, executionTime });
  });

  //create single record
  //TODO: support batch inserts
  api.post(`/${entry.route}`, async (ctx) => {
    const content = await ctx.req.json();

    const route = ctx.req.path.split("/")[2];
    const table = apiConfig.find((entry) => entry.route === route).table;
    ctx.env.D1DATA = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

    content.table = table;

    try {
      // console.log("posting new record content", JSON.stringify(content, null, 2));

      const result = await insertRecord(
        ctx.env.D1DATA,
        ctx.env.KVDATA,
        content
      );

      return ctx.json(result.data, 201);
    } catch (error) {
      console.log("error posting content", error);
      return ctx.text(error, 500);
    }
  });

  //upadte single record
  //TODO: support batch inserts
  api.put(`/${entry.route}/:id`, async (ctx) => {
    const payload = await ctx.req.json();
    const id = ctx.req.param("id");
    var content = {};
    ctx.env.D1DATA = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

    content.data = payload.data;

    const route = ctx.req.path.split("/")[2];
    const table = apiConfig.find((entry) => entry.route === route).table;

    content.table = table;
    content.id = id;

    try {
      const result = await updateRecord(
        ctx,
        ctx.env.D1DATA,
        ctx.env.KVDATA,
        content,
        ctx.req.url
      );

      return ctx.json(result.data, 200);
    } catch (error) {
      console.log("error updating content", error);
      return ctx.text(error, 500);
    }
  });

  //delete
  api.delete(`/${entry.route}/:id`, async (ctx) => {
    const id = ctx.req.param("id");
    const table = ctx.req.path.split("/")[2];
    ctx.env.D1DATA = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

    const record = await getRecords(
      ctx,
      table,
      { id },
      ctx.req.path,
      "fastest",
      undefined
    );

    console.log("delete content " + JSON.stringify(record, null, 2));

    if (record) {
      console.log("content found, deleting...");
      const result = await deleteRecord(ctx.env.D1DATA, ctx.env.KVDATA, {
        id,
        table: table,
      });
      // const kvDelete = await deleteKVById(ctx.env.KVDATA, id);
      // const d1Delete = await deleteD1ByTableAndId(
      //   ctx.env.D1DATA,
      //   content.data.table,
      //   content.data.id
      // );
      console.log("returning 204");
      return ctx.text("", 204);
    } else {
      console.log("content not found");
      return ctx.text("", 404);
    }
  });
});

api.get("/ping", (c) => {
  console.log("testing ping", Date());
  return c.text(Date());
});

api.get("/kv-test", async (ctx) => {
  const createdOn = new Date().getTime();

  await ctx.env.KVDATA.put(
    "cache::kv-test-key",
    JSON.stringify({ foo: "bar" }),
    {
      metadata: { createdOn },
    }
  );

  const { value, metadata } = await ctx.env.KVDATA.getWithMetadata(
    "kv-test-key",
    { type: "json" }
  );

  return ctx.json({ value, metadata });
});

api.get("/kv-test2", async (ctx) => {
  const cacheKey = "kv-test-key2";
  const total = 100;
  const d1Data = [{ a: "1", b: "2" }];
  const data = { data: d1Data, source: "kv", total };
  await addToKvCache(ctx, cacheKey, data);

  // await ctx.env.KVDATA.put(cacheKey, JSON.stringify({ foo: "bar" }), {
  //   metadata: { createdOn: "123" },
  // });

  // const list = await ctx.env.KVDATA.list();
  // console.log("list", list);

  const { value, metadata } = await ctx.env.KVDATA.getWithMetadata(
    `cache::${cacheKey}`,
    {
      type: "json",
    }
  );

  return ctx.json({ value, metadata });
});

api.get("/kv-list", async (ctx) => {
  const list = await ctx.env.KVDATA.list();
  return ctx.json(list);
});

api.get("/data", async (c) => {
  const data = await getDataListByPrefix(c.env.KVDATA, "");
  return c.json(data);
});

api.get("/forms", async (c) => c.html(await loadForm(c)));

api.get("/form-components/:route", async (c) => {
  const route = c.req.param("route");

  const table = apiConfig.find((entry) => entry.route === route).table;

  const ct = await getForm(c.env.D1DATA, table);
  return c.json(ct);
});

api.post("/form-components", async (c) => {
  const formComponents = await c.req.json();

  console.log("formComponents-->", formComponents);
  //put in kv
  const result = await saveContentType(c.env.KVDATA, "site1", formComponents);

  console.log("form put", result);
  return c.text("Created!", 201);
});

api.post("/cache/clear-all", async (ctx) => {
  const body = await ctx.req.json();

  //must be clears first, otherwise in memory cache will just repopulate
  if (body.data.keys) {
    await clearKVKeysCache(ctx.env.KVDATA);
  }

  if (body.data.inMemory) {
    await clearInMemoryCache();
  }

  if (body.data.kv) {
    await clearKVCache(ctx.env.KVDATA);
  }

  return ctx.text("selected caches cleared");
});

api.get("/cache/clear-in-memory", async (ctx) => {
  console.log("clearing cache");
  await clearInMemoryCache();
  return ctx.text("in memory cache cleared");
});

api.get("/cache/clear-kv", async (ctx) => {
  console.log("clearing cache");
  await clearKVCache(ctx.env.KVDATA);
  return ctx.text("kv cache cleared");
});

api.get("/cache/clear-keys", async (ctx) => {
  console.log("clearing keys");
  await clearKVKeysCache(ctx.env.KVDATA);
  return ctx.text("kv keys cleared");
});

api.get("/cache/in-memory", async (ctx) => {
  console.log("clearing cache");
  const cacheItems = await getAllFromInMemoryCache();
  return ctx.json(cacheItems);
});

api.get("/cache/kv", async (ctx) => {
  const cacheItems = await getKVCache(ctx.env.KVDATA);
  console.log("getting kv cache", cacheItems);
  return ctx.json(cacheItems);
});

api.get("/cache/kv/:cacheKey", async (ctx) => {
  const cacheKey = ctx.req.param("cacheKey");
  const cacheItem = await getRecordFromKvCache(ctx.env.KVDATA, cacheKey);
  console.log("getting kv cache", cacheItem);
  return ctx.json(cacheItem);
});

api.get("/cache/rehydrate", async (ctx) => {
  console.log("rehydrating cache");
  await clearInMemoryCache();
  await rehydrateCacheFromKVKeys(ctx);
  return ctx.text("cache has been repopulated from kv");
});

api.get("/kv", async (ctx) => {
  const allItems = await getDataByPrefix(ctx.env.KVDATA, "", 2);
  return ctx.json(allItems);
});

api.get("/kv/:cacheKey", async (ctx) => {
  const cacheKey = ctx.req.param("cacheKey");
  console.log("getting kv cache", cacheKey);

  const cacheItem = await getRecordFromKvCache(
    ctx.env.KVDATA,
    "http://127.0.0.1:8788/admin/api/users"
  );
  console.log("getting kv cache", cacheItem);
  return ctx.json(cacheItem);
});

api.get("/kv/delete-all", async (ctx) => {
  await clearAllKVRecords(ctx.env.KVDATA);
  return ctx.text("ok");
});

export { api };
