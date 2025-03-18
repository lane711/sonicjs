import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations, type InferSelectModel } from "drizzle-orm";
import { auditSchema } from "./audit";
import * as posts from "@custom/db/schema/posts";
import * as comments from "@custom/db/schema/comments";
// import * as userKeys from "./userKeys";
// import * as userSessions from "./userSessions";
import { isAdmin, isAdminOrEditor, isAdminOrUser } from "../config-helpers";
import type { ApiConfig } from "../routes";
import { hashString } from "@services/cyrpt";
export const tableName = "users";
export const name = "Users";

export const route = "users";
export const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-astro-source-file="/Users/8349/Dev/refs/sonicjs-astro/src/pages/admin/layouts/admin-layout.astro" data-astro-source-loc="430:147"> <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" data-astro-source-file="/Users/8349/Dev/refs/sonicjs-astro/src/pages/admin/layouts/admin-layout.astro" data-astro-source-loc="431:22"></path> </svg>`;

export const definition = {
  id: text("id").primaryKey(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  profile: text("profile"),
  email: text("email").unique(),
  password: text("password").notNull(),
  role: text("role").$type<"admin" | "user">().default("user"),
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema,
  },
  (table) => {
    return {
      emailIndex: uniqueIndex("email_idx").on(table.email),
    };
  }
);

export type User = InferSelectModel<typeof table>;

export const relation = relations(table, ({ many }) => ({
  posts: many(posts.table),
  comments: many(comments.table),
  // keys: many(userKeys.table),
  // sessions: many(userSessions.table),
}));

export const access: ApiConfig["access"] = {
  operation: {
    read: isAdmin,
    create: isAdmin,
    delete: isAdmin,
    update: isAdminOrUser,
  },
  // item: {
  //   // if a user tries to update a user and isn't the user that created the user the update will return unauthorized response
  //   update: isAdminOrUser,
  //   read:true
  // },
  fields: {
    id: {
      read: (ctx, value, doc) => {
        return isAdmin(ctx) || isAdminOrUser(ctx, doc.id);
      },
    },
    email: {
      read: (ctx, value, doc) => {
        return isAdminOrUser(ctx, doc.id);
      },
    },
    password: {
      read:false,
      update: isAdminOrUser,
    },
    role: {
      read: (ctx, value, doc) => {
        return isAdminOrUser(ctx, doc.id);
      },
      update: isAdmin,
    },
  },
};

export const hooks: ApiConfig["hooks"] = {
  resolveInput: {
    create: async (context, data) => {
      if (data && data.password) {
        data.password = await hashString(data.password);
      }
      if (context.locals.user?.id) {
        data.userId = context.locals.user.id;
      }
      return data;
    },
    update: (context, id, data) => {
      if (context.locals.user?.id) {
        data.userId = context.locals.user.id;
      }
      return data;
    },
  },
};
