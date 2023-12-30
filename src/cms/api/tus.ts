import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { Variables } from "../../server";
import { TussleCloudflareWorker } from "@tussle/middleware-cloudflareworker";
import { TussleStateMemory } from "@tussle/state-memory";
import { R2UploadState, TussleStorageR2 } from "@tussle/storage-r2";
export const tusAPI = new Hono<{ Bindings: Bindings; Variables: Variables }>();
const stateService = new TussleStateMemory<R2UploadState>();

tusAPI.all("/", async (ctx) => {
  const request = ctx.req;
  if (request.method === "HEAD") {
    const cache = await caches.default.match(request.url);
    if (cache) {
      return cache;
    }
  }
  const user = ctx.get("user");
  console.log("user", user);
  console.log("storage", ctx.env.R2_STORAGE);
  const storage = new TussleStorageR2({
    stateService,
    bucket: ctx.env.R2_STORAGE,
    skipMerge: false,
  });
  const tussle = getTussleMiddleware(storage);
  const cfRequest = ctx.req.raw;
  const context = ctx.executionCtx;
  let res = await tussle.handleRequest(cfRequest, { context });
  if (res) {
    return res;
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
  console.log("CACHED " + url.toString());
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
  return (storage: TussleStorageR2) => {
    if (!instance) {
      instance = new TussleCloudflareWorker({
        hooks: {
          "before-create": async (_ctx, params) => {
            console.log("before-create", JSON.stringify(params, null, 2));
            let path: string;
            switch (params.uploadConcat?.action) {
              case "partial": // Creating a file to hold a segment of a parallel upload.
                path = params.path + "/segments/" + crypto.randomUUID();
                break;
              case "final": // Finishing a parallel upload (combines multiple 'partials' from above)
              default:
                path = params.path + "/" + crypto.randomUUID();
                break;
            }
            console.log({ path });
            return {
              ...params,
              path,
            };
          },
          "after-complete": async (ctx, params) => {
            const { location, offset } = params;
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
