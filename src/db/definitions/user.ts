import { integer, text } from "drizzle-orm/sqlite-core";

export const tableName = "users";
export const route = "users";
export const usersSchema = {
  id: text("id").primaryKey(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email"),
  password: text("password"),
  role: text("role").$type<"admin" | "user">(),
};
