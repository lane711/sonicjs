import { sqliteTable, index } from "drizzle-orm/sqlite-core";
import { tableName, commentsSchema } from "../definitions/comment";
import { auditSchema } from "../definitions/audit";

export default sqliteTable(
  tableName,
  {
    ...commentsSchema,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("commentsUserIdIndex").on(table.userId),
      postIdIndex: index("commentsPostIdIndex").on(table.postId),
    };
  }
);
