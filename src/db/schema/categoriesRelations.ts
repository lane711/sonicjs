import { relations } from "drizzle-orm";
import categories from "./categories";
import categoriesToPosts from "./categoriesToPosts";

export default relations(categories, ({ many }) => ({
  posts: many(categoriesToPosts),
}));
