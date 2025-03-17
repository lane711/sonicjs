import { drizzle } from "drizzle-orm/d1";
import { getRepoFromTable } from "./d1-data";
import { like } from "drizzle-orm";

export async function purgeE2eTestData(d1, table, field) {
  const sql = `DELETE FROM "${table}" where "${field}" like "e2e!!%";`;
  const { results } = await d1.prepare(sql).all();
  return {status: "success"};
}
