import {
  sqliteTable,
  text,
  integer,
  blob
} from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";

// we want to add the below audit fields to all our tables, so we'll define it here
// and append it to the rest of the schema for each table
export const auditSchema = {
  created_on: integer('created_on'),
  updated_on: integer('updated_on')
}

/*
  **** TABLES ****
*/

// users
export const userSchema = {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  password: text("password"),
  role: text("role").$type<"admin" | "user">(),
}
export const user = sqliteTable("users", {...userSchema, ...auditSchema});

// posts
export const postSchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  userId: text("user_id"),
}
export const post = sqliteTable("posts", {...postSchema, ...auditSchema});

// categories
export const categorySchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
}
export const category = sqliteTable("categories", {...categorySchema, ...auditSchema});

// comments
export const commentSchema = {
  id: text("id").primaryKey(),
  body: text("body"),
  userId: text("user_id"),
	postId: integer('post_id'),
}
export const comment = sqliteTable("comments", {...commentSchema, ...auditSchema});


/*
  **** TABLES RELATIONSHIPS ****
*/

// users can have many posts and many comments
export const usersRelations = relations(user, ({ many }) => ({
  posts: many(post),
  comments: many(comment)
}));

// posts can have one author (user), many categories, many comments
export const postsRelations = relations(post, ({ one, many }) => ({
  user: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
  categories: many(category),
  comments: many(comment)
}));

// categories can have many posts
export const categoriesRelations = relations(category, ({ many }) => ({
  posts: many(post),
}));

// comments can have one post and one author
export const commentsRelations = relations(comment, ({ one }) => ({
  post: one(post, {
    fields: [comment.id],
    references: [post.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
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
