// it('api.test.ts dummy', () => {});
import app from '../../server';
import { drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { insertD1Data } from '../data/d1-data';
import { getRecords, insertRecord } from '../data/data';
import {
  CreateTestCategory,
  createCategoriesTestTable1,
  createUserAndGetToken,
  getTestingContext
} from '../util/testing';

const ctx = getTestingContext();

describe('Test the APIs', () => {
  it('ping should return 200', async () => {
    const res = await app.fetch(
      new Request('http://localhost/v1/ping'),
      ctx.env
    );
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body).toBe('/v1/ping is all good');
  });
});

describe('auto endpoints', () => {
  it('get should return results and 200', async () => {
    await createCategoriesTestTable1(ctx);
    await CreateTestCategory(ctx, 'cat 1');
    await CreateTestCategory(ctx, 'cat 2');

    let req = new Request('http://localhost/v1/categories', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(2);
  });

  it('get single record should return results and 200', async () => {
    await createCategoriesTestTable1(ctx);
    const testCategory = await CreateTestCategory(ctx, 'cat 1');
    await CreateTestCategory(ctx, 'cat 2');

    let req = new Request(
      `http://localhost/v1/categories/${testCategory.data.id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.title).toBe('cat 1');
    expect(body.total).toBe(1);
    expect(body.source).toBe('d1');

    //if we get again it should be cached
    let req2 = new Request(
      `http://localhost/v1/categories/${testCategory.data.id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    let res2 = await app.fetch(req, ctx.env);
    expect(res2.status).toBe(200);
    let body2 = await res2.json();
    expect(body.data.title).toBe('cat 1');
    expect(body.total).toBe(1);
    expect(body2.source).toBe('cache');
  });

  it('post (insert) should return 204', async () => {
    createCategoriesTestTable1(ctx);
    let payload = JSON.stringify({ data: { title: 'My Category' } });
    let req = new Request('http://localhost/v1/categories', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(201);
    let body = await res.json();
    expect(body.title).toBe('My Category');
    expect(body.id.length).toBeGreaterThan(1);
  });

  it('put should return 200 and return id', async () => {
    await createCategoriesTestTable1(ctx);
    const testCategory = await CreateTestCategory(ctx, 'cat 1');
    await CreateTestCategory(ctx, 'cat 2');

    const user = await createUserAndGetToken(app, ctx);

    let payload = JSON.stringify({
      data: { title: 'cat 1 updated' },
      id: testCategory.data.id
    });
    let req = new Request(
      `http://localhost/v1/categories/${testCategory.data.id}`,
      {
        method: 'PUT',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      }
    );
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    // expect(body.id.length).toBeGreaterThan(1);

    //make sure db was updated
    const d1Result = await getRecords(ctx, 'categories', undefined, 'urlKey');

    expect(d1Result.data[0].id).toBe(testCategory.data.id);
    expect(d1Result.data[0].title).toBe('cat 1 updated');
  });

  it('delete should return 204 and return id', async () => {
    await createCategoriesTestTable1(ctx);
    const testCategory = await CreateTestCategory(ctx, 'cat 1');
    const testCategory2 = await CreateTestCategory(ctx, 'cat 2');

    const user = await createUserAndGetToken(app, ctx);

    let payload = JSON.stringify({
      data: { title: 'cat 1 updated' },
      id: testCategory.data.id
    });
    let req = new Request(
      `http://localhost/v1/categories/${testCategory.data.id}`,
      {
        method: 'DELETE',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      }
    );
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(204);

    //make sure db was updated
    const d1Result = await getRecords(ctx, 'categories', undefined, 'urlKey');

    expect(d1Result.data.length).toBe(1);
    expect(d1Result.data[0].id).toBe(testCategory2.data.id);
  });

  //
  //   it('delete should return 200', async () => {
  //     //create test record to update
  //
  //     const testRecordToUpdate = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
  //       data: {
  //         firstName: 'John'
  //       },
  //       table: 'users'
  //     });
  //
  //     let req = new Request(
  //       `http://localhost/v1/users/${testRecordToUpdate.data.id}`,
  //       {
  //         method: 'DELETE',
  //         headers: { 'Content-Type': 'application/json' }
  //       }
  //     );
  //     let res = await app.fetch(req, env);
  //     expect(res.status).toBe(204);
  //
  //     //make sure db was updated
  //     const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };
  //     const d1Result = await getRecords(ctx, 'users', undefined, 'urlKey');
  //
  //     expect(d1Result.data.length).toBe(0);
  //   });
  //
  //   it('kv text should return results and 200', async () => {
  //     let req = new Request('http://localhost/v1/kv-test2', {
  //       method: 'GET',
  //       headers: { 'Content-Type': 'application/json' }
  //     });
  //     let res = await app.fetch(req, env);
  //     expect(res.status).toBe(200);
  //     let body = await res.json();
  //     expect(body.value.source).toBe('kv');
  //   });
  // });
  //
  // function createTestTable() {
  //   const db = drizzle(__D1_BETA__D1DATA);
  //   console.log('creating test table');
  //   db.run(sql`
  //     CREATE TABLE users (
  //       id text PRIMARY KEY NOT NULL,
  //       firstName text,
  //       lastName text,
  //       email text,
  //       password text,
  //       role text,
  //       createdOn integer,
  //       updatedOn integer
  //     );
  // 	`);
  //
  //   return db;
  // }
  //
});
