import { kvGetAll } from "@services/kv";
import { getAdminKvData } from "@services/kv-data";
import { return200 } from "@services/return-types";

export const GET = async (context) => {
  const data = await getAdminKvData(context);

  return return200(data);
};
