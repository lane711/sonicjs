import { drizzle } from "drizzle-orm/d1";
import { getRepoFromTable } from "./d1-data";
import { like } from "drizzle-orm";

export async function purgeE2eTestData(d1, table, field, likeValue) {
  const sql = `DELETE FROM "${table}" where "${field}" like "${likeValue}%";`;
  const { results } = await d1.prepare(sql).all();
  return {status: "success"};
}
