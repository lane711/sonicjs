import { Hono } from "hono";
import {
  bucketGetFile,
  bucketUploadFile,
  bucketDeleteFile,
  BucketFormats,
} from "./bucket";

const bucketApi = new Hono();

bucketApi.get("/", async (ctx) => {
  try {
    const key = await ctx.req.query("key");
    const method = await ctx.req.query("method");
    let result = {};
    if (!key && !method) {
      result = {
        parameters: {
          type: "querystring",
          key: "file name as string",
          method: "the desired output: blob | text | sha1 | text",
        },
      };
    }
    if (method == "blob") {
      const object = (await bucketGetFile(ctx.env, key, null)) as R2Object;
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      return ctx.newResponse(object.body, { headers });
    }
    result["image"] = await bucketGetFile(ctx.env, key, method);
    return ctx.json(result);
  } catch (error) {
    return ctx.json({ error }, 404);
  }
});

bucketApi.post("/", async (ctx) => {
  try {
    const body = await ctx.req.parseBody();
    const file = body.file as File;
    const methodQuery = ctx.req.query("method") as unknown as BucketFormats; // ?method=base64
    let result = await bucketUploadFile(ctx.env, file);
    if (methodQuery) {
      const base64 = await bucketGetFile(ctx.env, result.name, methodQuery);
      result = {
        success: 1,
        file: {
          url: base64,
        },
      };
    }
    return ctx.json(result);
  } catch (error) {
    console.log(error);
    return ctx.json(error);
  }
});

bucketApi.delete("/", async (ctx) => {
  const body = await ctx.req.parseBody();
  const filename = body.filename as String;
  const result = await bucketDeleteFile(ctx.env, filename);
  return ctx.json(result);
});

export { bucketApi };
