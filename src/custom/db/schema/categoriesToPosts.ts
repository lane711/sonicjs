import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from '@schema/audit';
import * as categories from './categories';
import * as posts from './posts';
import { isAdminOrEditor } from 'db/config-helpers';
import type { ApiConfig } from 'db/routes';


export const tableName = 'categoriesToPosts';

export const route = 'categories-to-posts';
export const name = 'Categories To Posts';
export const icon=`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
</svg>
`
export const definition = {
  id: text('id').notNull(),
  postId: text('postId')
    .notNull()
    .references(() => posts.table.id),
  categoryId: text('categoryId')
    .notNull()
    .references(() => categories.table.id)
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema
  },
  (table) => ({
    pk: primaryKey(table.postId, table.categoryId)
  })
);

export const relation = relations(table, ({ one }) => ({
  category: one(categories.table, {
    fields: [table.categoryId],
    references: [categories.table.id]
  }),
  post: one(posts.table, {
    fields: [table.postId],
    references: [posts.table.id]
  })
}));

export const access: ApiConfig['access'] = {
  operation: {
    read: true,
    create: true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor
  }
};
