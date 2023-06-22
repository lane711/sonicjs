import {
  sqliteTable,
  text,
  integer,
  SQLiteTimestamp,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { relations, sql } from "drizzle-orm";

export const auditSchema = {
  created_on: integer('created_on'),
  updated_on: integer('updated_on')
}

export const userSchema = {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  password: text("password"),
  role: text("role").$type<"admin" | "user">(),
  created_on: integer('created_on'),
  updated_on: integer('updated_on')
}

export const users = sqliteTable("users", {...userSchema, ...auditSchema});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsSchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  userId: text("user_id"),
}
export const posts = sqliteTable("posts", {...postsSchema, ...auditSchema});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export interface ApiConfig {
  table: string;
  route: string;
}

export const apiConfig: ApiConfig[] = [
  { table: "users", route: "users" },
  { table: "posts", route: "posts" },
];
