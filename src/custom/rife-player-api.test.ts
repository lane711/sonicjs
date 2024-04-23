import app from '../server';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import { getRecords, insertRecord } from '../cms/data/data';
import { migrateData } from './migrate-data';
import { insertD1Data } from '../cms/data/d1-data';
import { createUserTestTables, getTestingContext } from '../cms/util/testing';

const ctx = getTestingContext();

it('rp controller sanity', async () => {
  // await createTestTable(ctx);

  // await migrateData(ctx, 20);

  let req = new Request('http://localhost/v2', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  let res = await app.fetch(req, ctx.env);
  expect(res.status).toBe(200);
});

// it('rp programs', async () => {
//   await createProgramTable(ctx);

//   await migrateData(ctx, 20);

//   let req = new Request('http://localhost/v2/programs', {
//     method: 'GET',
//     headers: { 'Content-Type': 'application/json' }
//   });
//   let res = await app.fetch(req, ctx.env);
//   expect(res.status).toBe(200);
//   let body = await res.json();
//   expect(body.data.length).toBe(20);
//   expect(body.data[0].frequencies).toBeInstanceOf(Array);
// });

it('check user exists true', async () => {
  await createUserTestTable(ctx);

  const rec1 = await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
    firstName: 'John',
    email: 'a@a.com',
    id: '1'
  });

  let req = new Request('http://localhost/v2/check-user-exists/a%40a.com', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  let res = await app.fetch(req, ctx.env);
  expect(res.status).toBe(200);
  let body = await res.json();
  expect(body).toBe(true);
});

it('check user exists true', async () => {
  await createUserTestTables(ctx);

  const rec1 = await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
    firstName: 'John',
    email: 'a@a.com',
    id: '1'
  });

  let req = new Request('http://localhost/v2/check-user-exists/b%40b.com', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  let res = await app.fetch(req, ctx.env);
  expect(res.status).toBe(200);
  let body = await res.json();
  expect(body).toBe(false);
});

it('contact post should (insert) and should return 204', async () => {
  await createContactTable(ctx);
  let payload = JSON.stringify({
    data: {
      firstName: 'Joe',
      lastName: 'Smith',
      email: 'test@test.com',
      message: `line one\r\nline two I'd be good`
    },
    token: ctx.env.APIKEY
  });
  let req = new Request('http://localhost/v2/contact-submit', {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' }
  });
  let res = await app.fetch(req, ctx.env);
  expect(res.status).toBe(201);
  let body = await res.json();
  expect(body.id.length).toBeGreaterThan(1);
  expect(body.firstName).toBe('Joe');
});

it('register user via the api', async () => {
  await createUserTestTables(ctx);

  const account = {
    data: {
      firstName: '',
      lastName: '',
      role: 'user',
      email: 'a@a.com',
      password: '12341234',
      table: 'users'
    }
  };

  let req = new Request(`http://localhost/v1/auth/users/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(account)
  });
  let res = await app.fetch(req, ctx.env);

  //by default users can't register on their own
  expect(res.status).toBe(201);
  let body = await res.json();

  //check that user exists
  let users = await getRecords(
    ctx,
    'users',
    undefined,
    '/users-url',
    'd1',
    undefined
  );
  expect(users.data.length).toBe(1);

  //add another
  account.data.email = 'b@b.com';

  let req2 = new Request(`http://localhost/v1/auth/users/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(account)
  });
  let res2 = await app.fetch(req2, ctx.env);

  expect(res2.status).toBe(201);
  let body2 = await res2.json();

  //check that user exists
  let users2 = await getRecords(
    ctx,
    'users',
    undefined,
    '/users-url',
    'd1',
    undefined
  );
  expect(users2.data.length).toBe(2);
  expect(users2.data[1].email).toBe('b@b.com');

});


async function createProgramTable(ctx) {
  const db = drizzle(ctx.env.D1DATA);
  console.log('creating programs table start');
  await db.run(sql`
      CREATE TABLE programs (
        id text PRIMARY KEY NOT NULL,
        type integer,
        title text,
        description text,
        source text,
        frequencies text,
        tags text,
        sort integer DEFAULT 10,
        userId text,
        createdOn integer,
        updatedOn integer
      );
      `);
  console.log('creating programs table end');

  return db;
}

async function createContactTable(ctx) {
  const db = drizzle(ctx.env.D1DATA);
  console.log('creating contacts table start');
  await db.run(sql`
  CREATE TABLE contacts (
    id text PRIMARY KEY NOT NULL,
    firstName text,
    lastName text,
    company text,
    email text,
    phone text,
    message text,
    createdOn integer,
    updatedOn integer
      );
      `);
  console.log('creating contacts table end');

  return db;
}
