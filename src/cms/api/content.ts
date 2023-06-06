import { Hono } from "hono";
import { getForm, loadForm } from "../admin/forms/form";
import {
  getById,
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

  console.log("params-->", keysOnly, contentType, includeContentType);

  let content = [];
  if (keysOnly) {
    console.log('getting keys only')
    content = await getDataListByPrefix(ctx.env.KVDATA, `site1::content::`);

  } else if (contentType) {
    content = await getDataByPrefix(
      ctx.env.KVDATA,
      `site1::content::${contentType}`
    );
    console.log("content ***", content);
  } else {
    console.log('getting meta')
    content = await getDataByPrefix(ctx.env.KVDATA, `site1::content::`);


  }

  if (includeContentType) {
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
  const content = await getById(ctx.env.KVDATA, `${id}`);

  return ctx.json(content);
});

content.get("/contents/:contype-type", async (ctx) => {
  const contentType = ctx.req.param("contype-type");

  // const content = await getDataListByPrefix(ctx.env.KVDATA, `site1::content::${contentType}`);
  const content = await getDataByPrefix(
    ctx.env.KVDATA,
    `site1::content::${contentType}`
  );
  console.log("content", content);
  return ctx.json(content);
});

content.get("/contents-with-meta/:contype-type", async (ctx) => {
  const contentType = ctx.req.param("contype-type");

  // const content = await getDataListByPrefix(ctx.env.KVDATA, `site1::content::${contentType}`);
  const content = await getDataListByPrefix(
    ctx.env.KVDATA,
    `site1::content::${contentType}`
  );
  console.log("content", content);
  return ctx.json(content);
});

// content.get("/content-with-content-type/:contentId", async (ctx) => {
//   const id = ctx.req.param("contentId");
//   const content = await getById(ctx.env.KVDATA, `${id}`);

//   const contentTypeId = content.data.systemId;
//   const contentType = await getById(
//     ctx.env.KVDATA,
//     `site1::content-type::${contentTypeId}`
//   );

//   return ctx.json({ content, contentType });
// });

content.post("/", async (c) => {
  const content = await c.req.json();
  const key = content.key;
  // console.log("content-->", content);
  //put in kv
  const result = await saveContent(c.env.KVDATA, "site1", content, key);

  const status = key ? 204 : 201;

  return c.text("", status);
});

export { content };
