import { sqliteTable } from "drizzle-orm/sqlite-core";
import { tableName, usersSchema } from "../definitions/user";
import { auditSchema } from "../definitions/audit";

export default sqliteTable(tableName, {
  ...usersSchema,
  ...auditSchema,
});
