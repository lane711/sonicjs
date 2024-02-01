import { GetObjectCommandInput } from "./../../../node_modules/@aws-sdk/client-s3/dist-types/commands/GetObjectCommand.d";
import { S3ClientConfig } from "./../../../node_modules/@aws-sdk/client-s3/dist-types/S3Client.d";
import { Bindings } from "hono/types";
import { encode } from "base64-arraybuffer";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
export interface BucketFormats {
  format:
    | "blob"
    | "arrayBuffer"
    | "sha1"
    | "text"
    | "base64"
    | "tempurl"
    | "url"
    | null;
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
    case "tempurl":
      const s3ConfigOptions = {
        region: "auto",
        endpoint: `https://${ctx.ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: ctx.BUCKET_ACCESS_KEY_ID,
          secretAccessKey: ctx.BUCKET_SECRET_ACCESS_KEY,
        },
      } as S3ClientConfig;
      const commandOptions = {
        Bucket: ctx.BUCKET_NAME,
        Key: object.key,
      } as GetObjectCommandInput;
      const S3 = new S3Client(s3ConfigOptions);
      return await getSignedUrl(S3, new GetObjectCommand(commandOptions), {
        expiresIn: 3600,
      });
      break;
    case "url":
      return `${ctx.BUCKET_CUSTOM_DOMAIN}/${object.key}`;
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
