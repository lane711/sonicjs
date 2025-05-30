import { sendOTPEmail } from "@services/email";
import { return200, return404 } from "@services/return-types";
import { getRecords, updateRecord } from "@services/data";
import { formatMilliseconds } from "@services/time";

export const GET = async (context) => {
  let params = context.params;
  const emailEncoded = params.code;

  return return200(result);
};
