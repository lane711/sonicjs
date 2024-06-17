import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import {
  createUser,
  deleteUser,
  initializeLucia,
  login,
  logout,
  updateUser
} from '../auth/lucia';

import qs from 'qs';
import { AppContext, Variables } from '../../server';
import { getRecords } from '../data/data';
import { getForm } from '../api/forms';
import { ApiConfig, config } from '../../db/routes';
import {
  filterCreateFieldAccess,
  filterReadFieldAccess,
  filterUpdateFieldAccess,
  getApiAccessControlResult,
  getItemReadResult,
  getOperationCreateResult,
  hasUser
} from '../auth/auth-helpers';

const authAPI = new Hono<{ Bindings: Bindings; Variables: Variables }>();
authAPI.use('*', async (ctx, next) => {
  const session = ctx.get('session');
  const path = ctx.req.path;
  if (!session && path !== '/v1/auth/login' && path !== '/v1/auth/verify') {
    if (path === '/v1/auth/users/setup') {
      const userExists = await hasUser(ctx);
      if (userExists) {
        let authorized = await getOperationCreateResult(
          operationAccess?.create,
          ctx,
          {}
        );
        if (!authorized) {
          return ctx.text('Unauthorized', 401);
        }
      }
    } else {
      return ctx.text('Unauthorized', 401);
    }
  }
  await next();
});

const userTableConfig = config.apiConfig.find((tbl) => tbl.table === 'users');
const operationAccess = userTableConfig?.access?.operation;
const itemAccess = userTableConfig?.access?.item;
const filterAccess = userTableConfig?.access?.filter;
const fieldsAccess = userTableConfig?.access?.fields;

// View user
authAPI.get(`/users`, async (ctx) => {
  if (userTableConfig.hooks?.beforeOperation) {
    await userTableConfig.hooks?.beforeOperation(ctx, 'read');
  }
  let { includeContentType, source, ...params } = ctx.req.query();
  const accessControlResult = await getApiAccessControlResult(
    operationAccess?.read || true,
    filterAccess?.read || true,
    true,
    ctx,
    undefined,
    'users'
  );

  if (typeof accessControlResult === 'object') {
    params = { ...params, ...accessControlResult };
  }

  if (!accessControlResult) {
    return ctx.text('Unauthorized', 401);
  }
  const start = Date.now();

  try {
    params.limit = params.limit ?? '1000';
    ctx.env.D1DATA = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;
    let data = await getRecords(
      ctx,
      'users',
      params,
      ctx.req.url,
      'fastest',
      undefined
    );

    if (itemAccess?.read) {
      const accessControlResult = await getItemReadResult(
        itemAccess.read,
        ctx,
        data
      );
      if (!accessControlResult) {
        return ctx.text('Unauthorized', 401);
      }
    }
    data.data = await filterReadFieldAccess(fieldsAccess, ctx, data.data);

    if (userTableConfig?.hooks?.afterOperation) {
      await userTableConfig.hooks.afterOperation(
        ctx,
        'read',
        params.id,
        null,
        data
      );
    }
    const end = Date.now();
    const executionTime = end - start;

    return ctx.json({ ...data, executionTime });
  } catch (error) {
    console.log(error);
    return ctx.text(error);
  }
});

// View user by id
authAPI.get(`/users/:id`, async (ctx) => {
  const id = ctx.req.param('id');
  if (userTableConfig.hooks?.beforeOperation) {
    await userTableConfig.hooks?.beforeOperation(ctx, 'read', id);
  }
  let { includeContentType, source, ...params } = ctx.req.query();
  const accessControlResult = await getApiAccessControlResult(
    operationAccess?.read || true,
    filterAccess?.read || true,
    itemAccess?.read || true,
    ctx,
    id,
    'users'
  );

  if (typeof accessControlResult === 'object') {
    params = { ...params, ...accessControlResult };
  }

  if (!accessControlResult) {
    return ctx.text('Unauthorized', 401);
  }
  const start = Date.now();

  params.id = id;
  ctx.env.D1DATA = ctx.env.D1DATA;

  source = source || 'fastest';
  if (includeContentType !== undefined) {
    source = 'd1';
  }

  let data = await getRecords(
    ctx,
    'users',
    params,
    ctx.req.url,
    source,
    undefined
  );

  if (itemAccess?.read) {
    const accessControlResult = await getItemReadResult(
      itemAccess.read,
      ctx,
      data
    );
    if (!accessControlResult) {
      return ctx.text('Unauthorized', 401);
    }
  }
  data.data = await filterReadFieldAccess(fieldsAccess, ctx, data.data);

  if (includeContentType !== undefined) {
    data.contentType = getForm(ctx, 'users');
  }

  if (userTableConfig.hooks?.afterOperation) {
    await userTableConfig.hooks.afterOperation(
      ctx,
      'read',
      id,
      undefined,
      data
    );
  }
  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ ...data, executionTime });
});

//view user by session token
authAPI.get(`/user`, async (ctx) => {
  const start = Date.now();

  const session = ctx.get('session');

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ executionTime, source: 'session', data: session.user });
});

// Create user
authAPI.post(`/users/:setup?`, async (ctx) => {
  let content = await ctx.req.json();
  if (!content.data) {
    content = { data: content };
  }
  content.data.table = 'users';
  content.table = 'users';
  // HACK: need a better fix - this should only apply when the admin is first creating their account
  content.data.role = content.data.role ?? 'admin';

  delete content.data.submit;
  if (
    content.data?.confirmPassword &&
    content.data?.confirmPassword !== content.data?.password
  ) {
    return ctx.text('Passwords do not match', 400);
  }
  delete content.data.confirmPassword;
  if (userTableConfig.hooks?.beforeOperation) {
    await userTableConfig.hooks.beforeOperation(
      ctx,
      'create',
      undefined,
      content
    );
  }
  let authorized = await getOperationCreateResult(
    operationAccess?.create,
    ctx,
    content.data
  );
  if (!authorized) {
    const userExists = await hasUser(ctx);
    if (userExists) {
      return ctx.text('Unauthorized', 401);
    }
  }
  try {
    content.data = await filterCreateFieldAccess(
      fieldsAccess,
      ctx,
      content.data
    );

    if (userTableConfig.hooks?.resolveInput?.create) {
      content.data = await userTableConfig.hooks.resolveInput.create(
        ctx,
        content.data
      );
    }
    if (content.data?.confirm && content.data?.password) {
      if (content.data?.password !== content.data?.confirm) {
        return ctx.text('Passwords do not match', 400);
      }
    }
    delete content.data.confirm;
    const result = await createUser({ content, ctx });
    if (userTableConfig.hooks?.afterOperation) {
      await userTableConfig.hooks.afterOperation(
        ctx,
        'create',
        undefined,
        content,
        result
      );
    }
    return ctx.json(result, 201);
  } catch (error) {
    console.log('error posting user setup content', error);
    return ctx.text(error, 500);
  }
});

// Delete user
authAPI.delete(`/users/:id`, async (ctx) => {
  const id = ctx.req.param('id');

  let { includeContentType, source, ...params } = ctx.req.query();

  if (userTableConfig.hooks?.beforeOperation) {
    await userTableConfig.hooks.beforeOperation(ctx, 'delete', id);
  }
  const accessControlResult = await getApiAccessControlResult(
    operationAccess?.delete || true,
    filterAccess?.delete || true,
    itemAccess?.delete || true,
    ctx,
    id,
    'users'
  );
  if (typeof accessControlResult === 'object') {
    params = { ...params, ...accessControlResult };
  }

  if (!accessControlResult) {
    return ctx.text('Unauthorized', 401);
  }
  //get the records so we use filter params if those are passed in

  let shouldDeleteUser = Object.keys(params).length > 0 ? false : true;

  if (!shouldDeleteUser) {
    params.id = id;
    const data = await getRecords(
      ctx,
      'users',
      params,
      ctx.req.url + '-delete-check',
      source || 'fastest',
      undefined
    );
    if (data?.total > 0) {
      shouldDeleteUser = true;
    }
  }
  let result = ctx.text('', 200);
  if (shouldDeleteUser) {
    result = await deleteUser({ ctx }, id);
  }
  if (userTableConfig.hooks?.afterOperation) {
    await userTableConfig.hooks.afterOperation(
      ctx,
      'delete',
      id,
      undefined,
      result
    );
  }
  return result;
});

// Update user
authAPI.put(`/users/:id`, async (ctx) => {
  const id = ctx.req.param('id');
  let { includeContentType, source, ...params } = ctx.req.query();
  let content = await ctx.req.json();
  if (userTableConfig.hooks?.beforeOperation) {
    await userTableConfig.hooks.beforeOperation(ctx, 'update', id, content);
  }
  const accessControlResult = await getApiAccessControlResult(
    operationAccess?.update || true,
    filterAccess?.update || true,
    itemAccess?.update || true,
    ctx,
    id,
    'users',
    content.data
  );
  if (typeof accessControlResult === 'object') {
    params = { ...params, ...accessControlResult };
  }

  if (!accessControlResult) {
    return ctx.text('Unauthorized', 401);
  }

  let shouldUpdateUser = Object.keys(params).length > 0 ? false : true;

  if (!shouldUpdateUser) {
    //get the record so we use filter params if those are passed in
    params.id = id;
    const data = await getRecords(
      ctx,
      'users',
      params,
      ctx.req.url + '-update-check',
      source || 'fastest',
      undefined
    );
    if (data?.total > 0) {
      shouldUpdateUser = true;
    }
  }
  let result = ctx.text('', 200);
  if (shouldUpdateUser) {
    content.data = await filterUpdateFieldAccess(
      fieldsAccess,
      ctx,
      id,
      content.data
    );
    if (userTableConfig.hooks?.resolveInput?.update) {
      content.data = await userTableConfig.hooks.resolveInput.update(
        ctx,
        id,
        content.data
      );
    }
    result = await updateUser({ ctx, content }, id);
  }
  if (userTableConfig.hooks?.afterOperation) {
    await userTableConfig.hooks.afterOperation(
      ctx,
      'update',
      id,
      content,
      result
    );
  }
  return result;
});

authAPI.post('/login', async (ctx) => {
  const content = await ctx.req.json();
  return await login({ ctx, content });
});

authAPI.get('/logout', async (ctx) => {
  return await logout(ctx);
});

authAPI.get('/verify', async (ctx) => {
  ctx.env.D1DATA = ctx.env.D1DATA;
  const auth = initializeLucia(ctx.env.D1DATA, ctx.env);
  const authRequest = auth.handleRequest(ctx);
  const authenticated = await authRequest.validateBearerToken();
  return ctx.json({
    authenticated
  });
});

authAPI.all('*', (ctx) => ctx.redirect(ctx.req.url.replace('/auth', ''))); // fallback
export { authAPI };
