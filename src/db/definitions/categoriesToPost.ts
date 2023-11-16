import { text } from "drizzle-orm/sqlite-core";
import posts from "../schema/posts";
import categories from "../schema/categories";

export const tableName = "categoriesToPosts";
export const route = "categories-to-posts";
export const categoriesToPostsSchema = {
  id: text("id").notNull(),
  postId: text("postId")
    .notNull()
    .references(() => posts.id),
  categoryId: text("categoryId")
    .notNull()
    .references(() => categories.id),
};
