import { Hono } from "hono";
import { bucketGetFile, bucketUploadFile } from "./bucket";

const bucket = new Hono();

bucket.get("/", (ctx) => {
  return ctx.html(`
  <h1>Bucket Form Example</h1>
  <form method="POST" enctype="multipart/form-data">
    <input type="file" name="file" />
    <br><br>
    <button type="submit">Upload</button>
  </form>
  `);
});

bucket.post("/", async (ctx) => {
  const body = await ctx.req.parseBody();
  const file = body.file as File;
  const result = await bucketUploadFile(ctx.env, file);
  // After uploading, get the same file and show on the screen
  const object = (await bucketGetFile(ctx.env, result.name, null)) as R2Object;
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  return ctx.newResponse(object.body, { headers });
});

export { bucket };
