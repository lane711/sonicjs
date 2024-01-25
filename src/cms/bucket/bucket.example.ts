import { Hono } from "hono";
import { bucketGetFile, bucketUploadFile } from "./bucket";

const bucket = new Hono();

bucket.get("/", (ctx) => {
  return ctx.html(`
  <h1>Bucket Form Example</h1>
  <form method="POST" enctype="multipart/form-data">
    <input type="text" name="filename" placeholder="filename" />
    <br><br>
    <input type="file" name="file" />
    <br><br>
    <button type="submit">Upload</button>
  </form>
  `);
});

bucket.post("/", async (ctx) => {
  const body = await ctx.req.parseBody();
  const filename = body.filename;
  await bucketUploadFile(ctx.env, filename, body.file);
  const object = await bucketGetFile(ctx.env, filename, "blob");
  return ctx.newResponse(object);
});

export { bucket };
