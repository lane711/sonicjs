import { relations } from "drizzle-orm";
import comments from "./comments";
import users from "./users";
import posts from "./posts";

export default relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));
