/**
 * SonicJs has a flexible authentication system allowing you to set various data access controls at a table and/or field level.
 * 
 * The access property defines access control rules for interacting with the data. It allows granular control over who can perform what actions.
 * 
 * By default operations are always allowed.
 * 
 * ## Admin Panel Access
 * In schema.ts a variable config should be exported with an adminAccessControl property.
 * 
 * ```typescript
 * export type SonicJSConfig = {
 *   tablesConfig: ApiConfig[];
 *   adminAccessControl: (ctx: AppContext) => boolean;
 * };
 * ```
 * 
 * If adminAccessControl returns true the user will be allowed access to the /admin route and be able to perform operations like clearing cache.
 * 
 * ## Operation Access
 * The operation property controls access to CRUD operations. It contains sub-properties for each operation:
 * 
 * - `ctx`: AppContext
 * - `id`: the id of the document (or undefined if reading multiple rows)
 * - `data`: the data passed to the update/create operation
 * 
 * ### Create
 * ```typescript
 * create: boolean | (ctx?: AppContext, data?: any) => boolean | Promise<boolean>
 * ```
 * Used to check if the user can create the provided input. Should return true to allow create or false to deny.
 * 
 * ### Read
 * ```typescript
 * read: boolean | (ctx?: AppContext, id?: string) => boolean | Promise<boolean>
 * ```
 * Determines if reading/querying items is allowed.
 * 
 * ### Update
 * ```typescript
 * update: boolean | (ctx?: AppContext, id?: string, data:any) => boolean | Promise<boolean>
 * ```
 * Determines if updating items is allowed.
 * 
 * ### Delete
 * ```typescript
 * delete: boolean | (ctx: AppContext, id: string) => boolean | Promise<boolean>
 * ```
 * Determines if deleting items is allowed.
 * 
 * ## Filter Access
 * The filter property allows modifying the data returned from CRUD operations by applying additional filters. It contains sub-properties for each operation:
 * 
 * - `ctx`: AppContext
 * - `id`: the id of the document (or undefined if reading multiple rows)
 * - `data`: the data passed to the update/create operation
 * 
 * ### Read
 * ```typescript
 * read: SonicJSFilter | ((ctx?: AppContext, id?: string) => SonicJSFilter | Promise<SonicJSFilter>) | boolean | ((ctx: AppContext, id: string) => boolean | Promise<boolean>)
 * ```
 * Allows modifying the data returned on a read by adding filters. Should return a filter or boolean to allow/deny reading.
 * 
 * ### Update
 * ```typescript
 * update: SonicJSFilter | ((ctx?: AppContext, id?: string, data?: any) => SonicJSFilter | Promise<SonicJSFilter>) | boolean | ((ctx?: AppContext, id?: string, data?: any) => boolean | Promise<boolean>)
 * ```
 * Allows modifying the data passed to an update by adding filters. Should return a filter or boolean to allow/deny updating.
 * 
 * ### Delete
 * ```typescript
 * delete: SonicJSFilter | ((ctx?: AppContext, id?: string) => SonicJSFilter | Promise<SonicJSFilter>) | boolean | ((ctx?: AppContext, id?: string) => boolean | Promise<boolean>)
 * ```
 * Allows modifying delete operation by adding filters. Should return a filter or boolean to allow/deny deleting.
 * 
 * ## Item Access
 * The item property allows more granular access control based on the document being accessed. Also less performant access control because the doc being requested/updated/deleted is read passed in. It contains sub-properties for each operation:
 * 
 * - `ctx`: AppContext
 * - `id`: the id of the document
 * - `data`: the data passed to the update/create operation
 * - `doc`: the document being accessed
 * 
 * ### Read
 * ```typescript
 * read: boolean | (ctx?: AppContext, id?: string, doc?: any) => boolean | Promise<boolean>
 * ```
 * Allows checking the actual document content to determine read access. Should return true to allow read or false to deny.
 * 
 * ### Update
 * ```typescript
 * update: boolean | (ctx?: AppContext, id?: string, data?: any, doc?: any) => boolean | Promise<boolean>
 * ```
 * Allows checking the actual document content to determine update access. Should return true to allow update or false to deny.
 * 
 * ### Delete
 * ```typescript
 * delete: boolean | (ctx?: AppContext, id?: string, doc?: any) => boolean | Promise<boolean>
 * ```
 * Allows checking the actual document content to determine delete access. Should return true to allow delete or false to deny.
 * 
 * ## Field Level Access
 * The fields property controls access at the individual field level. It contains sub-properties for each field name.
 * 
 * - `ctx`: AppContext
 * - `id`: the id of the document
 * - `data`: the data passed to the update/create operation
 * - `value`: the value of the field
 * 
 * ### Create
 * ```typescript
 * create: boolean | (ctx?: AppContext, data?: any) => boolean | Promise<boolean>
 * ```
 * Used to check if the field can be set on create. Should return true to allow setting the field or false to discard the value.
 * 
 * ### Read
 * ```typescript
 * read: boolean | (ctx?: AppContext, value?: any, doc?: any) => boolean | Promise<boolean>
 * ```
 * Determines if reading the field is allowed. Should return true to return the field or false to omit.
 * 
 * ### Update
 * ```typescript
 * update: boolean | (ctx?: AppContext, id?: string, data?: any) => boolean | Promise<boolean>
 * ```
 * Used to check if the field can be updated. Should return true to allow update or false to discard the value.
 * 
 * ## AppContext
 * The context provides user, role, group, etc information to use in the access control checks. It is passed to all the access functions. Its shape depends on your application's auth implementation.
 * 
 * Get the user: `ctx.get("user")`
 * Get the session: `ctx.get("session")`
 */

import { tableSchemas } from '../db/routes';
import { drizzle } from 'drizzle-orm/d1';
import { isNotNull } from 'drizzle-orm';
import type { APIContext as AppContext } from "astro";
import type { SonicJSFilter, ApiConfig } from '../db/routes';
import { getRecords } from '@services/data';

export async function getApiAccessControlResult(
  operationAccessControl:
    | boolean
    | ((...args: any[]) => boolean | Promise<boolean>),
  filterAccessControl:
    | boolean
    | ((...args: any[]) => boolean | Promise<boolean>)
    | SonicJSFilter
    | ((...args: any[]) => SonicJSFilter | Promise<SonicJSFilter>),
  itemAccessControl: boolean | ((...args: any[]) => boolean | Promise<boolean>),
  ctx: AppContext,
  ...args: any[]
) {
  let authorized: boolean | SonicJSFilter = await getAccessControlResult(
    operationAccessControl,
    ctx,
    args[0],
    args[2]
  );
  if (authorized) {
    authorized = await getItemAccessControlResult(
      itemAccessControl,
      ctx,
      args[0],
      args[1],
      args[2]
    );
  }
  if (authorized) {
    authorized = await getAccessControlResult(
      filterAccessControl,
      ctx,
      args[0],
      args[2]
    );
  }

  return authorized;
}

async function getAccessControlResult(
  accessControl:
    | boolean
    | ((...args: any[]) => boolean | Promise<boolean>)
    | SonicJSFilter
    | ((...args: any[]) => SonicJSFilter | Promise<SonicJSFilter>),
  ctx: AppContext,
  ...args: any[]
) {
  let authorized: boolean | SonicJSFilter = true;
  if (typeof accessControl !== 'function') {
    authorized = accessControl;
  } else {
    const acResult = accessControl(ctx, ...args);
    if (acResult instanceof Promise) {
      authorized = await acResult;
    } else {
      authorized = acResult;
    }
  }
  return authorized;
}

export async function getOperationCreateResult(
  create: ApiConfig['access']['operation']['create'],
  ctx: AppContext,
  data: any
) {
  return !!(await getAccessControlResult(create, ctx, data));
}

export async function getOperationReadResult(
  read: ApiConfig['access']['operation']['read'],
  ctx: AppContext,
  id: string
) {
  return !!(await getAccessControlResult(read, ctx, id));
}

export async function getOperationUpdateResult(
  update: ApiConfig['access']['operation']['update'],
  ctx: AppContext,
  id: string,
  data: any
) {
  return !!(await getAccessControlResult(update, ctx, id, data));
}

export async function getOperationDeleteResult(
  del: ApiConfig['access']['operation']['delete'],
  ctx: AppContext,
  id: string
) {
  return !!(await getAccessControlResult(del, ctx, id));
}

export async function getFilterReadResult(
  read: ApiConfig['access']['filter']['read'],
  ctx: AppContext,
  id: string
) {
  return await getAccessControlResult(read, ctx, id);
}

export async function getFilterUpdateResult(
  update: ApiConfig['access']['filter']['update'],
  ctx: AppContext,
  id: string,
  data: any
) {
  return await getAccessControlResult(update, ctx, id, data);
}

export async function getFilterDeleteResult(
  del: ApiConfig['access']['filter']['delete'],
  ctx: AppContext,
  id: string
) {
  return await getAccessControlResult(del, ctx, id);
}

export async function getItemAccessControlResult(
  itemAccessControl: boolean | ((...args: any[]) => boolean | Promise<boolean>),
  ctx: AppContext,
  id?: string,
  table?: string,
  data?: any
) {
  let authorized = true;
  if (typeof itemAccessControl === 'boolean') {
    authorized = itemAccessControl;
  } else if (id && table && typeof itemAccessControl === 'function') {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      'fastest'
    );

    if (data) {
      authorized = !!(await getAccessControlResult(
        itemAccessControl,
        ctx,
        id,
        data,
        doc
      ));
    } else {
      authorized = !!(await getAccessControlResult(
        itemAccessControl,
        ctx,
        id,
        doc
      ));
    }
  }
  return authorized;
}

export async function getItemReadResult(
  read: ApiConfig['access']['item']['read'],
  ctx: AppContext,
  docs: any
) {
  let authorized = true;
  if (typeof read === 'boolean') {
    authorized = read;
  } else if (typeof read === 'function') {
    docs = Array.isArray(docs) ? docs : [docs];
    for (const doc of docs) {
      if (authorized) {
        authorized = !!(await getAccessControlResult(read, ctx, doc.id, doc));
      }
    }
  }
  return authorized;
}

export async function getItemUpdateResult(
  update: ApiConfig['access']['item']['update'],
  ctx: AppContext,
  id: string,
  data: any,
  table: string
) {
  let authorized: boolean | SonicJSFilter = true;
  if (typeof update !== 'function') {
    authorized = update;
  } else {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      'fastest'
    );

    authorized = await getAccessControlResult(update, ctx, id, data, doc);
  }
  return authorized;
}

export async function getItemDeleteResult(
  del: ApiConfig['access']['item']['delete'],
  ctx: AppContext,
  id: string,
  table: string
) {
  let authorized: boolean | SonicJSFilter = true;
  if (typeof del !== 'function') {
    authorized = del;
  } else {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      'fastest'
    );

    authorized = await getAccessControlResult(del, ctx, id, doc);
  }
  return authorized;
}

export async function filterCreateFieldAccess<D = any>(
  fields: ApiConfig['access']['fields'],
  ctx: AppContext,
  data: D
): Promise<D> {
  let result: D = data;
  if (fields) {
    if (typeof data === 'object') {
      const newResult = {} as D;
      for (const key of Object.keys(data)) {
        const value = data[key];
        const access = fields[key]?.create;
        let authorized = true;
        if (typeof access === 'boolean') {
          authorized = access;
        } else if (typeof access === 'function') {
          const accessResult = access(ctx, data);
          if (typeof accessResult === 'boolean') {
            authorized = accessResult;
          } else {
            authorized = await accessResult;
          }
        }
        if (authorized) {
          newResult[key] = value;
        }
      }
      result = newResult;
    } else {
      throw new Error('Data must be an object');
    }
  }
  return result;
}

export async function filterReadFieldAccess<D = any>(
  fields: ApiConfig['access']['fields'],
  ctx: AppContext,
  doc: D
): Promise<D> {
  let result: D = doc;
  if (fields) {
    if (Array.isArray(doc)) {
      const promises = doc.map((d) => {
        return filterReadFieldAccess(fields, ctx, d);
      });
      const fieldResults = (await Promise.allSettled(
        promises
      )) as PromiseSettledResult<D>[];
      result = fieldResults.reduce((acc: any[], r) => {
        if (r.status === 'fulfilled') {
          acc.push(r.value);
        } else {
          console.error(r.reason);
        }
        return acc;
      }, []) as D;
    } else if (typeof doc === 'object') {
      const newResult = {} as D;
      for (const key of Object.keys(doc)) {
        const value = doc[key];
        const access = fields[key]?.read;
        let authorized = true;
        if (typeof access === 'boolean') {
          authorized = access;
        } else if (typeof access === 'function') {
          const accessResult = access(ctx, value, doc);
          if (typeof accessResult === 'boolean') {
            authorized = accessResult;
          } else {
            authorized = await accessResult;
          }
        }
        newResult[key] = authorized ? value : null;
      }
      result = newResult;
    } else {
      console.error('How is doc not an array or object???');
    }
  }
  return result;
}

export async function filterUpdateFieldAccess<D = any>(
  fields: ApiConfig['access']['fields'],
  ctx: AppContext,
  id: string,
  data: D
): Promise<D> {
  let result: D = data;
  if (fields) {
    if (typeof data === 'object') {
      const newResult = {} as D;
      for (const key of Object.keys(data)) {
        const value = data[key];
        const access = fields[key]?.update;
        let authorized = true;
        if (typeof access === 'boolean') {
          authorized = access;
        } else if (typeof access === 'function') {
          const accessResult = access(ctx, id, data);
          if (typeof accessResult === 'boolean') {
            authorized = accessResult;
          } else {
            authorized = await accessResult;
          }
        }

        if (authorized) {
          newResult[key] = value;
        }
      }
      result = newResult;
    } else {
      throw new Error('Data must be an object');
    }
  }
  return result;
}
