import { doesEmailExist, sendEmailConfirmation } from "@services/auth";
import { return200, return500 } from "@services/return-types";

export async function GET(context) {
  const email = context.params.email;
  const result = await sendEmailConfirmation(context, decodeURIComponent(email));
  if (result.error) {
    return return500({ error: result.error });
  }
  return return200({ message: "Confirmation email sent" });
}