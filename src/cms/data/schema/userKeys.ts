import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as users from './users';

export const tableName = 'user_keys';

export const definition = {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.table.id),
  hashed_password: text('hashed_password')
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema
});

export const relation = relations(table, ({ one }) => ({
  user: one(users.table, {
    fields: [table.user_id],
    references: [users.table.id]
  })
}));
