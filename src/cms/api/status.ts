import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import { getD1DataByTable } from '../data/d1-data';
import { getById } from '../data/kv-data';
import { log } from '../util/logger';
import {
  addToInMemoryCache,
  getFromInMemoryCache,
  isCacheValid
} from '../data/cache';

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
    const d1Data = await getD1DataByTable(
      ctx.env.D1DATA,
      'users',
      {
        limit: 1
      }
    );
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
        safeOutput[prop] = '[redacted]';
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
