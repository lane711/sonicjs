import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { auditSchema } from "./audit";
import * as categories from "./categories";
import * as posts from "./posts";

export const tableName = "categoriesToPosts";

export const route = "categories-to-posts";

export const definition = {
  id: text("id").notNull(),
  postId: text("postId")
    .notNull()
    .references(() => posts.table.id),
  categoryId: text("categoryId")
    .notNull()
    .references(() => categories.table.id),
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema,
});

export const relation = relations(table, ({ one }) => ({
  category: one(categories.table, {
    fields: [table.categoryId],
    references: [categories.table.id],
  }),
  post: one(posts.table, {
    fields: [table.postId],
    references: [posts.table.id],
  }),
}));
