import { Hono } from 'hono';
import { getPrograms } from './rife-player-data';
import { insertRecord } from '../cms/data/data';
import { sendEmail } from './send-email';

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
  if (token !== ctx.env.APIKEY) {
    return ctx.text('Unauthorized', 401);
  }

  payload.table = 'contacts';

  const record = await insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, payload);

  //send email confirmations
  const html = `Hello ${payload.data.firstName},`;

  if (ctx.env.SENDGRID_ENABLED) {
    //send to visitor
    // sendEmail(
    //   ctx,
    //   payload.data.email,
    //   payload.data.firstName,
    //   ctx.env.SENDGRID_EMAIL_SENDER,
    //   ctx.env.SENDGRID_EMAIL_SENDER_NAME,
    //   payload.data.email,
    //   payload.data.firstName,
    //   'RifePlayer Message Received',
    //   html
    // );

    //send to admin
    sendEmail(
      ctx,
      ctx.env.SENDGRID_EMAIL_SENDER,
      ctx.env.SENDGRID_EMAIL_SENDER_NAME,
      ctx.env.SENDGRID_EMAIL_SENDER,
      ctx.env.SENDGRID_EMAIL_SENDER_NAME,
      payload.data.email,
      payload.data.firstName,
      'RifePlayer Message Received',
      html
    );
  }

  return ctx.json(record.data, record.code);
});

export { rifePlayerApi };
