import { defineMiddleware } from "astro:middleware";
import {
  validateSessionToken,
  createSession,
  invalidateSession,
} from "@services/sessions";
import { sequence } from "astro:middleware";
import { kvGet } from "@services/kv";
import { cacheRequestInsert } from "@services/kv-data";

async function cache(context, next) {
  const start = Date.now();

  if (context.locals.runtime.env.DISABLED_CACHE?.toLowerCase() === "true") {
    return next();
  }

  //only attempt to retrieve cache on urls starting with /api
  if (!context.url.pathname.startsWith("/api")) {
    return next();
  }

  //ignore route with auth, cacheRequests, and kv
  if (
    context.url.pathname.startsWith("/api/v1/auth") ||
    context.url.pathname.startsWith("/api/v1/cacheRequests") ||
    context.url.pathname.startsWith("/api/v1/kv") ||
    context.url.pathname.startsWith("/api/v1/admin")
  ) {
    return next();
  }

  //   console.log("Handling KV Cache");

  const cachedData = await kvGet(context, context.url.href);

  if (cachedData) {
    const end = Date.now();
    const executionTime = end - start;
    cachedData.executionTime = executionTime;
    cachedData.source = "KV";
    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    console.log("Cache miss on " + context.url.href);
    //add url to cache request
    
    cacheRequestInsert(
      context,
      context.locals.runtime.env.D1,
      context.locals.runtime.env.KV,
      context.url.href 
    );
  }

  return next();
}

async function auth(context, next) {
  // const config = initializeConfig(
  // 	context.locals.runtime.env.D1,
  // 	context.locals.runtime.env
  //   );
  //   context.locals.auth = new Auth(config);

  // Get session token from cookie
  const sessionId = context.cookies.get("session")?.value ?? 
  context.request.headers
  .get("Authorization")?.toLowerCase()
  ?.replace("bearer ", "");

  // Check if we're already on the login or register page
  const isAuthPage = context.
  url.pathname.match(/^\/admin\/(login|register)/);
  const isApi = context.url.pathname.match(/^\/api\/(v1|v2|v3)/);


  try {
    if (sessionId) {
      // Validate the session
      const { user, session } = await validateSessionToken(
        context.locals.runtime.env.D1,
        sessionId
      );
      //   const { user } = await context.locals.auth.validateSession(sessionId);
      if (user) {
        context.locals.user = user;
        context.locals.session = session;


        // If user is logged in and tries to access login/register, redirect to admin
        if (isAuthPage) {
          return context.redirect("/admin");
        }

        return next();
      }
    }

    // Don't redirect if already on auth pages
    if (isAuthPage || isApi) {
      return next();
    }

    // If no valid session and trying to access protected routes, redirect to login
    if (context.url.pathname.startsWith("/admin")) {
      return context.redirect("/admin/login");
    }
  } catch (error) {
    // Handle session validation errors (expired, invalid, etc)
    console.error("Session validation error:", error);

    // Clear invalid session cookie
    context.cookies.delete("session", { path: "/" });

    // Redirect to login for protected routes
    if (context.url.pathname.startsWith("/admin")) {
      return context.redirect("/admin/login");
    }
  }

  return next();
}

// export const onRequest = sequence( auth);
export const onRequest = sequence(cache, auth);
