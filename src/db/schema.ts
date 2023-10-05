import {
  sqliteTable,
  text,
  integer,
  blob,
  index,
  primaryKey,
  int,
} from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";

// we want to add the below audit fields to all our tables, so we'll define it here
// and append it to the rest of the schema for each table
export const auditSchema = {
  createdOn: integer("createdOn"),
  updatedOn: integer("updatedOn"),
};

/*
 **** TABLES ****
 */

// users
export const userSchema = {
  id: text("id").primaryKey(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email"),
  role: text("role").$type<"admin" | "user">(),
};
export const usersTable = sqliteTable("users", {
  ...userSchema,
  ...auditSchema,
});

export const userKeysSchema = {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  hashed_passwrod: text("hashed_password"),
};

export const userKeysTable = sqliteTable("user_keys", {
  ...userKeysSchema,
  ...auditSchema,
});

export const userSessionsSchema = {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  active_expires: int("active_expires").notNull(),
  idle_expires: int("idle_expires").notNull(),
};

export const userSessionsTable = sqliteTable("user_sessions", {
  ...userSessionsSchema,
  ...auditSchema,
});

// posts
type PostCategories = [{ category: string }];

export const postSchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  userId: text("userId"),
};
export const postsTable = sqliteTable("posts", {
  ...postSchema,
  ...auditSchema,
});

// categories
export const categorySchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
};
export const categoriesTable = sqliteTable("categories", {
  ...categorySchema,
  ...auditSchema,
});

// comments
export const commentSchema = {
  id: text("id").primaryKey(),
  body: text("body"),
  userId: text("userId"),
  postId: integer("postId"),
};

export const commentsTable = sqliteTable("comments", {
  ...commentSchema,
  ...auditSchema,
});

//posts to categories
export const categoriesToPostsSchema = {
  id: text("id").notNull(),
  postId: text("postId")
    .notNull()
    .references(() => postsTable.id),
  categoryId: text("categoryId")
    .notNull()
    .references(() => categoriesTable.id),
};

export const categoriesToPostsTable = sqliteTable(
  "categoriesToPosts",
  {
    ...categoriesToPostsSchema,
    ...auditSchema,
  },
  (t) => ({
    pk: primaryKey(t.postId, t.categoryId),
  })
);
/*
 **** TABLES RELATIONSHIPS ****
 */

// users can have many posts and many comments
export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
  comments: many(commentsTable),
}));

// posts can have one author (user), many categories, many comments
export const postsRelations = relations(postsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [postsTable.userId],
    references: [usersTable.id],
  }),
  categories: many(categoriesToPostsTable),
  comments: many(commentsTable),
}));

// categories can have many posts
export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  posts: many(categoriesToPostsTable),
}));

// comments can have one post and one author
export const commentsRelations = relations(commentsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [commentsTable.postId],
    references: [postsTable.id],
  }),
  user: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
}));

//many to many between posts and categories
export const categoriesToPostsRelations = relations(
  categoriesToPostsTable,
  ({ one }) => ({
    category: one(categoriesTable, {
      fields: [categoriesToPostsTable.categoryId],
      references: [categoriesTable.id],
    }),
    post: one(postsTable, {
      fields: [categoriesToPostsTable.postId],
      references: [postsTable.id],
    }),
  })
);

export interface ApiConfig {
  table: string;
  route: string;
}

//create an entry for each table
export const apiConfig: ApiConfig[] = [
  { table: "users", route: "users" },
  { table: "posts", route: "posts" },
  { table: "categories", route: "categories" },
  { table: "comments", route: "comments" },
  { table: "categoriesToPosts", route: "categories-to-posts" },
];
