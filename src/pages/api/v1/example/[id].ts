import { return200WithObject } from "@services/return-types";

export async function GET({params}) {
  return return200WithObject({ id: params.id});
}