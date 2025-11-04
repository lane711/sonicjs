import type { APIContext as AppContext } from "astro";

export function isAdminOrEditor(context: AppContext) {
  const user = context.locals.user;
  const role = user?.role?.toLowerCase() || "";
  if (role === "admin" || role === "editor") {
    return true;
  }
  return false;
}

export function isAdmin(context: AppContext) {
  const user = context.locals.user;
  const role = user?.role?.toLowerCase() || "";
  if (role === "admin") {
    return true;
  }
  return false;
}

export function isUser(context: AppContext, id: string) {
  const user = context.locals.user;
  return user?.userId === id;
}

export function isAdminOrUser(context: AppContext, id: string) {
  return isAdmin(context) || isUser(context, id);
}

export function usersCanRegister(context: AppContext) {
  return context.locals.runtime.env.USERS_CAN_REGISTER?.toString() === "true" ? true : false;
}
