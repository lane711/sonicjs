import { Bindings } from "hono/types";
import { encode } from "base64-arraybuffer";

export interface BucketFormats {
  format: "blob" | "arrayBuffer" | "sha1" | "text" | "base64" | null;
}

export const bucketUploadFile = async (ctx: Bindings, file: File) => {
  try {
    const bucket = ctx.R2_BUCKET as R2Bucket;
    const { name, size, type } = file;
    let response;
    await bucket.put(name, file);
    response = {
      name,
      size,
      type,
      sha1: await sha1(file),
    };
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
  format: BucketFormats
) => {
  const bucket = ctx.R2_BUCKET as R2Bucket;
  const object = await bucket.get(filename);
  if (!format || format === "null") {
    return object;
  }
  switch (format) {
    case "sha1":
      return sha1(object);
      break;
    case "base64":
      const ext = object.key?.match(/\.([a-zA-Z]+)$/gm)[0].replace(".", "");
      if (!ext) {
        return object;
      }
      const objectArrayBuffer = await object.arrayBuffer();
      const base64image = encode(objectArrayBuffer);
      const imageConverted = "data:image/" + ext + ";base64," + base64image;
      return imageConverted;
      break;
    default:
      return await object[format]();
      break;
  }
};

async function sha1(file) {
  const fileData = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-1", fileData);
  const array = Array.from(new Uint8Array(digest));
  const sha1 = array.map((b) => b.toString(16).padStart(2, "0")).join("");
  return sha1;
}
