import { sqliteTable, index, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as posts from './posts';
import * as users from './users';
import { ApiConfig } from '../routes';
import { isAdminOrUser } from '../config-helpers';

export const tableName = 'programs';

export const route = 'programs';

export const definition = {
  id: text('id').primaryKey(),
  type: integer('type'),
  title: text('title'),
  description: text('description'),
  source: text('source'),
  frequencies: text('text', { mode: 'json' }),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  sort: integer('sort').default(10),
  userId: text('userId'),
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema
  },
);

export const relation = relations(table, ({ one }) => ({
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id]
  })
}));

export const access: ApiConfig['access'] = {
  operation: {
    read: true,
    create: isAdminOrUser,
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
