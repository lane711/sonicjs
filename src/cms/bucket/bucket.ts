import { Bindings } from "hono/types";
import { encode } from "base64-arraybuffer";
export const bucketUploadFile = async (
  ctx: Bindings,
  file: File,
  base64return: string
) => {
  try {
    const bucket = ctx.R2_BUCKET as R2Bucket;
    const { name, size, type } = file;
    const ab = await file.arrayBuffer();
    let response;
    await bucket.put(name, file);
    if (base64return) {
      const base64 = "data:" + type + ";base64," + encode(ab);
      response = {
        success: 1,
        file: {
          url: base64,
        },
        sha1: await sha1(file),
      };
    } else {
      response = {
        name,
        size,
        type,
        sha1: await sha1(file),
      };
    }
    return response;
  } catch (error) {
    console.log("error", error);
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
