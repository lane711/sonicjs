import { doesEmailExist, sendEmailConfirmation } from "@services/auth";
import { return200 } from "@services/return-types";

export async function GET(context) {
  const email = context.params.email;
  const result = await sendEmailConfirmation(context, decodeURIComponent(email));
  return return200({ result });
}