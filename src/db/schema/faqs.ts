import { sqliteTable, index, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as posts from './posts';
import * as users from './users';
import { ApiConfig } from '../routes';
import { isAdmin, isAdminOrUser } from '../config-helpers';

export const tableName = 'faqs';

export const route = 'faqs';

export const definition = {
  id: text('id').primaryKey(),
  question: text('question'),
  answer: text('answer'),
  sort: integer('sort').default(100),
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema
  },
);

export const access: ApiConfig['access'] = {
  operation: {
    read: true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  }
};


export const fields: ApiConfig['fields'] = {
  question: {
    type: 'ckeditor'
  },
  answer: {
    type: 'ckeditor'
  }
};
