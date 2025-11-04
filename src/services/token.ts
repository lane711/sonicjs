import { validateSessionToken } from "./sessions";

export const checkToken = async (context: any) => {
  // get header for token and lookup user and attached to context
  const token = getToken(context);
  if (!token) {
    return false;
  }

  try {
    const userSession = await validateSessionToken(
      context.locals.runtime.env.D1,
      token
    );

    if (userSession.user == null || userSession.session == null) {
      return false;
    }

    context.locals.user = userSession.user;
  } catch (error) {
    return false;
  }

  return true;
};

export const getToken = (context: any) => {
  return (
    context.cookies.get("session")?.value ??
    context.request.headers
      .get("Authorization")
      ?.toLowerCase()
      ?.replace("bearer ", "")
  );
};
