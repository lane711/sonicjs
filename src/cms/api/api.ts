import { Hono } from "hono";
import { loadForm } from "../admin/forms/form";
import {
  clearAllKVRecords,
  clearKVCache,
  getDataByPrefix,
  getDataListByPrefix,
  getKVCache,
  saveContentType,
  getRecordFromKvCache,
  addToKvCache,
} from "../data/kv-data";
import { Bindings } from "../types/bindings";
import { apiConfig } from "../../db/schema";
import { getForm } from "./forms";
import qs from "qs";
import {
  deleteRecord,
  getRecords,
  insertRecord,
  updateRecord,
} from "../data/data";
import { clearInMemoryCache, getAllFromInMemoryCache } from "../data/cache";
import { Variables } from "../../server";
import {
  canProceedAsEditorOrAdmin,
  isAdmin,
  isAdminOrEditor,
  isAuthEnabled,
  isEditAllowed,
} from "../auth/auth-helpers";

const api = new Hono<{ Bindings: Bindings; Variables: Variables }>();

apiConfig.forEach((entry) => {
  // console.log("setting route for " + entry.route);

  //ie /v1/users
  api.get(`/${entry.route}`, async (ctx) => {
    const start = Date.now();

    const authEnabled = await isAuthEnabled(ctx);
    if (authEnabled) {
      const isPublic = entry.publicPermissions.read;
      if (!isPublic && !isAdminOrEditor(ctx.get("user"))) {
        // unauthorized if not public and not admin or editor
        return ctx.text("Unauthorized", 401);
      } else if (
        !isPublic &&
        entry.table === "users" &&
        !isAdmin(ctx.get("user"))
      ) {
        // unauthorized if not public and not admin for the users table so editors can't see personal info of other users
        return ctx.text("Unauthorized", 401);
      }
    }

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

    const authEnabled = await isAuthEnabled(ctx);
    if (authEnabled) {
      const isPublic = entry.publicPermissions.read;
      if (!isPublic && !isAdminOrEditor(ctx.get("user"))) {
        // unauthorized if not public and not admin or editor
        return ctx.text("Unauthorized", 401);
      } else if (
        !isPublic &&
        entry.table === "users" &&
        !isEditAllowed(ctx.get("user"), id)
      ) {
        // unauthorized if not public and not it's a user and not admin or that user
        return ctx.text("Unauthorized", 401);
      }
    }

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

    const authEnabled = await isAuthEnabled(ctx);
    if (authEnabled) {
      const isPublic = entry.publicPermissions.create;
      if (!isPublic && !isAdminOrEditor(ctx.get("user"))) {
        // unauthorized if not public and not admin or editor
        return ctx.text("Unauthorized", 401);
      }
    }

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

  //update single record
  //TODO: support batch inserts
  api.put(`/${entry.route}/:id`, async (ctx) => {
    const payload = await ctx.req.json();
    const id = ctx.req.param("id");
    var content: { data?: any; table?: string; id?: string } = {};
    ctx.env.D1DATA = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

    content.data = payload.data;
    const authEnabled = await isAuthEnabled(ctx);
    if (authEnabled) {
      const isPublic = entry.publicPermissions.update;
      if (!isPublic && !isAdminOrEditor(ctx.get("user"))) {
        console.log("not public and not admin or editor", ctx.get("user"));
        // unauthorized if not public and not admin or editor
        return ctx.text("Unauthorized", 401);
      } else if (
        !isPublic &&
        entry.table === "users" &&
        !isEditAllowed(ctx.get("user"), id)
      ) {
        // unauthorized if not public and not it's a user and not admin or that user
        return ctx.text("Unauthorized", 401);
      }
      //TODO some sort of editor owner system?
    }

    const route = ctx.req.path.split("/")[2];
    const table = apiConfig.find((entry) => entry.route === route).table;

    content.table = table;
    content.id = id;

    try {
      const result = await updateRecord(
        ctx.env.D1DATA,
        ctx.env.KVDATA,
        content
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

    const authEnabled = await isAuthEnabled(ctx);
    if (authEnabled) {
      const isPublic = entry.publicPermissions.delete;
      if (!isPublic && !isAdminOrEditor(ctx.get("user"))) {
        // unauthorized if not public and not admin or editor
        return ctx.text("Unauthorized", 401);
      } else if (
        !isPublic &&
        entry.table === "users" &&
        !isEditAllowed(ctx.get("user"), id)
      ) {
        // unauthorized if not public and not it's a user and not admin or that user
        return ctx.text("Unauthorized", 401);
      }
      //TODO some sort of editor owner system?
    }

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
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
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
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  const cacheKey = "kv-test-key2";
  const total = 100;
  const d1Data = [{ a: "1", b: "2" }];
  const data = { data: d1Data, source: "kv", total };
  await addToKvCache(ctx, ctx.env.KVDATA, cacheKey, data);

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
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  const list = await ctx.env.KVDATA.list();
  return ctx.json(list);
});

api.get("/data", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  const data = await getDataListByPrefix(ctx.env.KVDATA, "");
  return ctx.json(data);
});

api.get("/forms", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  return ctx.html(await loadForm(ctx));
});

api.get("/form-components/auth/users", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  const ct = await getForm(ctx.env.D1DATA, "users");
  return ctx.json(ct);
});

api.get("/form-components/:route", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  const route = ctx.req.param("route");

  const table = apiConfig.find((entry) => entry.route === route).table;

  const ct = await getForm(ctx.env.D1DATA, table);
  return ctx.json(ct);
});

api.post("/form-components", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  const formComponents = await ctx.req.json();

  console.log("formComponents-->", formComponents);
  //put in kv
  const result = await saveContentType(ctx.env.KVDATA, "site1", formComponents);

  console.log("form put", result);
  return ctx.text("Created!", 201);
});

api.get("/cache/clear-all", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  console.log("clearing cache");
  await clearInMemoryCache();
  await clearKVCache(ctx.env.KVDATA);
  return ctx.text("in memory and kv caches cleared");
});

api.get("/cache/clear-in-memory", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  console.log("clearing cache");
  await clearInMemoryCache();
  return ctx.text("in memory cache cleared");
});

api.get("/cache/clear-kv", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  console.log("clearing cache");
  await clearKVCache(ctx.env.KVDATA);
  return ctx.text("kv cache cleared");
});

api.get("/cache/in-memory", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  console.log("clearing cache");
  const cacheItems = await getAllFromInMemoryCache();
  return ctx.json(cacheItems);
});

api.get("/cache/kv", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  const cacheItems = await getKVCache(ctx.env.KVDATA);
  console.log("getting kv cache", cacheItems);
  return ctx.json(cacheItems);
});

api.get("/cache/kv/:cacheKey", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  const cacheKey = ctx.req.param("cacheKey");
  const cacheItem = await getRecordFromKvCache(ctx.env.KVDATA, cacheKey);
  console.log("getting kv cache", cacheItem);
  return ctx.json(cacheItem);
});

api.get("/kv", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  const allItems = await getDataByPrefix(ctx.env.KVDATA, "", 2);
  return ctx.json(allItems);
});

api.get("/kv/:cacheKey", async (ctx) => {
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
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
  const canProceed = await canProceedAsEditorOrAdmin(ctx);
  if (!canProceed) {
    return ctx.text("Unauthorized", 401);
  }
  await clearAllKVRecords(ctx.env.KVDATA);
  return ctx.text("ok");
});

export { api };
