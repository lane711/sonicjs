import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Database connection factory
export function createDB(database: D1Database) {
  return drizzle(database, { schema });
}

// Type for our database instance
export type Database = ReturnType<typeof createDB>;

// Re-export schema for convenience
export * from './schema';