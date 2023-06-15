import { Hono } from "hono";
import { getForm, loadForm } from "../admin/forms/form";
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

const api = new Hono<{ Bindings: Bindings }>();

apiConfig.forEach((entry) => {
  console.log("setting route for " + entry.route);

  api.get(`/${entry.route}`, async (ctx) => {
    const data = await getByTable(ctx.env.D1DATA, entry.table);
    return ctx.json(data);
  });

  api.get(`/${entry.route}/:id`, async (ctx) => {
    const { includeContentType } = ctx.req.query();

    const id = ctx.req.param("id");
    const data = await getByTableAndId(ctx.env.D1DATA, entry.table, id);

    if (includeContentType !== undefined) {
      data.contentType = [{
        type: "textfield",
        key: "firstName",
        label: "ABC First Name",
        placeholder: "Enter your first name.",
        input: true,
        tooltip: "Enter your <strong>First Name</strong>",
        description: "Enter your <strong>First Name</strong>",
      }];
    }

    return ctx.json(data);
  });
});

api.get("/ping", (c) => {
  return c.text(Date());
});

api.get("/data", async (c) => {
  const data = await getDataListByPrefix(c.env.KVDATA, "");
  return c.json(data);
});

api.get("/forms", async (c) => c.html(await loadForm(c)));

api.get("/form-components/:contentType", async (c) => {
  const id = c.req.param("contentType");

  // console.log("id--->", id);

  const ct = await getById(c.env.KVDATA, `${id}`);
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
