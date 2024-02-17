import { sqliteTable, index, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as posts from './posts';
import * as users from './users';
import { ApiConfig } from '../routes';
import { isAdminOrUser } from '../config-helpers';

export const tableName = 'comments';

export const route = 'comments';

export const definition = {
  id: text('id').primaryKey(),
  body: text('body'),
  userId: text('userId'),
  postId: integer('postId'),
  tags: text('tags', { mode: 'json' }).$type<string[]>()
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema
  },
  (table) => {
    return {
      userIdIndex: index('commentsUserIdIndex').on(table.userId),
      postIdIndex: index('commentsPostIdIndex').on(table.postId)
    };
  }
);

export const relation = relations(table, ({ one }) => ({
  post: one(posts.table, {
    fields: [table.postId],
    references: [posts.table.id]
  }),
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id]
  })
}));

export const access: ApiConfig['access'] = {
  operation: {
    read: true,
    create: true,
    update: isAdminOrUser,
    delete: isAdminOrUser
  }
};

export const hooks: ApiConfig['hooks'] = {
  resolveInput: {
    create: (ctx, data) => {
      if (ctx.get('user')?.userId) {
        data.userId = ctx.get('user').userId;
      }
      return data;
    },
    update: (ctx, id, data) => {
      if (ctx.get('user')?.userId) {
        data.userId = ctx.get('user').userId;
      }
      return data;
    }
  }
};
export const fields: ApiConfig['fields'] = {
  tags: {
    type: 'string[]'
  }
};
