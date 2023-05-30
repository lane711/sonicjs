import { Hono } from "hono";
import { getForm, loadForm } from "../admin/forms/form";
import {
  getById,
  getDataByPrefix,
  getDataListByPrefix,
  putData,
  saveContent,
  saveContentType,
} from "../data/data";
import { Bindings } from "../types/bindings";

const api = new Hono<{ Bindings: Bindings }>();

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

api.get("/content/:contentId", async (ctx) => {
  const id = ctx.req.param("contentId");
  const content = await getById(ctx.env.KVDATA, `${id}`);

  return ctx.json(content);
});

api.get("/contents/:contype-type", async (ctx) => {
  const contentType = ctx.req.param("contype-type");

  // const content = await getDataListByPrefix(ctx.env.KVDATA, `site1::content::${contentType}`);
  const content = await getDataByPrefix(ctx.env.KVDATA, `site1::content::${contentType}`);
console.log('content', content);
  return ctx.json(content);
});

api.get("/contents-with-meta/:contype-type", async (ctx) => {
  const contentType = ctx.req.param("contype-type");

  // const content = await getDataListByPrefix(ctx.env.KVDATA, `site1::content::${contentType}`);
  const content = await getDataListByPrefix(ctx.env.KVDATA, `site1::content::${contentType}`);
console.log('content', content);
  return ctx.json(content);
});

api.get("/content-with-content-type/:contentId", async (ctx) => {
  const id = ctx.req.param("contentId");
  const content = await getById(ctx.env.KVDATA, `${id}`);

  const contentTypeId = content.data.systemId;
  const contentType = await getById(
    ctx.env.KVDATA,
    `site1::content-type::${contentTypeId}`
  );

  return ctx.json({ content, contentType });
});

api.post("/content", async (c) => {
  const content = await c.req.json();
  const key = content.key;
  // console.log("content-->", content);
  //put in kv
  const result = await saveContent(c.env.KVDATA, "site1", content, key);

  const status = key ? 204 : 201;

  return c.text("", status);
});

export { api };
