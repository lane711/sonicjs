import { Bindings } from "hono/types";

export const bucketUploadFile = async (ctx: Bindings, file: File) => {
  try {
    const bucket = ctx.R2_BUCKET as R2Bucket;
    const { name, size, type } = file;
    await bucket.put(name, file);
    return {
      name,
      size,
      type,
      sha1: await sha1(file),
    };
  } catch (error) {
    return error;
  }
};

export const bucketDeleteFile = async (ctx: Bindings, filename: string) => {
  const bucket = ctx.R2_BUCKET as R2Bucket;
  await bucket.delete(filename);
  return { success: true };
};

export const bucketGetFile = async (
  ctx: Bindings,
  filename: string,
  format: "blob" | "arrayBuffer" | "sha1" | "text" | null
) => {
  const bucket = ctx.R2_BUCKET as R2Bucket;
  const object = await bucket.get(filename);
  if (!format || format === null) {
    return object;
  } else if (format === "sha1") {
    return sha1(object);
  }
  return await object[format]();
};

async function sha1(file) {
  const fileData = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-1", fileData);
  const array = Array.from(new Uint8Array(digest));
  const sha1 = array.map((b) => b.toString(16).padStart(2, "0")).join("");
  return sha1;
}
