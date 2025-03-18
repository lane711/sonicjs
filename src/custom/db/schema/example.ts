import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations, type InferSelectModel } from 'drizzle-orm';
import { auditSchema } from '@schema/audit';

export const tableName = 'userSessions';
export const name = 'User Sessions'

export const definition = {
  id: text('id').primaryKey(),
  title: text('title').notNull()

};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema
});


export type Session = InferSelectModel<typeof table>;

