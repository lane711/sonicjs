import { deleteD1ByTableAndId } from "@services/d1-data";
import { kvDelete, kvGetAll } from "@services/kv";
import { getAdminKvData } from "@services/kv-data";
import { return200 } from "@services/return-types";
import qs from "qs";

export const GET = async (context) => {
  const data = await getAdminKvData(context);

  return return200(data);
};

export const DELETE = async (context) => {
  const queryParams = qs.parse(context.request.url.split("?")[1]);

  const id = queryParams.id;
  const url = queryParams.url;

  //delete d1 records
  await deleteD1ByTableAndId(
    context.locals.runtime.env.D1,
    "cacheRequests",
    id
  );
  //delete kv records
  await kvDelete(context, url);

  return return200({ status: "success" });
};
