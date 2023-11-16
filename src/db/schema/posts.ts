import { sqliteTable, index } from "drizzle-orm/sqlite-core";
import { tableName, postsSchema } from "../definitions/post";
import { auditSchema } from "../definitions/audit";

export default sqliteTable(
  tableName,
  {
    ...postsSchema,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("postUserIdIndex").on(table.userId),
    };
  }
);
