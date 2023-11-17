import { Context } from "hono";
import { adminRole, editorRole, usePasswordAuth } from "../../db/schema";
import { getRecords } from "../data/data";
import { User } from "lucia";

export const isAuthEnabled = async (ctx: Context) => {
  let authIsEnabled = usePasswordAuth;
  if (authIsEnabled) {
    const data = await getRecords(
      ctx,
      "users",
      { limit: 1000 },
      "hasUserCheck",
      "fastest",
      undefined
    );
    authIsEnabled = data?.data?.length > 0;
    const adminUser = data?.data?.find((user) => user.role === adminRole);
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
