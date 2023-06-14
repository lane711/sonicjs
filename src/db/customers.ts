import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
 
export const customers = sqliteTable('customers', {
  CustomerId: integer('CustomerId').primaryKey(),
  CompanyName: text('CompanyName'),
  ContactName: text('ContactName'),
  }, (countries) => ({
    nameIdx: uniqueIndex('nameIdx').on(customers.CompanyName),
  })
);
