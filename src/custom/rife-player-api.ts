import { Context, Env, Hono } from 'hono';
import { getPrograms, checkUserExists } from './rife-player-data';
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

rifePlayerApi.get('/check-user-exists/:email', async (ctx) => {
  const email = ctx.req.param('email');

  const data = await checkUserExists(ctx, email);
  return ctx.json(data);
});

rifePlayerApi.post('/contact-submit', async (ctx) => {

  console.log('contact processing ')
  const payload = await ctx.req.json();
  console.log('contact payload ', payload)

  const token = payload.token;
  console.log('contact token ', token)

  if (token !== ctx.env.APIKEY) {
    console.log('contact bad token ')
    return ctx.text('Unauthorized', 401);
  }

  payload.table = 'contacts';

  const record = await insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, payload);

  console.log('contact record ', record)

  //send email confirmations
  const fullName = payload.data.lastName
    ? `${payload.data.firstName} ${payload.data.lastName}`
    : payload.data.firstName;
  const messageHtml = payload.data.message.replace(/(?:\r\n|\r|\n)/g, '<br>');
  const html = `<p>Hello ${payload.data.firstName},<p>Thanks for reaching out. We will get back to you asap.</p><p>For your reference, your message was:</p><p><hr></p><p>${fullName}:</p><p>${messageHtml}</p><p><hr></p><p>Thank you,<br>RifePlayer Support</p>`;

  if (
    ctx.env.SENDGRID_ENABLED === true ||
    ctx.env.SENDGRID_ENABLED === 'true'
  ) {
    //send to visitor
    console.log('contact send mail enabled ')
    sendEmail(
      ctx,
      payload.data.email,
      payload.data.firstName,
      ctx.env.SENDGRID_EMAIL_SENDER,
      ctx.env.SENDGRID_EMAIL_SENDER_NAME,
      payload.data.email,
      payload.data.firstName,
      'RifePlayer Message Received',
      html
    );

    //send to admin
    await sendEmail(
      ctx,
      ctx.env.SENDGRID_EMAIL_SENDER,
      ctx.env.SENDGRID_EMAIL_SENDER_NAME,
      ctx.env.SENDGRID_EMAIL_SENDER,
      ctx.env.SENDGRID_EMAIL_SENDER_NAME,
      payload.data.email,
      fullName,
      'RifePlayer Message Received',
      html
    );
  }

  console.log('contact returning ', record.data, record.code)

  return ctx.json(record.data, record.code);
});

export { rifePlayerApi };
