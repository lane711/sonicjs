import { kvPurgeAll } from "@services/kv";
import { return200, return401 } from "@services/return-types";

export const GET = async (context) => {
  const isDemo = context.request.url.toString().includes('demo.sonicjs.com');
  if(isDemo){
    return return401("This feature is disabled in the demo")
  }
  const data = await kvPurgeAll(context);
  return context.redirect("/admin/cache");
};
