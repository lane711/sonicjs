import { login } from "@services/auth";
import { hashString } from "@services/cyrpt";
import {
  return200,
  return401,
  return500,
} from "@services/return-types";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {

  const contentType = context.request.headers.get("content-type");
  if (context.request.headers.get("content-type") === "application/json") {
    // Get the body of the request
    const body: { email: string; password?: string, otp?: string } = await context.request.json();
    const { email, password, otp } = body;

    const loginResult = await login(
      context.locals.runtime.env.D1,
      email,
      password,
      otp,
      context
    ) as { bearer: string; expires: string, error?: string };

    if (loginResult.error) {
      return return401(loginResult.error);
    } else {
      return return200({
        bearer: loginResult.bearer,
        expires: loginResult.expires,
      });
    }
  }

  return return500("Error: Content-Type must be application/json");
};
