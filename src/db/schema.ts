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
  // Access control if auth is enabled
  // ctx: HonoContext, contains all the information about the request
  // id: the id of the document the operation is being performed on, could be undefined if reading multiple rows
  // data: the data passed to the operation
  // doc: the document being requested/updated/deleted
  // Get the user: ctx.get("user")
  // Get the session: ctx.get("session")
  // By default, operations are always allowed.
  // false will result in a 403 UNAUTHORIZED response.
  access?: {
    // Each operation that can be performed has access control.
    // Operations can be a boolean or a function (async or not) that returns a boolean.
    operation?: {
      // Determines if creating a new document in the table is allowed.
      create?:
        | boolean
        | ((ctx?: AppContext, data?: any) => boolean | Promise<boolean>);
      // Determines if reading a document from the table is allowed.
      read?:
        | boolean
        | ((ctx?: AppContext, id?: string) => boolean | Promise<boolean>);
      // Determines if updating a document in the table is allowed.
      update?:
        | boolean
        | ((
            ctx?: AppContext,
            id?: string,
            data?: any
          ) => boolean | Promise<boolean>);
      // Determines if deleting a document from the table is allowed.
      delete?:
        | boolean
        | ((ctx: AppContext, id: string) => boolean | Promise<boolean>);
    };
    // Defines the access control for filtering documents in the table based on certain conditions.
    // If a filter is returned the filter will be added to the operation.
    // Perhaps the read will return no/different data and the update/delete will not be performed.
    // Can also return a pboolean in which case it acts the same as operation
    filter?: {
      read?:
        | SonicJSFilter
        | ((
            ctx?: AppContext,
            id?: string
          ) => SonicJSFilter | Promise<SonicJSFilter>)
        | boolean
        | ((ctx: AppContext, id: string) => boolean | Promise<boolean>);
      update?:
        | SonicJSFilter
        | ((
            ctx?: AppContext,
            id?: string,
            data?: any
          ) => SonicJSFilter | Promise<SonicJSFilter>)
        | boolean
        | ((
            ctx?: AppContext,
            id?: string,
            data?: any
          ) => boolean | Promise<boolean>);
      delete?:
        | SonicJSFilter
        | ((
            ctx?: AppContext,
            id?: string
          ) => SonicJSFilter | Promise<SonicJSFilter>)
        | boolean
        | ((ctx?: AppContext, id?: string) => boolean | Promise<boolean>);
    };
    // More powerful but also less performant access control because the doc being requested/updated/deleted is read passed in.
    // This allows more complex access control based on the document the action is being performed on.
    item?: {
      read?:
        | boolean
        | ((
            ctx?: AppContext,
            id?: string,
            doc?: any
          ) => boolean | Promise<boolean>);
      update?:
        | boolean
        | ((
            ctx?: AppContext,
            id?: string,
            data?: any,
            doc?: any
          ) => boolean | Promise<boolean>);
      delete?:
        | boolean
        | ((
            ctx?: AppContext,
            id?: string,
            doc?: any
          ) => boolean | Promise<boolean>);
    };
    // Defines the access control for each field in the table.
    // Read – applied when the field is selected through any operation
    // * true - The field will be returned in the response
    // * false - The field will be null in the response
    // Create - applied when creating a new document
    // * true - The field will be passed on to the create operation
    // * false - The field will be discarded and omitted from the create operation
    // Update - applied when updating a document
    // * true - The field will be passed on to the update operation
    // * false - The field will be discarded and omitted from the update operation
    fields?: {
      [field: string]: {
        // Returns a boolean which allows or denies the ability to set a field's value when creating a new document. If false is returned, any passed values will be discarded.
        create?:
          | boolean
          | ((ctx?: AppContext, data?: any) => boolean | Promise<boolean>);
        //Returns a boolean which allows or denies the ability to read a field's value. If false, the entire property is omitted from the resulting document.
        read?:
          | boolean
          | ((
              ctx?: AppContext,
              value?: string,
              doc?: any
            ) => boolean | Promise<boolean>);
        // Returns a boolean which allows or denies the ability to update a field's value. If false is returned, any passed values will be discarded.
        // If false is returned and you attempt to update the field's value, the operation will not throw an error however the field will be omitted from the update operation and the value will remain unchanged.
        update?:
          | boolean
          | ((
              ctx?: AppContext,
              id?: string,
              data?: any
            ) => boolean | Promise<boolean>);
      };
    };
  };
  hooks?: {
    resolveInput?: {
      create?: (ctx: AppContext, data: any) => any | Promise<any>;
      update?: (ctx: AppContext, id: string, data: any) => any | Promise<any>;
    };
    beforeOperation?: (
      ctx: AppContext,
      operation: "create" | "read" | "update" | "delete",
      id?: string,
      data?: any
    ) => void | Promise<void>;
    afterOperation?: (
      ctx: AppContext,
      operation: "create" | "read" | "update" | "delete",
      id?: string,
      data?: any,
      result?: { data?: any } & Record<string, any>
    ) => void | Promise<void>;
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
      },
      filter: {
        // if a user tries to update a post and isn't the user that created the post the update won't happen
        update: (ctx) => {
          if (isAdmin(ctx)) {
            return true;
          } else {
            const user = ctx.get("user");
            if (user?.userId) {
              // Return filter so update doesn't happen if userId doesn't match
              return {
                userId: user.userId,
              };
            } else {
              return false;
            }
          }
        },
        delete: (ctx) => {
          if (isAdmin(ctx)) {
            return true;
          } else {
            const user = ctx.get("user");
            if (user?.userId) {
              // Return filter so update doesn't happen if userId doesn't match
              return {
                userId: user.userId,
              };
            } else {
              return false;
            }
          }
        },
      },
      fields: {
        userId: {
          update: false,
        },
      },
    },
    hooks: {
      resolveInput: {
        create: (ctx, data) => {
          if (ctx.get("user")?.userId) {
            data.userId = ctx.get("user").userId;
          }
          return data;
        },
        update: (ctx, id, data) => {
          if (ctx.get("user")?.userId) {
            data.userId = ctx.get("user").userId;
          }
          return data;
        },
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
        // if a user tries to update a user and isn't the user that created the user the update will return unauthorized response
        update: isAdminOrUser,
      },
      fields: {
        id: {
          read: (ctx, value, doc) => {
            return isAdminOrEditor(ctx) || isAdminOrUser(ctx, doc.id);
          },
        },
        email: {
          read: (ctx, value, doc) => {
            return isAdminOrUser(ctx, doc.id);
          },
        },
        password: {
          update: isAdminOrUser,
        },
        role: {
          read: (ctx, value, doc) => {
            return isAdminOrUser(ctx, doc.id);
          },
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

export function isUser(ctx: AppContext, id: string) {
  const user = ctx.get("user");
  return user.userId === id;
}

export function isAdminOrUser(ctx: AppContext, id: string) {
  return isAdmin(ctx) || isUser(ctx, id);
}
