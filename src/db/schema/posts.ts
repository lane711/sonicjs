import { sqliteTable, index, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { auditSchema } from "./audit";
import * as users from "./users";
import * as categoriesToPosts from "./categoriesToPosts";
import * as comments from "./comments";

export const tableName = "posts";

export const route = "posts";

export const definition = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  userId: text("userId"),
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("postUserIdIndex").on(table.userId),
    };
  }
);

export const relation = relations(table, ({ one, many }) => ({
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id],
  }),
  categories: many(categoriesToPosts.table),
  comments: many(comments.table),
}));
