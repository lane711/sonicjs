import { return200 } from "@services/return-types";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const start = Date.now();
  let params = context.params;
  console.log("params", params);
  console.log("context.url", context.url);

  const urlToCache = "https://demo.sonicjs.com/api/v1/posts?limit=10";

  console.log("processing url start", urlToCache);

  // Construct the cache key from the cache URL
  const cacheKey = new Request(urlToCache, context.request);
const cache = context.locals.runtime.caches.default;

  // Check whether the value is already available in the cache
  // if not, fetch it from origin, and store it in the cache
  let response = await cache.match(urlToCache);

  if (!response) {
    console.log(`--> MISS: ${urlToCache}`);
    // If not in cache, get it from origin
    response = await fetch(urlToCache);

    // Must use Response constructor to inherit all of response's fields
    response = new Response(response.body, response);

    // Cache API respects Cache-Control headers. Setting s-max-age to 10
    // will limit the response to be in cache for 10 seconds max

    // Any changes made to the response here will be reflected in the cached value
    response.headers.append("Cache-Control", "s-maxage=2592000");
    response.headers.append("SonicJs-Source", "fetch");

    postProcessRequest(context, cache, cacheKey, urlToCache, response, start);
    return response;
  } else {
    console.log( `--> HIT: ${urlToCache}`);
    const responeCloned = new Response(response.body, response);
    responeCloned.headers.delete("SonicJs-Source");
    responeCloned.headers.append("SonicJs-Source", "cache");

    return responeCloned;
  }

  return new Response(JSON.stringify({ url: "check" }), {
    headers: { "Content-Type": "application/json" },
  });
};

const postProcessRequest = (
  ctx,
  cache,
  cacheKey,
  cacheUrl,
  response,
  start
) => {
  putInCache(ctx, cache, cacheKey, response);

//   storeUrlInDB(ctx, cacheUrl);

  const end = Date.now();
  const executionTime = end - start;
  // insertStatInDB(ctx, cacheUrl, executionTime);
  // addToKVCache(ctx, cacheKey, response);
};

const putInCache = (ctx, cache, cacheKey, response) => {
  //HACK: for testing
  try {
    cache.put(cacheKey, response.clone());
    //   ctx.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    console.log(`--> ADDED: ${cacheKey}`);
  } catch (error) {
    console.error("unable to cache put", error);
  }
};
