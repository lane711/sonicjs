import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { auditSchema } from "./audit";
import * as categoriesToPosts from "./categoriesToPosts";

export const tableName = "categories";

export const route = "categories";

export const definition = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema,
});

export const relation = relations(table, ({ many }) => ({
  posts: many(categoriesToPosts.table),
}));
