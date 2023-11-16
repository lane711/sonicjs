import { relations } from "drizzle-orm";
import categoriesToPostsRelations from "./categoriesToPostsRelations";
import categories from "./categories";
import posts from "./posts";

export default relations(categoriesToPostsRelations, ({ one }) => ({
  category: one(categories, {
    fields: [categoriesToPostsRelations.categoryId],
    references: [categories.id],
  }),
  post: one(posts, {
    fields: [categoriesToPostsRelations.postId],
    references: [posts.id],
  }),
}));
