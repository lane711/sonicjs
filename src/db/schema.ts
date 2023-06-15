import {
  sqliteTable,
  text,
  integer,
  SQLiteTimestamp,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  password: text("password"),
  role: text("role").$type<"admin" | "user">(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  content: text("body"),
  authorId: integer("user_id"),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const apiConfig = [
  { table: "users", route: "users" },
  { table: "posts", route: "posts" },
];
