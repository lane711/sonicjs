import { Hono } from "hono";
import { loadForm } from "../admin/forms/form";
import {
  getById,
  getDataByPrefix,
  getDataListByPrefix,
  putData,
  saveContent,
  saveContentType,
} from "../data/kv-data";
import { Bindings } from "../types/bindings";
import { apiConfig } from "../../db/schema";
import { getByTable, getByTableAndId } from "../data/d1-data";
import { getForm } from "./forms";
import qs from "qs";


const api = new Hono<{ Bindings: Bindings }>();

apiConfig.forEach((entry) => {
  console.log("setting route for " + entry.route);

  //ie /v1/users
  api.get(`/${entry.route}`, async (ctx) => {
    try {
      var params = qs.parse(ctx.req.query());
      const data = await getByTable(ctx.env.D1DATA, entry.table, params);
      return ctx.json(data);
    } catch (error) {
      console.log(error);
      return ctx.text(error);
    }
  });

  api.get(`/${entry.route}/:id`, async (ctx) => {
    const { includeContentType } = ctx.req.query();

    const id = ctx.req.param("id");
    const data = await getByTableAndId(ctx.env.D1DATA, entry.table, id);

    if (includeContentType !== undefined) {
      data.contentType = getForm(ctx, entry.table);
    }

    return ctx.json(data);
  });
});

api.get("/ping", (c) => {
  console.log("testing ping", Date());
  return c.text(Date());
});

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

export { api };
