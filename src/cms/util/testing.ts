import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { createUser } from '../auth/lucia';
import { getD1DataByTable } from '../data/d1-data';
import { insertRecord } from '../data/data';
import { log } from './logger';

export function getTestingContext() {
  const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();

  const toJson = function (json) {
    return json;
  };

  const ctx = {
    env: { KVDATA: KVDATA, D1DATA: __D1_BETA__D1DATA },
    json: toJson,
    user: { id: 'fromtest' },
    _var: { user: { userId: 'abc123' } }
  };

  return ctx;
}

export async function createUserAndGetToken(
  app,
  ctx,
  createTables = true,
  email = 'a@a.com',
  password = 'password123',
  role = 'admin'
) {
  const user = await createLuciaUser(
    app,
    ctx,
    createTables,
    email,
    password,
    role
  );

  let login = {
    email: user.email,
    password
  };

  console.log('logging in ', login);

  //now log the users in
  let req = new Request('http://localhost/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(login)
  });
  let res = await app.fetch(req, ctx.env);
  let body = await res.json();
  expect(res.status).toBe(200);
  expect(body.bearer.length).toBeGreaterThan(10);
  expect(body.user.email).toBe(email);

  return { id: user.id, token: body.bearer };
}

export async function createLuciaUser(
  app,
  ctx,
  createTables = true,
  email = 'a@a.com',
  password = 'password123',
  role = 'admin'
) {
  if (createTables) {
    await createUserTestTables(ctx);
  }
  //TODO: create user properly using the lucia api so that the user keys data in populated

  let user = {
    data: {
      email,
      password,
      role,
      table: 'users'
    }
  };
  const result = await createUser({ content: user, ctx });

  const users = await getD1DataByTable(ctx.env.D1DATA, 'users', { email });
  expect(users.length).toBeGreaterThan(0);

  const usersKeys = await getD1DataByTable(
    ctx.env.D1DATA,
    'user_keys',
    { email }
  );
  expect(usersKeys.length > 0).toBe(true);
  // const dbUser = user.data.filter((u) => u.data.email = email);
  return users[0];
}
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

export async function CreateTestCategory(ctx, title, body = '') {
  return await insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, {
    table: 'categories',
    data: {
      title,
      body
    }
  });
}
