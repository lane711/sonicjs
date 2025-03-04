import { drizzle } from "drizzle-orm/d1";
import { getRepoFromTable } from "./d1-data";
import { like } from "drizzle-orm";

export async function purgeE2eTestData(d1, table, field) {
//   const db = drizzle(d1);

//   const schema = getRepoFromTable(table);
//   let sql = await db
//     .delete(schema)
//     .where(like(schema[field], "e2e!!%"))
//     .toSQL();
//   let result = await db.delete(schema).where(like(schema[field], "e2e!!%")).run();

//   return result;

  const sql = `DELETE FROM "${table}" where "${field}" like "e2e!!%";`;
  const { results } = await d1.prepare(sql).all();
  return {status: "success"};
}
