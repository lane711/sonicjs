import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
 
export const blog = sqliteTable('blog', {
  id: integer('id').primaryKey(),
  title: text('title'),
  body: text('body'),
  }, (blog) => ({
    nameIdx: uniqueIndex('titleIdx').on(blog.title),
  })
);
