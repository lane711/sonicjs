import { return200, return400, return401 } from "@services/return-types";
import type { APIRoute } from "astro";
import qs from "qs";

export const GET: APIRoute = async (context) => {
  // Check if testing mode is enabled
  if (!context.locals.runtime.env.TESTING_MODE) {
    return return400("Testing mode is not enabled");
  }

  // Check if user is admin
  if (context.locals?.user?.role !== 'admin') {
    return return401();
  }

  // Parse query parameters
  const queryParams = qs.parse(context.request.url.split("?")[1]);

  // Get first key and its value
  const key = Object.getOwnPropertyNames(queryParams)[0];
  const value = queryParams[key];

  // Validate key and value exist
  if (!key || !value) {
    return return400("Missing key or value");
  }

  // Set environment variable
  context.locals.runtime.env[key] = value;
  const updatedEnv = context.locals.runtime.env[key];

  // Return success response
  return return200({
    key,
    value: updatedEnv,
  });
};


