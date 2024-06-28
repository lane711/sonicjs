import { Context, Hono, Next } from 'hono';
import { cors } from 'hono/cors';

import { api } from './cms/api/api';
import { authAPI } from './cms/admin/auth';
import { Bindings } from './cms/types/bindings';
import { admin } from './cms/admin/admin';
import { migrate } from './custom/migrate';
import { status } from './cms/api/status';
import { log } from './cms/util/logger';
import { tusAPI } from './cms/api/tus';

import { AuthRequest, Session, User } from 'lucia';
import { initializeLucia } from './cms/auth/lucia';
import { rifePlayerApi } from './custom/rife-player-api';

export type Variables = {
  authRequest: AuthRequest;
  session?: Session;
  user?: User;
};
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

export type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;

app.use('*', async (ctx, next) => {
  const path = ctx.req.path;
  if (!path.includes('/public')) {
    const auth = initializeLucia(ctx.env.D1DATA, ctx.env);
    const authRequest = auth.handleRequest(ctx);
    let session = await authRequest.validate();
    if (!session) {
      session = await authRequest.validateBearerToken();
    }
    if (session?.user?.userId) {
      ctx.set('user', session.user);
    }

    authRequest.setSession(session);

    ctx.set('authRequest', authRequest);
    ctx.set('session', session);
  }
  await next();
});

//CORS
app.use(
  '/v1/*',
  cors({
    origin: (origin) => {
      return checkOrigin(origin);
    }
  })
);

app.use(
  '/v2/*',
  cors({
    origin: (origin) => {
      return checkOrigin(origin);
    }
  })
);

function checkOrigin(origin) {
  return origin.indexOf('localhost') > 0 ||
    origin.endsWith('.rifeplayer.com') ||
    origin.endsWith('.rifeplayer.pages.dev') ||
    origin.endsWith('.stripe.com')
    ? origin
    : 'https://app.rifeplayer.com';
}

//request Logging
app.use('*', async (ctx, next) => {
  if (ctx.req.path.indexOf('/admin') == 0 || ctx.req.path.indexOf('/v') == 0) {
    log(ctx, { level: 'info', method: ctx.req.method, url: ctx.req.path });
  }
  await next();
});

//auth

app.onError((err, ctx) => {
  console.log(`SonicJs Error: ${err}`);
  log(ctx, { level: 'error', message: err });

  return ctx.text('SonicJs Error', 500);
});

app.get('/', async (ctx) => {
  return ctx.redirect('/admin');
});

app.get('/public/*', async (ctx) => {
  return await ctx.env.ASSETS.fetch(ctx.req.raw);
});

app.route('/v1', api);
app.route('/v2', rifePlayerApi);
app.route('/v1/auth', authAPI);
app.route('/admin', admin);
app.route('v1/migrate', migrate);
app.route('/status', status);
app.route('/tus', tusAPI);

export default app;
