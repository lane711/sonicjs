import * as schema from "../../db/schema";
import { getRecords } from "../data/data";
import { User } from "lucia";
import { drizzle } from "drizzle-orm/d1";
import { isNotNull } from "drizzle-orm";
import { AppContext } from "../../server";
import { SonicTableConfig } from "../../db/schema";

export const isAuthEnabled = async (ctx: AppContext) => {
  let authIsEnabled = ctx.env.useAuth === "true";
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

export async function getOperationReadResult(
  read: SonicTableConfig["access"]["operation"]["read"],
  ctx: AppContext,
  id: string
) {
  let authorized = false;
  if (typeof read === "boolean") {
    authorized = read;
  } else if (typeof read === "function") {
    const readResult = read(ctx, id);
    if (typeof readResult === "boolean") {
      authorized = readResult;
    } else {
      authorized = await readResult;
    }
  }
  return authorized;
}
export async function getItemReadResult(
  read: SonicTableConfig["access"]["item"]["read"],
  ctx: AppContext,
  id: string,
  table: string
) {
  let authorized = true;
  if (typeof read === "boolean") {
    authorized = read;
  } else if (typeof read === "function") {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      "fastest"
    );

    const readResult = read(ctx, id, doc);
    if (typeof readResult === "boolean") {
      authorized = readResult;
    } else {
      authorized = await readResult;
    }
  }
  return authorized;
}
export async function filterReadFieldAccess<D = any>(
  fields: SonicTableConfig["access"]["fields"],
  ctx: AppContext,
  doc: D
): Promise<D> {
  let result: D = doc;
  if (Array.isArray(doc)) {
    const promises = doc.map((d) => {
      return filterReadFieldAccess(fields, ctx, d);
    });
    result = (await Promise.all(promises)) as D;
  } else if (typeof doc === "object") {
    result = Object.keys(doc).reduce<any>(async (acc, key) => {
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
          authorized = await acc[key];
        }
      }
      acc[key] = authorized ? value : null;
      return acc;
    }, {});
  } else {
    console.error("HOW??");
  }
  return result;
}
