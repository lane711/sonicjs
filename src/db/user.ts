import { sqliteTable, text, integer, SQLiteTimestamp, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable("user", {
    id: integer("id"),
    name: text("name"),
    email: text("email"),
    password: text("password"),
    role: text("role").$type<"admin" | "user">(),
    createdAt: integer("created_at", {mode:"timestamp"}),
    updatedAt: integer("updated_at", {mode:"timestamp"}),
  });