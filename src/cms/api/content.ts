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

const content = new Hono<{ Bindings: Bindings }>();

content.get("/", async (ctx) => {

  // const metaData = await getDataByPrefix(
  //   ctx.env.KVDATA,
  //   `site1::content::blog`
  // );
  // return ctx.json(metaData);

  const { meta, contentType, includeContentType, limit, offset } =
    ctx.req.query();

    console.log('params-->', meta, contentType, includeContentType)

  let content = [];
  if (meta) {
    content = await getDataListByPrefix(ctx.env.KVDATA, `site1::content::`);
  } else if (contentType) {
    content = await getDataByPrefix(
      ctx.env.KVDATA,
      `site1::content::${contentType}`
    );
  } else {
    content = await getDataByPrefix(ctx.env.KVDATA, `site1::content::`);
  }

  if (includeContentType) {
    console.log('----> getting content typez -->')

    content.map(async (c) => {
      console.log('----> getting content type -->', c.systemId)

      // let contentType = await getById(
      //   ctx.env.KVDATA,
      //   `site1::content-type::${c.systemId}`
      // );
      // console.log('====data  contentType ', contentType)

      c.contentType = [];

    });
    console.log('data with ct ', content)
    return ctx.json(content);

  }

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
