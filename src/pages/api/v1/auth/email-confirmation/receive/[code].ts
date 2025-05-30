import { confirmEmail, doesEmailExist, getLoginTokenAndSession, login, sendEmailConfirmation } from "@services/auth";
import { return200, return500 } from "@services/return-types";

export async function GET(context) {
  const code = context.params.code;
  const result = await confirmEmail(context, code);
  if (result.error) {
    return return500({ error: result.error });
  }

  const redirectUrl = context.locals.runtime.env.EMAIL_CONFIRMATION_REDIRECT_URL;

  if(redirectUrl){
    return context.redirect(redirectUrl);

  }

  const autoLogin = context.locals.runtime.env.AUTO_LOGIN_AFTER_EMAIL_CONFIRMATION;

  if(autoLogin){
    const loginResult = await getLoginTokenAndSession(result.user.id, context);
    return return200({ message: "Email confirmed", userId: result.user.id, token: loginResult.token, expires: loginResult.session.activeExpires });
  }

  return return200({ message: "Email confirmed" });
}