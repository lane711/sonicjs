import { purgeE2eTestData, purgeE2eUserSessions } from "@services/e2e";
import { return200, return400, return401 } from "@services/return-types";
import { checkToken } from "@services/token";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  const { table, field, likeValue } = await context.request.json();

  if (!table || !field || !likeValue) {
    return return400("Missing table, field, or likeValue");
  }

  const token = await checkToken(context);
  if (context.locals?.user?.role !== "admin") {
    return return401("Unauthorized");
  }

  const result = await purgeE2eUserSessions(
    context.locals.runtime.env.D1,
    likeValue
  );

  await purgeE2eTestData(
    context.locals.runtime.env.D1,
    table,
    field,
    likeValue
  );

  return return200();
};
