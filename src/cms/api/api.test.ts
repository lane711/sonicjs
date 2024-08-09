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
    const testCategory2 = await CreateTestCategory(ctx, 'cat 2');

    let req = new Request(
      `http://localhost/v1/categories/${testCategory2.data.id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.title).toBe('cat 2');
    expect(body.total).toBe(1);
    expect(body.source).toBe('d1');

    //if we get again it should be cached
    let req2 = new Request(
      `http://localhost/v1/categories/${testCategory2.data.id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    let res2 = await app.fetch(req, ctx.env);
    expect(res2.status).toBe(200);
    let body2 = await res2.json();
    expect(body.data.title).toBe('cat 2');
    expect(body.total).toBe(1);
    expect(body2.source).toBe('cache');
  });

  it('get sort on 2 fields', async () => {
    await createCategoriesTestTable1(ctx);
    await CreateTestCategory(ctx, 'cat 1', 'ccc');
    await CreateTestCategory(ctx, 'cat 1', 'aaa');
    await CreateTestCategory(ctx, 'cat 2', 'bbb');


    let req = new Request('http://localhost/v1/categories?sort[0]=body&sort[1]=title', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(3);
    expect(body.data[0].body).toBe('aaa');
    expect(body.data[1].body).toBe('bbb');
    expect(body.data[2].body).toBe('ccc');

  });

  it('get sort desc on 2 fields', async () => {
    await createCategoriesTestTable1(ctx);
    await CreateTestCategory(ctx, 'cat 1', 'ccc');
    await CreateTestCategory(ctx, 'cat 1', 'aaa');
    await CreateTestCategory(ctx, 'cat 2', 'bbb');


    let req = new Request('http://localhost/v1/categories?sort[0]=body:desc&sort[1]=title', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(3);
    expect(body.data[0].body).toBe('ccc');
    expect(body.data[1].body).toBe('bbb');
    expect(body.data[2].body).toBe('aaa');

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
});

describe('filters', () => {
  it('filter should return results and 200', async () => {
    await createCategoriesTestTable1(ctx);
    await CreateTestCategory(ctx, 'cat');
    await CreateTestCategory(ctx, 'dog');

    let req = new Request(
      'http://localhost/v1/categories?filters[title][$eq]=dog',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].title).toBe('dog');
  });

  it('filter should return results and 200', async () => {
    await createCategoriesTestTable1(ctx);
    await CreateTestCategory(ctx, 'cat');
    await CreateTestCategory(ctx, 'dog');
    await CreateTestCategory(ctx, 'dog');


    let req = new Request(
      'http://localhost/v1/categories?filters[title][$eq]=dog',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(2);
    expect(body.data[0].title).toBe('dog');
    expect(body.data[1].title).toBe('dog');
  });

  it('filter with 2 conditions should return results and 200', async () => {
    await createCategoriesTestTable1(ctx);
    await CreateTestCategory(ctx, 'dog', 'be the person your dog thinks you are');


    let req = new Request(
      'http://localhost/v1/categories?filters[title][$eq]=dog&filters[body][$eq]=be+the+person+your+dog+thinks+you+are',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].title).toBe('dog');
    expect(body.data[0].title).toBe('dog');
  });

});
