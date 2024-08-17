import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Bindings } from './bindings'
import * as model from './model'

const cache = new Hono<{ Bindings: Bindings }>()
const baseUrl = 'https://demo.sonicjs.com'

// cache.get('/', (c) => {
//   return c.json({ message: 'Hello' })
// })


cache.get('*', async(ctx) => {
  
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

    console.log('--->', ctx.req.url)
    // If not in cache, get it from origin
    const fetchUrl = 'https://demo.sonicjs.com/v1/categories?limit=2';// `${baseUrl}${ctx.req.url}`;
    response = await fetch(fetchUrl);

    // Must use Response constructor to inherit all of response's fields
    response = new Response(response.body, response);

    // Cache API respects Cache-Control headers. Setting s-max-age to 10
    // will limit the response to be in cache for 10 seconds max

    // Any changes made to the response here will be reflected in the cached value
    response.headers.append("Cache-Control", "s-maxage=10000000000");

    ctx.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    console.log(`Cache hit for: ${ctx.req.url}.`);
  }
  return response;

});

export default cache
