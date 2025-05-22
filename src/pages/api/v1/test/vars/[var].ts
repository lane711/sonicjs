
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
  const varName = context.params.var;

  // get environment variable
  const varValue = context.locals.runtime.env[varName];


  // Validate key and value exist
  if (!varValue) {
    return return400("Missing key or value");
  }

  // Return success response
  return return200({
    key: varName,
    value: varValue,
  });
};
