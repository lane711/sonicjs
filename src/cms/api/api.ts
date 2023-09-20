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
import { getRecords, insertRecord } from "../data/data";
import { clearInMemoryCache, getAllFromInMemoryCache } from "../data/cache";

const api = new Hono<{ Bindings: Bindings }>();

apiConfig.forEach((entry) => {
  // console.log("setting route for " + entry.route);

  //ie /v1/users
  api.get(`/${entry.route}`, async (ctx) => {
    try {
      var params = qs.parse(ctx.req.query());
      const data = await getRecords(ctx.env.D1DATA, ctx.env.KVDATA, entry.table, params,ctx.req.url, 'fastest' );
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

  //update single record
  api.post(`/${entry.route}`, async (ctx) => {

  // content.post("/", async (ctx) => {
    const content = await ctx.req.json();
  
    // console.log('post new', content)
  
    const id = uuidv4();
    const timestamp = new Date().getTime();
    content.data.id = id;
  

    try {
      const result = await  insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, content);

      // const result = await saveContent(
      //   ctx.env.KVDATA,
      //   content.data,
      //   timestamp,
      //   id
      // );
      // console.log('result KV', result);
      return ctx.json(result.id, 201);
    } catch (error) {
      console.log("error posting content", error);
      return ctx.text(error, 500);
    } 
    // finally {
    //   //then also save the content to sqlite for filtering, sorting, etc
    //   try {
    //     const result = await insertD1Data(
    //       ctx.env.D1DATA,
    //       ctx.env.KVDATA,
    //       content.data.table,
    //       content.data
    //     );
    //     console.log('insertD1Data --->', result)
    //     return ctx.json(result.id, 201);
  
    //   } catch (error) {
    //     console.log("error posting content " + content.data.table, error, JSON.stringify(content.data, null, 2));
    //   }
    // }
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
  console.log('clearing cache');
  await clearInMemoryCache();
  await clearKVCache(ctx.env.KVDATA);
  return ctx.text("in memory and kv caches cleared");
});

api.get("/cache/clear-in-memory", async (ctx) => {
  console.log('clearing cache');
  await clearInMemoryCache();
  return ctx.text("in memory cache cleared");
});

api.get("/cache/clear-kv", async (ctx) => {
  console.log('clearing cache');
  await clearKVCache(ctx.env.KVDATA);
  return ctx.text("kv cache cleared");
});

api.get("/cache/in-memory", async (ctx) => {
  console.log('clearing cache');
  const cacheItems = await getAllFromInMemoryCache();
  return ctx.json(cacheItems);
});

api.get("/cache/kv", async (ctx) => {
  const cacheItems = await getKVCache(ctx.env.KVDATA);
  console.log('getting kv cache', cacheItems);
  return ctx.json(cacheItems);
});

api.get("/kv", async (ctx) => {
  const allItems = await getAllKV(ctx.env.KVDATA);
  return ctx.json(allItems);
});

api.get("/kv/delete-all", async (ctx) => {
  await clearAllKVRecords(ctx.env.KVDATA);
  return ctx.text('ok');
});

export { api };
