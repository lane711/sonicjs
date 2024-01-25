import { Bindings } from "hono/types";

export const bucketUploadFile = async (
  ctx: Bindings,
  filename: string,
  data: string | Buffer | File | Object
) => {
  const bucket = ctx.R2_BUCKET as R2Bucket;
  return await bucket.put(filename, data);
};

export const bucketDeleteFile = async (ctx: Bindings, filename: string) => {
  const bucket = ctx.R2_BUCKET as R2Bucket;
  return await bucket.delete(filename);
};

export const bucketGetFile = async (
  ctx: Bindings,
  filename: string,
  format: "blob" | "arrayBuffer" | ""
) => {
  const bucket = ctx.R2_BUCKET as R2Bucket;
  const object = await bucket.get(filename);
  if (!format) {
    return object;
  }
  return await object[format]();
};
