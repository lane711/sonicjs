import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as posts from './posts';
import * as comments from './comments';
import * as userKeys from './userKeys';
import * as userSessions from './userSessions';
import { ApiConfig } from '../routes';
import { isAdmin, isAdminOrEditor, isAdminOrUser } from '../config-helpers';
export const tableName = 'users';

export const route = 'users';

export const definition = {
  id: text('id').primaryKey(),
  firstName: text('firstName'),
  lastName: text('lastName'),
  email: text('email'),
  password: text('password'),
  role: text('role').$type<'admin' | 'user'>()
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema
});

export const relation = relations(table, ({ many }) => ({
  posts: many(posts.table),
  comments: many(comments.table),
  keys: many(userKeys.table),
  sessions: many(userSessions.table)
}));

export const access: ApiConfig['access'] = {
  operation: {
    create: isAdmin,
    delete: isAdmin
  },
  item: {
    // if a user tries to update a user and isn't the user that created the user the update will return unauthorized response
    update: isAdminOrUser
  },
  fields: {
    id: {
      read: (ctx, value, doc) => {
        return isAdminOrEditor(ctx) || isAdminOrUser(ctx, doc.id);
      }
    },
    email: {
      read: (ctx, value, doc) => {
        return isAdminOrUser(ctx, doc.id);
      }
    },
    password: {
      update: isAdminOrUser
    },
    role: {
      read: (ctx, value, doc) => {
        return isAdminOrUser(ctx, doc.id);
      },
      update: isAdmin
    }
  }
};
