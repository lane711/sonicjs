import { text } from "drizzle-orm/sqlite-core";

export const tableName = "posts";
export const route = "posts";
export const postsSchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  userId: text("userId"),
};
