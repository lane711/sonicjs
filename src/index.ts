import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { prettyJSON } from 'hono/pretty-json'
import api from './api'
import { Bindings } from './bindings'
const baseUrl = "https://demo.sonicjs.com";

const app = new Hono()

app.get('/', (c) => c.text('Caching'))

app.get("*", async (ctx) => {
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
    response.headers.append("Cache-Control", "s-maxage=10000000000");

    ctx.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    console.log(`Cache hit for: ${ctx.req.url}.`);
  }
  return response;
});

// app.get('/', (c) => c.text('Pretty Blog API'))
// app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

// const middleware = new Hono<{ Bindings: Bindings }>()
// middleware.use('*', prettyJSON())
// middleware.use('/posts/*', async (c, next) => {
//   if (c.req.method !== 'GET') {
//     const auth = basicAuth({ username: c.env.USERNAME, password: c.env.PASSWORD })
//     return auth(c, next)
//   } else {
//     await next()
//   }
// })

// app.route('/api', middleware)
// app.route('/api', api)

export default app
