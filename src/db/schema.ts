import { sqliteTable, text, integer, SQLiteTimestamp, uniqueIndex } from 'drizzle-orm/sqlite-core';

// export const user = sqliteTable("user", {
//     id: integer("id"),
//     name: text("name"),
//     email: text("email"),
//     password: text("password"),
//     role: text("role").$type<"admin" | "user">(),
//     createdAt: integer("created_at", {mode:"timestamp"}),
//     updatedAt: integer("updated_at", {mode:"timestamp"}),
//   });

  // import {  serial, text, integer, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
 
export const users = sqliteTable('users', {
  id: integer("id"),
  name: text("name"),
  email: text("email"),
  password: text("password"),
  role: text("role").$type<"admin" | "user">(),
  createdAt: integer("created_at", {mode:"timestamp"}),
  updatedAt: integer("updated_at", {mode:"timestamp"}),
});
 
export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
}));
 
export const posts = sqliteTable('posts', {
	id: integer('id').primaryKey(),
	content: text('body'),
	authorId: integer('user_id'),
});
 
export const postsRelations = relations(posts, ({ one }) => ({
	author: one(users, {
		fields: [posts.authorId],
		references: [users.id],
	}),
}));