import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import {
  createUser,
  deleteUser,
  initializeLucia,
  login,
  logout,
  updateUser,
} from "../auth/lucia";

import qs from "qs";
import { Variables } from "../../server";
import { isAuthEnabled, isEditAllowed } from "../auth/auth-helpers";
import { getRecords } from "../data/data";
import { getForm } from "../api/forms";

const authAPI = new Hono<{ Bindings: Bindings; Variables: Variables }>();
authAPI.use("*", async (ctx, next) => {
  const authEnabled = await isAuthEnabled(ctx);
  if (authEnabled) {
    const session = ctx.get("session");
    const path = ctx.req.path;
    if (!session && path !== "/v1/auth/login" && path !== "/v1/auth/verify") {
      return ctx.text("Unauthorized", 401);
    }
  }
  await next();
});
// View user
authAPI.get(`/users/:id`, async (ctx) => {
  const id = ctx.req.param("id");
  const user = ctx.get("user");
  const authEnabled = await isAuthEnabled(ctx);
  if (authEnabled && !isEditAllowed(user, id)) {
    return ctx.text("Unauthorized", 401);
  }
  const start = Date.now();

  const { includeContentType } = ctx.req.query();

  var params = qs.parse(ctx.req.query());
  params.id = id;
  ctx.env.D1DATA = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;

  let source = "fastest";
  if (includeContentType !== undefined) {
    source = "d1";
  }

  const data = await getRecords(
    ctx,
    "users",
    params,
    ctx.req.url,
    source,
    undefined
  );

  if (includeContentType !== undefined) {
    data.contentType = getForm(ctx, "users");
  }

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ ...data, executionTime });
});
// Create user
authAPI.post(`/users`, async (ctx) => {
  const user = ctx.get("user");
  const authEnabled = await isAuthEnabled(ctx);
  if (authEnabled && !isEditAllowed(user)) {
    return ctx.text("Unauthorized", 401);
  }
  const content = await ctx.req.json();
  content.table = "users";

  try {
    return await createUser({ content, ctx });
  } catch (error) {
    console.log("error posting content", error);
    return ctx.text(error, 500);
  }
});

// Delete user
authAPI.delete(`/users/:id`, async (ctx) => {
  const id = ctx.req.param("id");

  const user = ctx.get("user");
  const authEnabled = await isAuthEnabled(ctx);
  if (authEnabled && !isEditAllowed(user, id)) {
    return ctx.text("Unauthorized", 401);
  }
  return await deleteUser({ ctx }, id);
});

// Update user
authAPI.put(`/users/:id`, async (ctx) => {
  const id = ctx.req.param("id");
  const user = ctx.get("user");
  const authEnabled = await isAuthEnabled(ctx);
  if (authEnabled && !isEditAllowed(user, id)) {
    return ctx.text("Unauthorized", 401);
  }
  const content = await ctx.req.json();
  return await updateUser({ ctx, content }, id);
});

authAPI.post("/login", async (ctx) => {
  const content = await ctx.req.json();
  return await login({ ctx, content });
});

authAPI.get("/logout", async (ctx) => {
  return await logout(ctx);
});

authAPI.get("/verify", async (ctx) => {
  ctx.env.D1DATA = ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;
  const auth = initializeLucia(ctx.env.D1DATA, ctx.env);
  const authRequest = auth.handleRequest(ctx);
  const authenticated = await authRequest.validateBearerToken();
  return ctx.json({
    authenticated,
  });
});

authAPI.all("*", (ctx) => ctx.redirect(ctx.req.url.replace("/auth", ""))); // fallback
export { authAPI };
