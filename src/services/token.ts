import { validateSessionToken } from "./sessions";

export const checkToken = async (context: Context) => {
  // get header for token and lookup user and attached to context
  const token = context.request.headers
    .get("Authorization").toLowerCase()
    ?.replace("bearer ", "");
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
    // if (!userSession) {
    //   return new Response(
    //     JSON.stringify({
    //       message: "Unauthorized",
    //     }),
    //     { status: 401 }
    //   );
    // }
    context.locals.user = userSession.user;
  } catch (error) {
    return false;
  }

  return true;
};
