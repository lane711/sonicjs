import { relations } from "drizzle-orm";
import users from "./users";
import posts from "./posts";
import categoriesToPosts from "./categoriesToPosts";
import comments from "./comments";

export default relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  categories: many(categoriesToPosts),
  comments: many(comments),
}));
