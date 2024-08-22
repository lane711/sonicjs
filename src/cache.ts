import { Hono } from "hono";
import { Bindings } from "./bindings";

const cache = new Hono<{ Bindings: Bindings }>();
const baseUrl = "https://demo.sonicjs.com";

cache.get("/", (c) => {
  return c.text("Hello SonicJs");
});

cache.get("*", async (ctx) => {
  const cacheUrl = new URL(ctx.req.url);

  // Construct the cache key from the cache URL
  const cacheKey = new Request(cacheUrl.toString(), ctx.req);
  const cache = caches.default;

  // Check whether the value is already available in the cache
  // if not, you will need to fetch it from origin, and store it in the cache
  let response = await cache.match(cacheKey);

  if (!response) {
    console.log(
      `Response for request url: ${ctx.req.url} not present in cache. Fetching and caching request.`
    );

    let url = new URL(ctx.req.url);
    let path = url.pathname + url.search;
    const fetchUrl = `${baseUrl}${path}`;
    response = await fetch(fetchUrl);
    response = new Response(response.body, response);
    response.headers.append("Cache-Control", "s-maxage=2592000"); //30 days
    response.headers.append("SonicJs-Source", "fetch");
    postProcessRequest(ctx, cacheKey, response);
    return response;
  } else {
    console.log(`Cache hit for: ${ctx.req.url}.`);
    const responeCloned = new Response(response.body, response);
    responeCloned.headers.append("SonicJs-Cache", "cache");
    return responeCloned;
  }
});

const postProcessRequest = (ctx, cacheKey, response) => {
  putInCache(ctx, cacheKey, response);
  storeUrlInDB(ctx, cacheKey, response);
  addToKVCache(ctx, cacheKey, response);
};

const putInCache = (ctx, cacheKey, response) => {
  //HACK: for testing
  try {
    ctx.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  } catch (error) {
    console.error("unable to cache put", error);
  }
};

const addToKVCache = (ctx, cacheKey, response) => {
  //HACK: for testing
  try {
    // ctx.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  } catch (error) {
    console.error("unable to addToKVCache", error);
  }
};

const storeUrlInDB = (ctx, cacheKey, response) => {
  //HACK: for testing
  try {
    // ctx.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  } catch (error) {
    console.error("unable to storeUrlInDB", error);
  }
};

export default cache;
