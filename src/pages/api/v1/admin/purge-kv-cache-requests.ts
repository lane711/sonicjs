import { kvPurgeAll } from "@services/kv";
import { return200 } from "@services/return-types";

export const GET = async (context) => {
  const data = await kvPurgeAll(context);
  return context.redirect("/admin/cache");
};
