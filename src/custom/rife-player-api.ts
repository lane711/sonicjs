import { Hono } from 'hono';
import { getPrograms } from './rife-player-data';
import { insertRecord } from '../cms/data/data';

const rifePlayerApi = new Hono();

rifePlayerApi.get('/', async (ctx) => {
  return ctx.text('Hello RifePlayer');
});

rifePlayerApi.get('/programs', async (ctx) => {
  const data = await getPrograms(ctx);
  return ctx.json(data);
});

rifePlayerApi.post('/contact-submit', async (ctx) => {
  const payload = await ctx.req.json();

  const token = payload.token;
  if(token !== ctx.env.APIKEY){
    return ctx.text('Unauthorized', 401);
  }

  payload.table = 'contacts';

  const record = await insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, payload);

  //send email confirmations

  return ctx.json(record.data, record.code);
});

export { rifePlayerApi };
