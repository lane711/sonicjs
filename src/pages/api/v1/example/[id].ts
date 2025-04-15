import { return200 } from "@services/return-types";

export async function GET({params}) {
  return return200({ id: params.id});
}