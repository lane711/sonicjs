import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export async function createUserTestTables(ctx) {
  await createUserTestTable1(ctx);
  await createUserTestTable2(ctx);
  await createUserTestTable3(ctx);
}

export async function createCategoriesTestTable1(ctx) {
  const db = drizzle(ctx.env.D1DATA);
  console.log('creating categories table start');
  await db.run(sql`
    CREATE TABLE categories (
      id text PRIMARY KEY NOT NULL,
      title text,
      body text,
      createdOn integer,
      updatedOn integer
      );
      `);
  console.log('creating categories table end');

  return db;
}

async function createUserTestTable1(ctx) {
  const db = drizzle(ctx.env.D1DATA);
  console.log('creating test table start');
  await db.run(sql`
      CREATE TABLE users (
        id text PRIMARY KEY NOT NULL,
        firstName text,
        lastName text,
        email text,
        password text,
        role text,
        createdOn integer,
        updatedOn integer
      );
      `);
  console.log('creating test table end');

  return db;
}

async function createUserTestTable2(ctx) {
  const db = drizzle(ctx.env.D1DATA);
  console.log('creating test table start');
  await db.run(sql`
    CREATE TABLE user_keys (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        hashed_password text,
        createdOn integer,
        updatedOn integer,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      );
      `);
  console.log('creating test table end');

  return db;
}

async function createUserTestTable3(ctx) {
  const db = drizzle(ctx.env.D1DATA);
  console.log('creating test table start');
  await db.run(sql`
    CREATE TABLE user_sessions (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        active_expires integer NOT NULL,
        idle_expires integer NOT NULL,
        createdOn integer,
        updatedOn integer,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      );
      `);
  console.log('creating test table end');

  return db;
}
