import { confirmEmail, doesEmailExist, sendEmailConfirmation } from "@services/auth";
import { return200, return500 } from "@services/return-types";

export async function GET(context) {
  const code = context.params.code;
  const result = await confirmEmail(context, code);
  if (result.error) {
    return return500({ error: result.error });
  }

  return context.redirect(context.locals.runtime.env.EMAIL_CONFIRMATION_REDIRECT_URL);
}