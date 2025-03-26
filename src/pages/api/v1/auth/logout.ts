import { login } from "@services/auth";
import { hashString } from "@services/cyrpt";
import {
  return200,
  return200WithObject,
  return401,
  return500,
} from "@services/return-types";
import { invalidateSession } from "@services/sessions";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  const contentType = context.request.headers.get("content-type");
  if (context.request.headers.get("content-type") === "application/json") {
    const sessionId = await context.request.headers
      .get("Authorization")
      ?.toLowerCase()
      ?.replace("bearer ", "");

    if (sessionId) {
      await invalidateSession(context.locals.runtime.env.D1, sessionId);
    }

    return return200WithObject({
      message: "Successfully logged out",
    });
  } else {
    return return401("Error: Invalid email or password");
  }

  return return500("Error: Content-Type must be application/json");
};
