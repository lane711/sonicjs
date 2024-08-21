import { Hono } from "hono";
import { Bindings } from "./bindings";

const cache = new Hono<{ Bindings: Bindings }>();

// cache.get("*", (c) => {
//   return c.json({ message: "Hello" });
// });

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
    console.log("--->", fetchUrl);

    response = await fetch(fetchUrl);

    // Must use Response constructor to inherit all of response's fields
    response = new Response(response.body, response);

    // Cache API respects Cache-Control headers. Setting s-max-age to 10
    // will limit the response to be in cache for 10 seconds max

    // Any changes made to the response here will be reflected in the cached value
    response.headers.append("Cache-Control", "s-maxage=2592000"); //30 days
    response.headers.append("SonicJs-Cache", "miss");

    ctx.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } else {
    console.log(`Cache hit for: ${ctx.req.url}.`);
    const responeCloned = response.clone();
    // responeCloned.headers.append("SonicJs-Cache", "hit");
    return responeCloned;
  }
});

export default cache;
