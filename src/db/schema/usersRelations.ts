import { relations } from "drizzle-orm";
import users from "./users";
import posts from "./posts";
import comments from "./comments";

export default relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}));
