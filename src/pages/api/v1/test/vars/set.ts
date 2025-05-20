import { return200, return400 } from "@services/return-types";
import type { APIRoute } from "astro";
import qs from "qs";

export const GET: APIRoute = async (context) => {
  if (!context.locals.runtime.env.TESTING_MODE) {
    return return400("Testing mode is not enabled");
  }

  const queryParams = qs.parse(context.request.url.split("?")[1]);

  const key = Object.getOwnPropertyNames(queryParams)[0];
  const value = queryParams[key];

  if (!key || !value) {
    return return400("Missing key or value");
  }

  context.locals.runtime.env[key] = value;
  const updatedEnv = context.locals.runtime.env[key];

  return return200({
    key,
    value: updatedEnv,
  });
};

