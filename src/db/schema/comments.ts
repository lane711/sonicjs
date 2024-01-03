import { sqliteTable, index, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { auditSchema } from "./audit";
import * as posts from "./posts";
import * as users from "./users";

export const tableName = "comments";

export const route = "comments";

export const definition = {
  id: text("id").primaryKey(),
  body: text("body"),
  userId: text("userId"),
  postId: integer("postId"),
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("commentsUserIdIndex").on(table.userId),
      postIdIndex: index("commentsPostIdIndex").on(table.postId),
    };
  }
);

export const relation = relations(table, ({ one }) => ({
  post: one(posts.table, {
    fields: [table.postId],
    references: [posts.table.id],
  }),
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id],
  }),
}));
