import { text, integer } from "drizzle-orm/sqlite-core";

export const tableName = "comments";
export const route = "comments";
export const commentsSchema = {
  id: text("id").primaryKey(),
  body: text("body"),
  userId: text("userId"),
  postId: integer("postId"),
};
