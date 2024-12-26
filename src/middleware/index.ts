import { defineMiddleware } from "astro:middleware";
import {
  validateSessionToken,
  createSession,
  invalidateSession,
} from "@services/sessions";
import { sequence } from "astro:middleware";
import { kvGet } from "@services/kv";
import { inMemoryGet } from "@services/memory";

async function inMemoryCache(context, next) {
	const start = Date.now();
  
	//   console.log("Handling KV Cache");
  
	const cachedData = await inMemoryGet(context, context.url.href);
  
	if (cachedData) {
	  const end = Date.now();
	  const executionTime = end - start;
	  cachedData.executionTime = executionTime;
	  cachedData.source = "InMemory";
	  return new Response(JSON.stringify(cachedData), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	  });
	} else{
	  console.log("Cache miss on " + context.url.href);
	}
  
	return next();
  }

async function kvCache(context, next) {
  const start = Date.now();

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
  } else{
	console.log("Cache miss on " + context.url.href);
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
  const sessionId = context.cookies.get("session")?.value;

  // Check if we're already on the login or register page
  const isAuthPage = context.url.pathname.match(/^\/admin\/(login|register)/);

  try {
    if (sessionId) {
      // Validate the session
      const { user } = await validateSessionToken(
        context.locals.runtime.env.D1,
        sessionId
      );
      //   const { user } = await context.locals.auth.validateSession(sessionId);
      if (user) {
        context.locals.user = user;

        // If user is logged in and tries to access login/register, redirect to admin
        if (isAuthPage) {
          return context.redirect("/admin");
        }

        return next();
      }
    }

    // Don't redirect if already on auth pages
    if (isAuthPage) {
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

    // Don't redirect if already on auth pages
    if (isAuthPage) {
      return next();
    }

    // Redirect to login for protected routes
    if (context.url.pathname.startsWith("/admin")) {
      return context.redirect("/admin/login");
    }
  }

  return next();
}

// export const onRequest = sequence( auth);
// export const onRequest = sequence(inMemoryCache, auth);

export const onRequest = sequence(inMemoryCache, kvCache, auth);
