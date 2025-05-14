import { doesEmailExist } from "@services/auth";
import { return200 } from "@services/return-types";

export async function GET(context) {
  const email = context.params.email;
  const result = await doesEmailExist(context.locals.runtime.env.D1, decodeURIComponent(email));
  return return200({ exists: result.exists, confirmed: result.confirmed });
}