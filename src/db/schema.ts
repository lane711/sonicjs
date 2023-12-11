import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
  int,
} from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";
import { AppContext } from "../server";

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
  password: text("password"),
  role: text("role").$type<"admin" | "user">(),
};

export const usersTable = sqliteTable("users", {
  ...userSchema,
  ...auditSchema,
});

export type User = typeof usersTable._.model.select;

export const userKeysSchema = {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  hashed_password: text("hashed_password"),
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

export const keysRelations = relations(userKeysTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [userKeysTable.user_id],
    references: [usersTable.id],
  }),
}));
export const sessionsRelations = relations(userSessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userSessionsTable.user_id],
    references: [usersTable.id],
  }),
}));

// posts
type PostCategories = [{ category: string }];

export const postSchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  userId: text("userId"),
};
export const postsTable = sqliteTable(
  "posts",
  {
    ...postSchema,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("postUserIdIndex").on(table.userId),
    };
  }
);

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

export const commentsTable = sqliteTable(
  "comments",
  {
    ...commentSchema,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("commentsUserIdIndex").on(table.userId),
      postIdIndex: index("commentsPostIdIndex").on(table.postId),
    };
  }
);

//posts to categories (many to many)
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
  (table) => ({
    pk: primaryKey(table.postId, table.categoryId),
  })
);
/*
 **** TABLES RELATIONSHIPS ****
 */

// users can have many posts and many comments
export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
  comments: many(commentsTable),
  keys: many(userKeysTable),
  sessions: many(userSessionsTable),
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
export type SonicJSConfig = {
  tablesConfig: SonicTableConfig[];
  adminAccessControl: (ctx: AppContext) => boolean;
};
export type SonicJSFilter = Record<string, any>;
export interface SonicTableConfig {
  table: string;
  route: string;
  hideWhenAuthEnabled?: boolean;
  access?: {
    operation: {
      create?:
        | boolean
        | ((ctx: AppContext, data: any) => boolean | Promise<boolean>);
      read?:
        | boolean
        | ((ctx: AppContext, id: string) => boolean | Promise<boolean>);
      update?:
        | boolean
        | ((
            ctx: AppContext,
            id: string,
            data: any
          ) => boolean | Promise<boolean>);
      delete?:
        | boolean
        | ((ctx: AppContext, id: string) => boolean | Promise<boolean>);
    };
    filter: {
      read?:
        | SonicJSFilter
        | ((
            ctx: AppContext,
            id: string
          ) => SonicJSFilter | Promise<SonicJSFilter>)
        | boolean
        | ((ctx: AppContext, id: string) => boolean | Promise<boolean>);
      update?:
        | SonicJSFilter
        | ((
            ctx: AppContext,
            id: string
          ) => SonicJSFilter | Promise<SonicJSFilter>)
        | boolean
        | ((
            ctx: AppContext,
            id: string,
            data: any
          ) => boolean | Promise<boolean>);
      delete?:
        | SonicJSFilter
        | ((
            ctx: AppContext,
            id: string
          ) => SonicJSFilter | Promise<SonicJSFilter>)
        | boolean
        | ((ctx: AppContext, id: string) => boolean | Promise<boolean>);
    };
    item?: {
      create?:
        | boolean
        | ((
            ctx: AppContext,
            data: any,
            doc: any
          ) => boolean | Promise<boolean>);
      read?:
        | boolean
        | ((
            ctx: AppContext,
            id: string,
            doc: any
          ) => boolean | Promise<boolean>);
      update?:
        | boolean
        | ((
            ctx: AppContext,
            id: string,
            data: any,
            doc: any
          ) => boolean | Promise<boolean>);
      delete?:
        | boolean
        | ((
            ctx: AppContext,
            id: string,
            doc: any
          ) => boolean | Promise<boolean>);
    };
    fields?: {
      [field: string]: {
        // Returns a boolean which allows or denies the ability to set a field's value when creating a new document. If false is returned, any passed values will be discarded.
        create?:
          | boolean
          | ((ctx: AppContext, data: any) => boolean | Promise<boolean>);
        //Returns a boolean which allows or denies the ability to read a field's value. If false, the entire property is omitted from the resulting document.
        read?:
          | boolean
          | ((
              ctx: AppContext,
              id: string,
              doc: any
            ) => boolean | Promise<boolean>);
        // Returns a boolean which allows or denies the ability to update a field's value. If false is returned, any passed values will be discarded.
        // If false is returned and you attempt to update the field's value, the operation will not throw an error however the field will be omitted from the update operation and the value will remain unchanged.
        update?:
          | boolean
          | ((
              ctx: AppContext,
              id: string,
              data: any,
              doc: any
            ) => boolean | Promise<boolean>);
      };
    };
  };
}

//create an entry for each table
export const apiConfig: SonicTableConfig[] = [
  {
    table: "posts",
    route: "posts",
    access: {
      operation: {
        read: true,
        create: isAdminOrEditor,
        update: isAdminOrEditor,
        delete: isAdminOrEditor,
      },
    },
  },
  {
    table: "categories",
    route: "categories",
    access: {
      operation: {
        read: true,
        create: isAdminOrEditor,
        update: isAdminOrEditor,
        delete: isAdminOrEditor,
      },
    },
  },
  {
    table: "comments",
    route: "comments",
    access: {
      operation: {
        read: true,
        create: isAdminOrEditor,
        update: isAdminOrEditor,
        delete: isAdminOrEditor,
      },
    },
  },
  {
    table: "categoriesToPosts",
    route: "categories-to-posts",
    access: {
      operation: {
        read: true,
        create: isAdminOrEditor,
        update: isAdminOrEditor,
        delete: isAdminOrEditor,
      },
    },
  },
  {
    table: "users",
    route: "users",
    hideWhenAuthEnabled: true,
    access: {
      operation: {
        create: isAdmin,
        delete: isAdmin,
      },
      item: {
        update: isAdminOrUser,
      },
      fields: {
        email: {
          read: isAdminOrUser,
        },
        password: {
          update: isUser,
        },
        role: {
          read: isAdminOrUser,
          update: isAdmin,
        },
      },
    },
  },
];

export const config: SonicJSConfig = {
  tablesConfig: apiConfig,
  adminAccessControl: isAdminOrEditor,
};

export function isAdminOrEditor(ctx: AppContext) {
  const user = ctx.get("user");
  const role = user?.role?.toLowerCase() || "";
  if (role === "admin" || role === "editor") {
    return true;
  }
  return false;
}

export function isAdmin(ctx: AppContext) {
  const user = ctx.get("user");
  const role = user?.role?.toLowerCase() || "";
  if (role === "admin") {
    return true;
  }
  return false;
}

export function isUser(ctx: AppContext, doc: any) {
  const user = ctx.get("user");
  return user.userId === doc.id;
}

export function isAdminOrUser(ctx: AppContext, doc: any) {
  return isAdmin(ctx) || isUser(ctx, doc);
}
