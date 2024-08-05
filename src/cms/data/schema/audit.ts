import { integer } from 'drizzle-orm/sqlite-core';

export const auditSchema = {
  createdOn: integer('createdOn'),
  updatedOn: integer('updatedOn')
};
