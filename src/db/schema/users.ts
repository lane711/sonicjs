import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { auditSchema } from "./audit";
import * as posts from "./posts";
import * as comments from "./comments";

export const tableName = "users";

export const route = "users";

export const definition = {
  id: text("id").primaryKey(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email"),
  password: text("password"),
  role: text("role").$type<"admin" | "user">(),
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema,
});

export const relation = relations(table, ({ many }) => ({
  posts: many(posts.table),
  comments: many(comments.table),
}));
