import { drizzle } from 'drizzle-orm/d1';
import app from '../../server';
import { sql } from 'drizzle-orm';
import { getD1DataByTable, insertD1Data } from '../data/d1-data';
import { postData } from '../util/fetch';
import {
  createCategoriesTestTable1,
  createUserAndGetToken,
  createUserTestTables
} from '../util/testing';
import { createUser } from '../auth/lucia';
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();

const toJson = function (json) {
  return json;
};

const ctx = {
  env: { KVDATA: KVDATA, D1DATA: __D1_BETA__D1DATA },
  json: toJson
};

describe('admin should be restricted', () => {
  it('ping should return 200', async () => {
    const res = await app.fetch(
      new Request('http://localhost/v1/ping'),
      ctx.env
    );
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body).toBe('/v1/ping is all good');
  });

  it('categories record', async () => {
    await createCategoriesTestTable1(ctx);

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

  it('create and login user', async () => {
    const token = await createUserAndGetToken(app, ctx);
  });

  it('anyone can list categories', async () => {
    let req = new Request('http://localhost/v1/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
  });

  // it('admin can see their own record', async () => {
  //   const user = await createUserAndGetToken(app, ctx);
  //   // TODO should be able to get users
  //   let req = new Request(`http://localhost/v1/auth/users/${user.id}`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${user.token}`
  //     }
  //   });
  //   let res = await app.fetch(req, ctx.env);
  //   expect(res.status).toBe(200);
  //   let userResponse = await res.json();
  //   expect(userResponse.id).toBe(user.id);
  // });

  // it('admin can see all user records', async () => {
  //   const user = await createUserAndGetToken(app, ctx);
  //   const user2 = await createUserAndGetToken(app, ctx, 'b@b.com', 'password', 'editor');

  //   // TODO should be able to get users
  //   let req = new Request(`http://localhost/v1/auth/users/`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${user.token}`
  //     }
  //   });
  //   let res = await app.fetch(req, ctx.env);
  //   expect(res.status).toBe(200);
  //   let usersResponse = await res.json();
  //   expect(usersResponse.data.length).toBe(2);
  // });

});
