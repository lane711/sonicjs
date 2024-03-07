import { drizzle } from 'drizzle-orm/d1';
import app from '../../server';
import { sql } from 'drizzle-orm';
import { getD1DataByTable, insertD1Data } from '../data/d1-data';
import { postData } from '../util/fetch';
import { createCategoriesTestTable1, createUserTestTables } from '../util/testing';
import { createUser } from '../auth/lucia';
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();

const toJson = function(json){ 
  return json
};

const ctx = { env: { KVDATA: KVDATA, D1DATA: __D1_BETA__D1DATA },
json: toJson };

describe('admin should be restricted', () => {
  it('ping should return 200', async () => {
    const res = await app.fetch(new Request('http://localhost/v1/ping'), ctx.env);
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

    it('user record', async () => {
      await createUserTestTables(ctx);

      //TODO: create user properly using the lucia api so that the user keys data in populated
      let user = {data: {
        email: "a@a.com",
        password: "password123",
        role:'admin',
        table:'users'
      }};
      const result = await createUser({ content: user, ctx });


      // const userRecord = await insertD1Data(ctx.env.D1DATA, ctx.env.KVDATA, 'users', {
      //   firstName: 'John',
      //   id: 'aaa',
      //   email: 'a@a.com',
      //   password: 'password123',
      //   role: 'admin'
      // });

      const users = await getD1DataByTable(ctx.env.D1DATA, 'users', undefined);
      expect(users.length).toBe(1);

      //now log that users in
      let payload = {data: {
        email: "a@a.com",
        password: "password123"
      }};

      let req = new Request("http://localhost/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      let res = await app.fetch(req, ctx.env);
      expect(res.status).toBe(200);

      //use the token to get thee user info

      // let req = new Request('http://localhost/v1/users/aaa', {
      //   method: 'GET',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      // let res = await app.fetch(req, ctx.env);
      // expect(res.status).toBe(200);
    });

});
