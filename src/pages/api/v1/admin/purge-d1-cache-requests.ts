import { purgeD1Table } from "@services/d1-data";
import { kvPurgeAll } from "@services/kv";
import { return200 } from "@services/return-types";

export const GET = async (context) => {
  const data = await purgeD1Table(context.locals.runtime.env.D1, "cacheRequests");
  return context.redirect("/admin/cache");
};
