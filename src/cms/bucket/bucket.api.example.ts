import { Hono } from "hono";
import { bucketGetFile, bucketUploadFile, bucketDeleteFile } from "./bucket";

const bucketApiExample = new Hono();

bucketApiExample.get("/", async (ctx) => {
  try {
    const key = await ctx.req.query("key");
    const method = await ctx.req.query("method");
    let result = {};
    if (key && !method) {
      result["image"] = await bucketGetFile(ctx.env, key, "sha1");
    } else if (key && method) {
      switch (method) {
        case "sha1":
          result["image"] = await bucketGetFile(ctx.env, key, "sha1");
          break;
        case "text":
          result["image"] = await bucketGetFile(ctx.env, key, "text");
          break;
        case "arrayBuffer":
          result["image"] = await bucketGetFile(ctx.env, key, "arrayBuffer");
          break;
        case "blob":
          const object = (await bucketGetFile(ctx.env, key, null)) as R2Object;
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set("etag", object.httpEtag);
          return ctx.newResponse(object.body, { headers });
      }
    } else {
      result = {
        parameters: {
          type: "querystring",
          key: "file name as string",
          method: "the desired output: blob | text | sha1 | text",
        },
      };
    }
    return ctx.json(result);
  } catch (error) {
    return ctx.json({ error }, 404);
  }
});

bucketApiExample.post("/", async (ctx) => {
  const body = await ctx.req.parseBody();
  const file = body.file as File;
  const result = await bucketUploadFile(ctx.env, file);
  return ctx.json(result);
});

bucketApiExample.delete("/", async (ctx) => {
  const body = await ctx.req.parseBody();
  const filename = body.filename as String;
  const result = await bucketDeleteFile(ctx.env, filename);
  return ctx.json(result);
});

export { bucketApiExample };
