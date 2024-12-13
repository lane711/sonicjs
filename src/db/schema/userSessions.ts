import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations, type InferSelectModel } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as users from './users';

export const tableName = 'userSessions';
export const name = 'User Sessions'

export const definition = {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.table.id),
  activeExpires: int('activeExpires').notNull(),
  idleExpires: int('idleExpires').notNull()
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema
});

export const relation = relations(table, ({ one }) => ({
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id]
  })
}));

export type Session = InferSelectModel<typeof table>;

