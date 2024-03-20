import { sqliteTable, index, text } from 'drizzle-orm/sqlite-core';

import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as users from './users';
import * as categoriesToPosts from './categoriesToPosts';
import * as comments from './comments';
import { ApiConfig } from '../routes';
import { isAdmin, isAdminOrEditor } from '../config-helpers';

export const tableName = 'posts';

export const route = 'posts';

export const definition = {
  id: text('id').primaryKey(),
  title: text('title'),
  body: text('body'),
  userId: text('userId'),
  image: text('image'),
  images: text('images', { mode: 'json' }).$type<string[]>(),
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
      userIdIndex: index('postUserIdIndex').on(table.userId)
    };
  }
);

export const relation = relations(table, ({ one, many }) => ({
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id]
  }),
  categories: many(categoriesToPosts.table),
  comments: many(comments.table)
}));

export const access: ApiConfig['access'] = {
  operation: {
    read: true,
    create: isAdminOrEditor
  },
  filter: {
    // if a user tries to update a post and isn't the user that created the post the update won't happen
    update: (ctx) => {
      if (isAdmin(ctx)) {
        return true;
      } else {
        const user = ctx.get('user');
        if (user?.userId) {
          // Return filter so update doesn't happen if userId doesn't match
          return {
            userId: user.userId
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
        const user = ctx.get('user');
        if (user?.userId) {
          // Return filter so update doesn't happen if userId doesn't match
          return {
            userId: user.userId
          };
        } else {
          return false;
        }
      }
    }
  },
  fields: {
    userId: {
      update: false
    }
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
  image: {
    type: 'file',
    bucket: (ctx) => ctx.env.R2STORAGE,
    path: 'images'
  },
  images: {
    type: 'file[]',
    bucket: (ctx) => ctx.env.R2STORAGE,
    path: 'images'
  },
  tags: {
    type: 'string[]'
  },
  body: {
    type: 'ckeditor'
  }
};
