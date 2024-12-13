import { return200, return200WithObject, return401 } from "@services/return-types";
import { validateSessionToken } from "@services/sessions";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  var token = context.request.headers.get("Authorization");

  if (!token) {
    return return401("No token provided");
  }

  token = token.replace("Bearer ", "");

  if (!token) {
    return return401();
  }

  const validSession = await validateSessionToken(
    context.locals.runtime.env.D1,
    token
  );

  if(validSession.session === null || validSession.user === null) {
    return return401();
  }

  return return200WithObject(validSession);
};
