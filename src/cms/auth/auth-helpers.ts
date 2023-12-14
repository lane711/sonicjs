import * as schema from "../../db/schema";
import { getRecords } from "../data/data";
import { User } from "lucia";
import { drizzle } from "drizzle-orm/d1";
import { isNotNull } from "drizzle-orm";
import { AppContext } from "../../server";
import { SonicJSFilter, SonicTableConfig } from "../../db/schema";

export const isAuthEnabled = async (ctx: AppContext) => {
  let authIsEnabled = ctx.env?.useAuth === "true";
  if (authIsEnabled) {
    const fn = async function () {
      const db = drizzle(ctx.env.D1DATA, { schema });
      const data = await db.query.usersTable.findMany({
        with: {
          keys: {
            where(fields) {
              return isNotNull(fields.hashed_password);
            },
          },
        },
      });
      const result = data.filter((user) => user.keys?.length > 0);
      return result;
    };

    const result = await getRecords(
      ctx,
      "custom",
      {},
      "hasUserWithKeyCheck",
      "d1",
      fn
    );
    authIsEnabled = result?.data?.length > 0;
  }
  return authIsEnabled;
};
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
  if (typeof accessControl !== "function") {
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
  create: SonicTableConfig["access"]["operation"]["create"],
  ctx: AppContext,
  data: any
) {
  return !!(await getAccessControlResult(create, ctx, data));
}
export async function getOperationReadResult(
  read: SonicTableConfig["access"]["operation"]["read"],
  ctx: AppContext,
  id: string
) {
  return !!(await getAccessControlResult(read, ctx, id));
}

export async function getOperationUpdateResult(
  update: SonicTableConfig["access"]["operation"]["update"],
  ctx: AppContext,
  id: string,
  data: any
) {
  return !!(await getAccessControlResult(update, ctx, id, data));
}

export async function getOperationDeleteResult(
  del: SonicTableConfig["access"]["operation"]["delete"],
  ctx: AppContext,
  id: string
) {
  return !!(await getAccessControlResult(del, ctx, id));
}

export async function getFilterReadResult(
  read: SonicTableConfig["access"]["filter"]["read"],
  ctx: AppContext,
  id: string
) {
  return await getAccessControlResult(read, ctx, id);
}

export async function getFilterUpdateResult(
  update: SonicTableConfig["access"]["filter"]["update"],
  ctx: AppContext,
  id: string,
  data: any
) {
  return await getAccessControlResult(update, ctx, id, data);
}

export async function getFilterDeleteResult(
  del: SonicTableConfig["access"]["filter"]["delete"],
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
  if (typeof itemAccessControl === "boolean") {
    authorized = itemAccessControl;
  } else if (id && table && typeof itemAccessControl === "function") {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      "fastest"
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
  read: SonicTableConfig["access"]["item"]["read"],
  ctx: AppContext,
  docs: any
) {
  let authorized = true;
  if (typeof read === "boolean") {
    authorized = read;
  } else if (typeof read === "function") {
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
  update: SonicTableConfig["access"]["item"]["update"],
  ctx: AppContext,
  id: string,
  data: any,
  table: string
) {
  let authorized: boolean | SonicJSFilter = true;
  if (typeof update !== "function") {
    authorized = update;
  } else {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      "fastest"
    );

    authorized = await getAccessControlResult(update, ctx, id, data, doc);
  }
  return authorized;
}

export async function getItemDeleteResult(
  del: SonicTableConfig["access"]["item"]["delete"],
  ctx: AppContext,
  id: string,
  table: string
) {
  let authorized: boolean | SonicJSFilter = true;
  if (typeof del !== "function") {
    authorized = del;
  } else {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      "fastest"
    );

    authorized = await getAccessControlResult(del, ctx, id, doc);
  }
  return authorized;
}
export async function filterCreateFieldAccess<D = any>(
  fields: SonicTableConfig["access"]["fields"],
  ctx: AppContext,
  data: D
): Promise<D> {
  let result: D = data;
  if (fields) {
    if (typeof data === "object") {
      const newResult = {} as D;
      for (const key of Object.keys(data)) {
        const value = data[key];
        const access = fields[key]?.create;
        let authorized = true;
        if (typeof access === "boolean") {
          authorized = access;
        } else if (typeof access === "function") {
          const accessResult = access(ctx, data);
          if (typeof accessResult === "boolean") {
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
      throw new Error("Data must be an object");
    }
  }
  return result;
}

export async function filterReadFieldAccess<D = any>(
  fields: SonicTableConfig["access"]["fields"],
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
        if (r.status === "fulfilled") {
          acc.push(r.value);
        } else {
          console.error(r.reason);
        }
        return acc;
      }, []) as D;
    } else if (typeof doc === "object") {
      const newResult = {} as D;
      for (const key of Object.keys(doc)) {
        const value = doc[key];
        const access = fields[key]?.read;
        let authorized = true;
        if (typeof access === "boolean") {
          authorized = access;
        } else if (typeof access === "function") {
          const accessResult = access(ctx, value, doc);
          if (typeof accessResult === "boolean") {
            authorized = accessResult;
          } else {
            authorized = await accessResult;
          }
        }
        newResult[key] = authorized ? value : null;
      }
      result = newResult;
    } else {
      console.error("How is doc not an array or object???");
    }
  }
  return result;
}

export async function filterUpdateFieldAccess<D = any>(
  fields: SonicTableConfig["access"]["fields"],
  ctx: AppContext,
  id: string,
  data: D
): Promise<D> {
  let result: D = data;
  if (fields) {
    if (typeof data === "object") {
      const newResult = {} as D;
      for (const key of Object.keys(data)) {
        const value = data[key];
        const access = fields[key]?.update;
        let authorized = true;
        if (typeof access === "boolean") {
          authorized = access;
        } else if (typeof access === "function") {
          const accessResult = access(ctx, id, data);
          if (typeof accessResult === "boolean") {
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
      throw new Error("Data must be an object");
    }
  }
  return result;
}
