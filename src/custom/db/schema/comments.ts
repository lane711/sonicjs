import { sqliteTable, index, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { auditSchema } from "@schema/audit";
import * as posts from "./posts";
import * as users from "@schema/users";
import { isAdminOrUser } from "db/config-helpers";
import type { ApiConfig } from "db/routes";

export const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
</svg>`

export const tableName = "comments";

export const route = "comments";
export const name = "Comments";

export const definition = {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  userId: text("userId").notNull(),
  postId: integer("postId").notNull(),
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
      userIdIndex: index("commentsUserIdIndex").on(table.userId),
      postIdIndex: index("commentsPostIdIndex").on(table.postId),
    };
  }
);

export const relation = relations(table, ({ one }) => ({
  post: one(posts.table, {
    fields: [table.postId],
    references: [posts.table.id],
  }),
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id],
  }),
}));

export const access: ApiConfig["access"] = {
  operation: {
    read: true,
    create: true,
    update: isAdminOrUser,
    delete: isAdminOrUser,
  },
};

export const hooks: ApiConfig["hooks"] = {
  resolveInput: {
    create: (ctx, data) => {
      if (ctx.locals.user?.userId) {
        data.userId = ctx.locals.user.userId;
      }
      return data;
    },
    update: (ctx, id, data) => {
      if (ctx.locals.user?.userId) {
        data.userId = ctx.locals.user.userId;
      }
      return data;
    },
  },
};
export const fields: ApiConfig["fields"] = {
  tags: {
    type: "string[]",
  },
  body:{ 
    type:'textArea'
  }
};
