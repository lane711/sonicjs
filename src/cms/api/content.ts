import { Hono } from "hono";
import { getForm, loadForm } from "../admin/forms/form";
import {
  getById,
  getContentType,
  getContentTypes,
  getDataByPrefix,
  getDataListByPrefix,
  putData,
  saveContent,
  saveContentType,
} from "../data/data";
import { Bindings } from "../types/bindings";

const content = new Hono<{ Bindings: Bindings }>();

content.get("/", async (ctx) => {
  console.log("getting main content");

  const { keysOnly, contentType, includeContentType, limit, offset } =
    ctx.req.query();

  const fetchLimit = limit ?? 100;

  console.log("params-->", keysOnly, contentType, includeContentType);

  let content = [];
  if (keysOnly !== undefined) {
    console.log("getting keys only");
    const list = await getDataListByPrefix(ctx.env.KVDATA, `site1::content::`);
    content = list.keys.map((c) => c.name);
  } else if (contentType !== undefined) {
    content = await getDataByPrefix(
      ctx.env.KVDATA,
      `site1::content::${contentType}`
    );
  } else {
    content = await getDataByPrefix(
      ctx.env.KVDATA,
      `site1::content::`,
      fetchLimit
    );
  }

  if (includeContentType !== undefined) {
    const contentTypes = await getContentTypes(ctx.env.KVDATA);

    await content.map(async (c) => {
      const contentTypeKey = `site1::content-type::${c.systemId}`;
      const ct = contentTypes.find((c) => c.key === contentTypeKey);
      c.contentType = ct; //
    });
    return ctx.json(content);
  }

  return ctx.json(content);
});

content.get("/:contentId", async (ctx) => {
  const id = ctx.req.param("contentId");
  const { includeContentType } = ctx.req.query();

  console.log("params-->", includeContentType);

  const content = await getById(ctx.env.KVDATA, `${id}`);

  const data = content.data;
  const dataWithKey = { key: id, ...data }; //add key to top of object
  delete dataWithKey.submit;

  if (includeContentType !== undefined) {
    dataWithKey.contentType = await getContentType(
      ctx.env.KVDATA,
      content.data.systemId
    );
  }

  return ctx.json(dataWithKey);
});

content.get("/contents/:contype-type", async (ctx) => {
  const contentType = ctx.req.param("contype-type");

  const content = await getDataByPrefix(
    ctx.env.KVDATA,
    `site1::content::${contentType}`
  );
  console.log("content", content);
  return ctx.json(content);
});

content.get("/contents-with-meta/:contype-type", async (ctx) => {
  const contentType = ctx.req.param("contype-type");

  const content = await getDataListByPrefix(
    ctx.env.KVDATA,
    `site1::content::${contentType}`
  );
  console.log("content", content);
  return ctx.json(content);
});

content.post("/", async (c) => {
  const content = await c.req.json();
  const key = content.key;

  const result = await saveContent(c.env.KVDATA, "site1", content, key);

  const status = key ? 204 : 201;

  return c.text("", status);
});

export { content };
