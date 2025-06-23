import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Import D1Database type from Cloudflare workers
type D1Database = import('@cloudflare/workers-types').D1Database;

// Database connection factory
export function createDB(database: D1Database) {
  return drizzle(database, { schema });
}

// Type for our database instance
export type Database = ReturnType<typeof createDB>;

// Re-export schema for convenience
export * from './schema';