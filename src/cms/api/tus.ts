import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import { AppContext, Variables } from '../../server';
import { TussleCloudflareWorker } from '@tussle/middleware-cloudflareworker';
import { TussleStateMemory } from '@tussle/state-memory';
import { R2UploadState, TussleStorageR2 } from '@tussle/storage-r2';
import { ApiConfig, apiConfig } from '../../db/routes';
import {
  getApiAccessControlResult,
  getOperationCreateResult,
  getOperationUpdateResult
} from '../auth/auth-helpers';
import { firstValueFrom } from 'rxjs';
export const tusAPI = new Hono<{ Bindings: Bindings; Variables: Variables }>();
const stateService = new TussleStateMemory<R2UploadState>();

tusAPI.all('*', async (ctx) => {
  const request = ctx.req;

  const route = request.header('sonic-route');
  let fieldName = request.header('sonic-field');
  if (fieldName?.includes('[')) {
    fieldName = fieldName.split('[')[0];
  }
  const mode = request.header('sonic-mode') as 'create' | 'update';
  const id = request.header('data-id');
  const table = apiConfig.find((entry) => entry.route === route);

  if (request.method === 'HEAD') {
    // TODO any
    const cache = await (caches as any).default.match(request.url);
    if (cache) {
      return cache;
    }
  }
  if (request.method === 'GET') {
    const res = handleGET(ctx);
    if (res) {
      return res;
    }
  }
  if (table) {
    const field = table.fields?.[fieldName];
    let bucket: R2Bucket;
    let path: string;
    if (field.type === 'file' || field.type === 'file[]') {
      bucket = field.bucket(ctx);
      if (typeof field.path === 'string') {
        path = field.path;
      } else if (typeof field.path === 'function') {
        path = field.path(ctx);
      } else {
        path = '';
      }
      if (path && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      if (path && !path.startsWith('/')) {
        path = '/' + path;
      }
      path += '/r_' + route + '/f_' + fieldName;
    }
    const storage = new TussleStorageR2({
      stateService,
      bucket,
      skipMerge: false
    });
    const tussle = getTussleMiddleware(storage, table, ctx, mode, id, path);
    const cfRequest = ctx.req.raw;
    const context = ctx.executionCtx;
    let res = await tussle.handleRequest(cfRequest, { context });
    if (res) {
      return res;
    }
  }
  return ctx.text('Not Implemented', 501);
});

type UserParams = {
  context: ExecutionContext;
};
// Optionally use Cloudflare Worker's Cache API to store details for HEAD requests
async function cacheCompletedUploadResponse(
  request: Request,
  location: string,
  offset: number
) {
  const url = new URL(request.url);
  url.pathname = location;
  // TODO any
  await (caches as any).default.put(
    url.toString(),
    new Response(null, {
      headers: {
        'Upload-Offset': offset.toString(10),
        'Upload-Length': offset.toString(10),
        'Tus-Resumable': '1.0.0',
        'Cache-Control': 'max-age=604800'
      }
    })
  );
}
const getTussleMiddleware = (() => {
  let instance: TussleCloudflareWorker<UserParams>;
  return (
    storage: TussleStorageR2,
    table: ApiConfig,
    honoCtx: AppContext,
    mode: 'create' | 'update',
    id: string,
    pathConfig: string
  ) => {
    instance = new TussleCloudflareWorker({
      hooks: {
        'before-create': async (_ctx, params) => {
          if (table.hooks?.beforeOperation) {
            await table.hooks.beforeOperation(honoCtx, mode, id, params);
          }
          const filename =
            params.uploadMetadata.filename || params.uploadMetadata.name;

          const fileExtension = '.' + filename.split('.').pop();

          console.log('params before', JSON.stringify(params, null, 2));

          let authorized = true;
          if (mode === 'create') {
            authorized = await getOperationCreateResult(
              table?.access?.operation?.create,
              honoCtx,
              params
            );
          } else {
            authorized = !!(await getApiAccessControlResult(
              table?.access?.operation?.update || true,
              table?.access?.filter?.update || true,
              table?.access?.item?.update || true,
              honoCtx,
              id,
              table.table,
              params
            ));
          }
          if (!authorized) {
            return honoCtx.text('Unauthorized', 401);
          }

          let path: string;
          switch (params.uploadConcat?.action) {
            case 'partial': // Creating a file to hold a segment of a parallel upload.
              path =
                params.path +
                pathConfig +
                '/segments/' +
                crypto.randomUUID() +
                fileExtension;
              break;
            case 'final': // Finishing a parallel upload (combines multiple 'partials' from above)
            default:
              path =
                params.path +
                pathConfig +
                '/' +
                crypto.randomUUID() +
                fileExtension;
              break;
          }
          return {
            ...params,
            path
          };
        },
        'after-complete': async (ctx, params) => {
          if (table?.hooks?.afterOperation) {
            await table.hooks.afterOperation(honoCtx, mode, id, params, params);
          }
          const { location, offset } = params;
          // console.log("params after", JSON.stringify(params, null, 2));
          // const fileInfo = await storage.getFileInfo({ location });
          // console.log("file info", fileInfo);
          await cacheCompletedUploadResponse(
            ctx.originalRequest,
            location,
            offset
          );
          return params;
        }
      },
      core: {
        storage
      }
    });
    return instance;
  };
})();

const handleGET = async (ctx: AppContext) => {
  const request = ctx.req;
  const pathname = new URL(request.url).pathname;
  const pathParts = pathname.split('/');
  let route = '';
  let fieldName = '';
  pathParts.forEach((part) => {
    if (part.startsWith('r_')) {
      route = part.replace('r_', '');
    }
    if (part.startsWith('f_')) {
      fieldName = part.replace('f_', '');
      if (fieldName.includes('[')) {
        fieldName = fieldName.split('[')[0];
      }
    }
  });

  const table = apiConfig.find((entry) => entry.route === route);
  if (table.hooks?.beforeOperation) {
    await table.hooks.beforeOperation(ctx, 'read', pathname);
  }

  const accessControlResult = await getApiAccessControlResult(
    table?.access?.operation?.read || true,
    table?.access?.filter?.read || true,
    table?.access?.item?.read || true,
    ctx,
    pathname,
    table.table
  );

  if (!accessControlResult) {
    return ctx.text('Unauthorized', 401);
  }
  let cache;
  try {
    // TODO any
    cache = await (caches as any).default.match(request.url + 'GET');
  } catch (error) {
    console.log('cache error', error);
  }
  if (cache) {
    if (table.hooks?.afterOperation) {
      await table.hooks.afterOperation(ctx, 'read', pathname, null, {
        pathname,
        cache: true
      });
    }
    return cache;
  }
  if (table) {
    const field = table.fields?.[fieldName];
    if (field.type === 'file' || field.type === 'file[]') {
      const bucket = field.bucket(ctx);
      if (bucket) {
        const storage = new TussleStorageR2({
          stateService,
          bucket,
          skipMerge: false
        });

        try {
          const file = await storage.getFile(pathname);
          if (file) {
            const type = (file.metadata.type ||
              file.metadata.filetype) as string;
            ctx.header('Content-Type', type);
            ctx.status(200);
            const response = ctx.body(file.body);
            // TODO any
            await (caches as any).default.put(
              request.url + 'GET',
              response.clone()
            );
            if (table.hooks?.afterOperation) {
              await table.hooks.afterOperation(ctx, 'read', pathname, file, {
                pathname,
                cache: false
              });
            }
            return response;
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  if (table.hooks?.afterOperation) {
    await table.hooks.afterOperation(ctx, 'read', pathname, null, {
      pathname,
      cache: false
    });
  }
  return ctx.text('Not Found', 404);
};
