import { return200 } from "@services/return-types";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const request = context.request;
  const cacheUrl = new URL(context.url);

  // Construct the cache key from the cache URL
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = context.locals.runtime.caches.default;

  console.log('before', cache)

  cache.put('cacheKey', { message: "Cache test" });

  console.log('after', cache)


return return200({ message: "Cache test" });
};
