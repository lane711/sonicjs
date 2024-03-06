import { drizzle } from 'drizzle-orm/d1';
import app from '../../server';
import { sql } from 'drizzle-orm';
import { insertD1Data } from '../data/d1-data';
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
const ctx = { env: { KVDATA: KVDATA, D1DATA: __D1_BETA__D1DATA } };

describe('admin should be restricted', () => {
  it('ping should return 200', async () => {
    const res = await app.fetch(new Request('http://localhost/v1/ping'), ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body).toBe('/v1/ping is all good');
  });

  it('categories record', async () => {
    await createCategoriesTestTable1();

    await insertD1Data(ctx.env.D1DATA, ctx.env.KVDATA, 'categories', {
      id: '1',
      title: 'My Title',
      body: 'Body goes here'
    });

    let req = new Request('http://localhost/v1/categories', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data[0].id).toBe('1');
  });

    it('user record', async () => {
      await createUserTestTables();

      await insertD1Data(env.D1DATA, env.KVDATA, 'users', {
        firstName: 'John',
        id: 'aaa',
        email: 'a@a.com',
        password: 'password',
        role: 'admin'
      });

      let req = new Request('http://localhost/v1/users/aaa', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      let res = await app.fetch(req, env);
      expect(res.status).toBe(200);
    });
});

async function createUserTestTables() {
  await createUserTestTable1();
  await createUserTestTable2();
  await createUserTestTable3();
}

async function createCategoriesTestTable1() {
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

async function createUserTestTable1() {
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

async function createUserTestTable2() {
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

async function createUserTestTable3() {
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
