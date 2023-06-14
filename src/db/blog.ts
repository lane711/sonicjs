import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
 
export const customers = sqliteTable('blog', {
  id: integer('id').primaryKey(),
  title: text('title'),
  body: text('body'),
  }, (countries) => ({
    nameIdx: uniqueIndex('titleIdx').on(customers.title),
  })
);
