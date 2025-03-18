import { sqliteTable, index, text } from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";
import { auditSchema } from "@schema/audit";
import * as users from "@schema/users";
import * as categoriesToPosts from "./categoriesToPosts";
import * as comments from "./comments";
import { isAdminOrEditor, isAdminOrUser } from "db/config-helpers";
import type { ApiConfig } from "db/routes";

export const tableName = "posts";

export const route = "posts";
export const name = "Posts";
export const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>`;

export const definition = {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  userId: text("userId").notNull(),
  image: text("image"),
  images: text("images", { mode: "json" }).$type<string[]>(),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("postUserIdIndex").on(table.userId),
    };
  }
);

export const relation = relations(table, ({ one, many }) => ({
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id],
  }),
  categories: many(categoriesToPosts.table),
  comments: many(comments.table),
}));

export const access: ApiConfig["access"] = {
  operation: {
    read: true,
    create: isAdminOrEditor,
    update: isAdminOrUser,
    delete: isAdminOrUser,
  },
  // filter: {
  //   // if a user tries to update a post and isn't the user that created the post the update won't happen
  //   update: (ctx) => {nx run inventory-tracking:serve-mfe

  //     if (isAdmin(ctx)) {
  //       return true;
  //     } else {
  //       const user = Astro.locals.user;
  //       if (user?.userId) {
  //         // Return filter so update doesn't happen if userId doesn't match
  //         return {
  //           userId: user.userId,
  //         };
  //       } else {
  //         return false;
  //       }
  //     }
  //   },
  //   delete: (ctx) => {
  //     if (isAdmin(ctx)) {
  //       return true;
  //     } else {
  //       const user = Astro.locals.user;
  //       if (user?.userId) {
  //         // Return filter so update doesn't happen if userId doesn't match
  //         return {
  //           userId: user.userId,
  //         };
  //       } else {
  //         return false;
  //       }
  //     }
  //   },
  // },
  fields: {
    userId: {
      update: false,
    },
  },
};
export const hooks: ApiConfig["hooks"] = {
  resolveInput: {
    create: (ctx, data) => {
      if (ctx.locals.user?.id) {
        data.userId = ctx.locals.user.id;
      }
      return data;
    },
    update: (ctx, id, data) => {
      if (ctx.locals.user?.id) {
        data.userId = ctx.locals.user.id;
      }
      return data;
    },
  },
};

export const fields: ApiConfig["fields"] = {
  id: {
    type: "id",
  },
  title: {
    type: "textField",
  },
  body: {
    type: "textArea",
  },
  image: {
    type: "file",
    bucket: (ctx) => ctx.locals.runtime.env.R2,
    path: "images",
  },
  images: {
    type: "file[]",
    bucket: (ctx) => ctx.locals.runtime.env.R2,
    path: "images",
  },
  tags: {
    type: "string[]",
  },
  updatedOn: {
    type: "datetime",
  },
};
