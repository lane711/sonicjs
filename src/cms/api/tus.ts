import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { AppContext, Variables } from "../../server";
import { TussleCloudflareWorker } from "@tussle/middleware-cloudflareworker";
import { TussleStateMemory } from "@tussle/state-memory";
import { R2UploadState, TussleStorageR2 } from "@tussle/storage-r2";
import { ApiConfig, apiConfig } from "../../db/routes";
import {
  getApiAccessControlResult,
  getOperationCreateResult,
  getOperationUpdateResult,
} from "../auth/auth-helpers";
import { firstValueFrom } from "rxjs";
export const tusAPI = new Hono<{ Bindings: Bindings; Variables: Variables }>();
const stateService = new TussleStateMemory<R2UploadState>();

tusAPI.all("*", async (ctx) => {
  const request = ctx.req;
  // const pathname = "/tus/3e77ec4c-5e0a-4323-b795-c9ffa1a87a52";

  // const storage = new TussleStorageR2({
  //   stateService,
  //   appendUniqueSubdir(location) {
  //     console.log({ location });
  //     return location;
  //   },
  //   bucket: ctx.env.R2_STORAGE,
  //   skipMerge: false,
  // });
  // try {
  //   const fileInfo = await firstValueFrom(
  //     storage.getFileInfo({ location: pathname })
  //   );
  //   const file = await storage.getFile(pathname);
  //   console.log("file info", JSON.stringify(fileInfo, null, 2));
  //   console.log(file);
  //   console.log("bam", file.metadata);
  //   const type = (file.metadata.type || file.metadata.filetype) as string;
  //   ctx.header("Content-Type", type);
  //   ctx.status(200);
  //   return ctx.body(file.body);
  // } catch (error) {
  //   console.log(error);
  // }
  // try {
  //   const file = await storage.getFile(pathname);
  //   console.log(file);
  //   console.log(file.parts);
  //   console.log(file.parts[0]);
  // } catch (error) {
  //   console.log(error);
  // }
  // console.log("req", request.raw);

  const route = request.header("sonic-route");
  const fieldName = request.header("sonic-field");
  const mode = request.header("sonic-mode") as "create" | "update";
  const id = request.header("data-id");
  const table = apiConfig.find((entry) => entry.route === route);

  if (request.method === "HEAD") {
    const cache = await caches.default.match(request.url);
    if (cache) {
      return cache;
    }
  }
  if (table) {
    const field = table.fields?.[fieldName];
    let bucket: R2Bucket;
    let path: string;
    if (field.type === "file") {
      bucket = field.bucket(ctx);
      if (typeof field.path === "string") {
        path = field.path;
      } else if (typeof field.path === "function") {
        path = field.path(ctx);
      } else {
        path = "";
      }
      if (path && path.endsWith("/")) {
        path = path.slice(0, -1);
      }
      if (path && !path.startsWith("/")) {
        path = "/" + path;
      }
      path += "/" + route + path;
    }
    const storage = new TussleStorageR2({
      stateService,
      bucket,
      skipMerge: false,
    });
    const tussle = getTussleMiddleware(storage, table, ctx, mode, id, path);
    const cfRequest = ctx.req.raw;
    const context = ctx.executionCtx;
    let res = await tussle.handleRequest(cfRequest, { context });
    if (res) {
      console.log("res", res);
      for (let [key, value] of res.headers.entries()) {
        console.log(`${key}: ${value}`);
      }
      return res;
    }
  }
  return ctx.text("Not Implemented", 501);
});

type UserParams = {
  context: ExecutionContext;
};
// Optionally use Cloudflare Worker's Cache API to store details for HEAD requests
async function cacheCompletedUploadResponse(
  request: Request,
  location: string,
  offset: number
) {
  const url = new URL(request.url);
  url.pathname = location;
  await caches.default.put(
    url.toString(),
    new Response(null, {
      headers: {
        "Upload-Offset": offset.toString(10),
        "Upload-Length": offset.toString(10),
        "Tus-Resumable": "1.0.0",
        "Cache-Control": "max-age=604800",
      },
    })
  );
}
const getTussleMiddleware = (() => {
  let instance: TussleCloudflareWorker<UserParams>;
  return (
    storage: TussleStorageR2,
    table: ApiConfig,
    honoCtx: AppContext,
    mode: "create" | "update",
    id: string,
    pathConfig: string
  ) => {
    if (!instance) {
      instance = new TussleCloudflareWorker({
        hooks: {
          "before-create": async (_ctx, params) => {
            if (table.hooks?.beforeOperation) {
              await table.hooks.beforeOperation(honoCtx, mode, id, params);
            }
            const filename =
              params.uploadMetadata.filename || params.uploadMetadata.name;

            const fileExtension = "." + filename.split(".").pop();

            console.log("params before", JSON.stringify(params, null, 2));
            const authEnabled = honoCtx.get("authEnabled");

            if (authEnabled) {
              let authorized = true;
              if (mode === "create") {
                authorized = await getOperationCreateResult(
                  table?.access?.operation?.create,
                  honoCtx,
                  params
                );
              } else {
                authorized = !!(await getApiAccessControlResult(
                  table?.access?.operation?.update || true,
                  table?.access?.filter?.update || true,
                  table?.access?.item?.update || true,
                  honoCtx,
                  id,
                  table.table,
                  params
                ));
              }
              if (!authorized) {
                return honoCtx.text("Unauthorized", 401);
              }
            }

            let path: string;
            switch (params.uploadConcat?.action) {
              case "partial": // Creating a file to hold a segment of a parallel upload.
                path =
                  params.path +
                  pathConfig +
                  "/segments/" +
                  crypto.randomUUID() +
                  fileExtension;
                break;
              case "final": // Finishing a parallel upload (combines multiple 'partials' from above)
              default:
                path =
                  params.path +
                  pathConfig +
                  "/" +
                  crypto.randomUUID() +
                  fileExtension;
                break;
            }
            return {
              ...params,
              path,
            };
          },
          "after-complete": async (ctx, params) => {
            if (table?.hooks?.afterOperation) {
              await table.hooks.afterOperation(
                honoCtx,
                mode,
                id,
                params,
                params
              );
            }
            const { location, offset } = params;
            console.log("params after", JSON.stringify(params, null, 2));
            await cacheCompletedUploadResponse(
              ctx.originalRequest,
              location,
              offset
            );
            return params;
          },
        },
        core: {
          storage,
        },
      });
    }
    return instance;
  };
})();
