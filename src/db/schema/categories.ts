import { sqliteTable } from "drizzle-orm/sqlite-core";
import { tableName, categoriesSchema } from "../definitions/category";
import { auditSchema } from "../definitions/audit";

export default sqliteTable(tableName, {
  ...categoriesSchema,
  ...auditSchema,
});
