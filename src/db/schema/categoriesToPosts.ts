import { sqliteTable } from "drizzle-orm/sqlite-core";
import {
  tableName,
  categoriesToPostsSchema,
} from "../definitions/categoriesToPost";
import { auditSchema } from "../definitions/audit";

export default sqliteTable(tableName, {
  ...categoriesToPostsSchema,
  ...auditSchema,
});
