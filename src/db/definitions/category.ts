import { text } from "drizzle-orm/sqlite-core";

export const tableName = "categories";
export const route = "categories";
export const categoriesSchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
};
