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
} from "../data/kv-data";
import { Bindings } from "../types/bindings";
import { apiConfig } from "../../db/schema";
import { getD1DataByTable, getD1ByTableAndId } from "../data/d1-data";
import { getForm } from "./forms";
import qs from "qs";
import {
  deleteRecord,
  getRecord,
  getRecords,
  insertRecord,
  updateRecord,
} from "../data/data";
import { clearInMemoryCache, getAllFromInMemoryCache } from "../data/cache";

const api = new Hono<{ Bindings: Bindings }>();

apiConfig.forEach((entry) => {
  // console.log("setting route for " + entry.route);

  //ie /v1/users
  api.get(`/${entry.route}`, async (ctx) => {
    //HACK: for testing while d1 is still in beta, then can be removed
    const d1 = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

    try {
      var params = qs.parse(ctx.req.query());
      params.limit = params.limit ?? 1000;
      const data = await getRecords(
        d1,
        ctx.env.KVDATA,
        entry.table,
        params,
        ctx.req.url,
        "fastest"
      );
      return ctx.json(data);
    } catch (error) {
      console.log(error);
      return ctx.text(error);
    }
  });

  //get single record
  api.get(`/${entry.route}/:id`, async (ctx) => {
    const { includeContentType } = ctx.req.query();

    const id = ctx.req.param("id");
    const data = await getD1ByTableAndId(ctx.env.D1DATA, entry.table, id);

    if (includeContentType !== undefined) {
      data.contentType = getForm(ctx, entry.table);
    }

    return ctx.json(data);
  });

  //create single record
  //TODO: support batch inserts
  api.post(`/${entry.route}`, async (ctx) => {
    const payload = await ctx.req.json();
    const content = payload.data;

    const table = ctx.req.path.split("/")[2];
    content.table = table;
    console.log("posting new record", table);

    //HACK: for testing while d1 is still in beta, then can be removed
    const d1 = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

    try {
      const result = await insertRecord(d1, ctx.env.KVDATA, content);

      return ctx.json(result.data, 201);
    } catch (error) {
      console.log("error posting content", error);
      return ctx.text(error, 500);
    }
  });

  //upadte single record
  //TODO: support batch inserts
  api.put(`/${entry.route}`, async (ctx) => {
    const payload = await ctx.req.json();
    const content = payload.data;

    const table = ctx.req.path.split("/")[2];
    content.table = table;

    console.log('updating record', content);

    //HACK: for testing while d1 is still in beta, then can be removed
    const d1 = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

    try {
      const result = await updateRecord(d1, ctx.env.KVDATA, content);

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

    //HACK: for testing while d1 is still in beta, then can be removed
    const d1 = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

    const record = await getRecord(
      d1,
      ctx.env.KVDATA,
      table,
      { id },
      ctx.req.path
    );

    console.log("delete content " + JSON.stringify(record, null, 2));

    if (record) {
      console.log("content found, deleting...");
      const result = await deleteRecord(d1, ctx.env.KVDATA, {
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

// api.get("/kvtest", async (ctx) => {
//   const data = await getD1DataByTable(ctx.env.D1DATA, "categories", {limit:2});
//   return ctx.json(data);
// });

api.get("/data", async (c) => {
  const data = await getDataListByPrefix(c.env.KVDATA, "");
  return c.json(data);
});

api.get("/forms", async (c) => c.html(await loadForm(c)));

api.get("/form-components/:table", async (c) => {
  const table = c.req.param("table");

  // console.log("id--->", id);

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

api.get("/cache/clear-all", async (ctx) => {
  console.log("clearing cache");
  await clearInMemoryCache();
  await clearKVCache(ctx.env.KVDATA);
  return ctx.text("in memory and kv caches cleared");
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

api.get("/kv", async (ctx) => {
  const allItems = await getAllKV(ctx.env.KVDATA);
  return ctx.json(allItems);
});

api.get("/kv/delete-all", async (ctx) => {
  await clearAllKVRecords(ctx.env.KVDATA);
  return ctx.text("ok");
});

export { api };
