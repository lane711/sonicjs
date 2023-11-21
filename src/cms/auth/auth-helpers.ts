import { Context } from "hono";
import { adminRole, editorRole, usePasswordAuth } from "../../db/schema";
import * as schema from "../../db/schema";
import { getRecords } from "../data/data";
import { User } from "lucia";
import { drizzle } from "drizzle-orm/d1";
import { isNotNull } from "drizzle-orm";
export const isAuthEnabled = async (ctx: Context) => {
  let authIsEnabled = usePasswordAuth;
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
      "hasUserCheck",
      "d1",
      fn
    );
    authIsEnabled = result?.data?.length > 0;
    const adminUser = result?.data?.find((user) => user.role === adminRole);
    if (!adminUser) {
      const user = ctx.get("user");
      if (user) {
        user.role = adminRole;
        ctx.set("user", user);
      }
    }
  }
  return authIsEnabled;
};

export const isEditAllowed = (user?: User, requestedId?: string) => {
  const role = user?.role?.toLowerCase() || "";
  if (role === adminRole) {
    return true;
  }
  if (user?.role === editorRole && user?.userId === requestedId) {
    return true;
  }
  return false;
};

export const isAdminOrEditor = (user?: User) => {
  const role = user?.role?.toLowerCase() || "";
  if (role === adminRole || role === editorRole) {
    return true;
  }
  return false;
};

export const isAdmin = (user?: User) => {
  const role = user?.role?.toLowerCase() || "";
  if (role === adminRole) {
    return true;
  }
  return false;
};

export const canProceedAsEditorOrAdmin = async (ctx: Context) => {
  const authEnabled = await isAuthEnabled(ctx);
  if (authEnabled) {
    if (!isAdminOrEditor(ctx.get("user"))) {
      return false;
    }
  }
  return true;
};
