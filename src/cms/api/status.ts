import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import { getD1DataByTable } from '../data/d1-data';
import { addToKvCache, getById, getRecordFromKvCache } from '../data/kv-data';
import { log, timerLog } from '../util/logger';
import {
  addToInMemoryCache,
  getFromInMemoryCache,
  isCacheValid
} from '../data/cache';
import { cache } from 'hono/cache';
import qs from 'qs';

const status = new Hono<{ Bindings: Bindings }>();

status.get('/', async (ctx) => {
  console.log('status', Date());
  // TODO any
  var status = {} as any;

  status.webServer = 'ok';

  //D1
  try {
    const { results } = await ctx.env.D1DATA.prepare(
      "SELECT name, type, sql FROM sqlite_schema WHERE type IN ('index');"
    ).all();
    status.d1 = 'ok';
    status.d1_indexes = results;
  } catch (error) {
    status.d1 = 'error: ' + error;
  }

  //drizzle
  try {
    const d1Data = await getD1DataByTable(ctx.env.D1DATA, 'users', {
      limit: 1
    });
    status.drizzle = 'ok';
  } catch (error) {
    status.drizzle = 'error: ' + error;
  }

  //kv
  try {
    const allKvItems = await getById(ctx.env.KVDATA, '1');
    status.kv = 'ok';
  } catch (error) {
    status.kv = 'error: ' + error;
  }

  //cache
  try {
    const now = new Date().getTime().toString();
    const newCacheItem = await addToInMemoryCache(ctx, now, { status: 'ok' });
    const itemFromCache = await getFromInMemoryCache(ctx, now);
    status.cache = itemFromCache[0].data.status;
    status.cacheIsValid = await isCacheValid();
  } catch (error) {
    status.cache = 'error: ' + error;
  }

  //env
  try {
    // status.env = ctx.env;
    var safeOutput = {};
    for (var prop in ctx.env) {
      if (Object.prototype.hasOwnProperty.call(ctx.env, prop)) {
        if (ctx.env.show_env_vars === 'true') {
          safeOutput[prop] = ctx.env[prop];
        } else {
          safeOutput[prop] = '[redacted]';
        }
      }
      status.env = safeOutput;
    }
  } catch (error) {
    status.env = 'error: ' + error;
  }

  return ctx.json(status);
});

status.get('/log', async (ctx) => {
  log(ctx, { level: 'error', messaage: 'test from the logger 2' });

  return ctx.json({ ok: 'ok' });
});

status.get('/20records', async (ctx) => {
  const start = Date.now();

  try {
    const d1Data = await getD1DataByTable(ctx.env.D1DATA, 'users', {
      limit: 20
    });

    const end = Date.now();
    const executionTime = end - start;

    return ctx.json({ ...d1Data, executionTime, source: 'd1' });
  } catch (error) {
    return ctx.text(error);
  }
});

status.get('/20recordskv', async (ctx) => {
  const start = Date.now();

  const host = ctx.req.url.split(ctx.req.path)[0];
  const cacheKey = `${host}/v1/posts?limit=20`;
  try {
    const kvData = await getRecordFromKvCache(ctx.env.KVDATA, cacheKey);

    const end = Date.now();
    const executionTime = end - start;

    return ctx.json({ ...kvData, executionTime, source: 'kv' });
  } catch (error) {
    return ctx.text(error);
  }
});

// status.get('/hono-cache', async (ctx) => {

//   const  mycache =  cache({
//     cacheName: 'my-app',
//     cacheControl: 'max-age=3600',
//   })

// mycache.

//   cache.add('/v1/posts?limit=10');

//   const cachedResponse = await cache.match(ctx.req.url);
//   console.log('cachedResponse', cachedResponse);
//   let cachedData = await getCachedData(cacheName, ctx.req.url);
//   console.log('cachedData', cachedData);

//   if (cachedResponse) {
//     console.log('cache found');
//     return cachedResponse;
//   }

//   const data = await longRunningDataCall(ctx);

//   // cache.add(ctx.req)
//   // await cache.match(ctx.req);

//   const response = ctx.json({ data, source: 'cc-cache' });
//   cache.put(ctx.req.raw, response.clone());
// });

status.get('/cc-cache', async (ctx) => {
  const cacheVersion = 1;
  const cacheName = `myapp-${cacheVersion}`;

  // const url = "https://jsonplaceholder.typicode.com/todos/1";
  // let cachedData = await cache. getCachedData(cacheName, url);

  let cache = caches.default;

  const cachedResponse = await cache.match(ctx.req.url);
  console.log('cachedResponse', cachedResponse);
  let cachedData = await getCachedData(cacheName, ctx.req.url);
  console.log('cachedData', cachedData);

  if (cachedResponse) {
    console.log('cache found');
    return cachedResponse;
  }

  const data = await longRunningDataCall(ctx);

  // cache.add(ctx.req)
  // await cache.match(ctx.req);

  const response = ctx.json({ data, source: 'cc-cache' });
  cache.put(ctx.req.raw, response.clone());

  return response;
});

status.get('/cc-cache2', async (ctx) => {
  const start = Date.now();

  const query = ctx.req.query();
  const params = qs.parse(query);
  const limit = params?.limit ?? 20;

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
    // If not in cache, get it from origin
    // response = await fetch(ctx.req);

    const data = await longRunningDataCall(ctx, limit);

    // cache.add(ctx.req)
    // await cache.match(ctx.req);

    response = ctx.json({ data, source: 'cc-cache' });

    // Must use Response constructor to inherit all of response's fields
    // response = new Response(response.body, response);

    // Cache API respects Cache-Control headers. Setting s-max-age to 10
    // will limit the response to be in cache for 10 seconds max

    // Any changes made to the response here will be reflected in the cached value
    response.headers.append('Cache-Control', 's-maxage=10');

    ctx.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    console.log(`Cache hit for: ${ctx.req.url}.`);
  }

  const end = Date.now();
  // const executionTime = end - start;
  timerLog('cc-cache2', start, end);

  return response;
});

async function getCachedData(cacheName, url) {
  const cacheStorage = await caches.open(cacheName);
  const cachedResponse = await cacheStorage.match(url);

  if (!cachedResponse || !cachedResponse.ok) {
    return false;
  }

  return await cachedResponse.json();
}

status.get('/waituntil1', async (ctx) => {
  const data = { hello: 'ok' };
  const start = Date.now();

  //do nothing

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ data, executionTime, source: 'kv' });
});

status.get('/waituntil2', async (ctx) => {
  const data = { hello: 'ok' };
  const start = Date.now();

  ctx.executionCtx.waitUntil(longRunningDataCall(ctx));

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ data, executionTime, source: 'kv' });
});

const longRunningDataCall = async (ctx, limit) => {
  const { results } = await ctx.env.D1DATA.prepare(
    `SELECT * FROM posts limit ${limit};`
  ).all();
  console.log('longRunningDataCall count:', results.length);
  return results;
};

status.get('/geo', (ctx) => {
  let html_content = '';
  let html_style =
    'body{padding:6em; font-family: sans-serif;} h1{color:#f6821f;}';

  // TODO any
  const cf = (ctx.req as any).cf;
  html_content += '<p> Colo: ' + cf.colo + '</p>';
  html_content += '<p> Country: ' + cf.country + '</p>';
  html_content += '<p> City: ' + cf.city + '</p>';
  html_content += '<p> Continent: ' + cf.continent + '</p>';
  html_content += '<p> Latitude: ' + cf.latitude + '</p>';
  html_content += '<p> Longitude: ' + cf.longitude + '</p>';
  html_content += '<p> PostalCode: ' + cf.postalCode + '</p>';
  html_content += '<p> MetroCode: ' + cf.metroCode + '</p>';
  html_content += '<p> Region: ' + cf.region + '</p>';
  html_content += '<p> RegionCode: ' + cf.regionCode + '</p>';
  html_content += '<p> Timezone: ' + cf.timezone + '</p>';

  let html = `<!DOCTYPE html>
      <head>
        <title> Geolocation: Hello World </title>
        <style> ${html_style} </style>
      </head>
      <body>
        <h1>Geolocation: Hello World!</h1>
        <p>You now have access to geolocation data about where your user is visiting from.</p>
        ${html_content}
      </body>`;
  return ctx.html(html_content);
});

(async function () {
  // add startup entry to cache
  const now = new Date().getTime().toString();
  const newCacheItem = await addToInMemoryCache({}, 'system::startup', {
    started: now
  });
})();

export { status };
