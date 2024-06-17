import app from '../../server';
import { insertD1Data } from '../data/d1-data';
import { getRecords } from '../data/data';
import {
  createCategoriesTestTable1,
  createLuciaUser,
  createUserAndGetToken,
  createUserTestTables,
  getTestingContext
} from '../util/testing';

const ctx = getTestingContext();

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

  it('create and attempt login with wrong password user', async () => {
    const user = await createLuciaUser(app, ctx);

    let login = {
      email: user.email,
      password: 'wrong0'
    };

    //now log the users in
    let req = new Request('http://localhost/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(login)
    });
    let res = await app.fetch(req, ctx.env);
    let body = await res.json();
    expect(res.status).toBe(400);
    expect(body.message).toBe('Incorrect username or password');
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

    let req = new Request(`http://localhost/v1/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(account)
    });
    let res = await app.fetch(req, ctx.env);

    //by default users can't register on their own
    expect(res.status).toBe(401);
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

  it('admin can see their own record', async () => {
    const user = await createUserAndGetToken(app, ctx);
    // TODO should be able to get users
    let req = new Request(`http://localhost/v1/auth/users/${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let userResponse = await res.json();
    expect(userResponse.data.id).toBe(user.id);
  });

  it('user can see their own record based on user id', async () => {
    const user = await createUserAndGetToken(
      app,
      ctx,
      true,
      'user@user.com',
      '12345678',
      'user'
    );

    // TODO should be able to get users
    let req = new Request(`http://localhost/v1/auth/users/${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let userResponse = await res.json();
    expect(userResponse.data.id).toBe(user.id);
  });

  it('user can see their own record based on session token', async () => {
    const user = await createUserAndGetToken(
      app,
      ctx,
      true,
      'user@user.com',
      '12345678',
      'user'
    );

    // TODO should be able to get users
    let req = new Request(`http://localhost/v1/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let userResponse = await res.json();
    expect(userResponse.data.id).toBe(user.id);
    expect(userResponse.source).toBe('session');
  });

  it('user can update their own record', async () => {
    const user = await createUserAndGetToken(
      app,
      ctx,
      true,
      'user@user.com',
      '12345678',
      'user'
    );

    let payload = JSON.stringify({
      data: { email: 'user2@user.com', firstName: 'Uppy' }
    });
    let req = new Request(`http://localhost/v1/auth/users/${user.id}`, {
      method: 'PUT',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      }
    });
    let res = await app.fetch(req, ctx.env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.email).toBe('user2@user.com');
    expect(body.data.firstName).toBe('Uppy');


    //make sure db was updated
    const d1Result = await getRecords(ctx, 'users', { id: user.id }, undefined);

    expect(d1Result.data.id).toBe(user.id);
    expect(d1Result.data.email).toBe(body.data.email);
    expect(d1Result.data.firstName).toBe(body.data.firstName);
  });

  it('register user via the api', async () => {
    await createUserTestTables(ctx);

    const account = {
      data: {
        firstName: 'Joe',
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
    expect(users.data[0].firstName).toBe('Joe');
    expect(users.data[0].role).toBe('user');
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

    expect(res2.status).toBe(401);

    // if create user (register) is allowed, you can uncomment the below
    // let body2 = await res2.json();

    // //check that user exists
    // let users2 = await getRecords(
    //   ctx,
    //   'users',
    //   undefined,
    //   '/users-url',
    //   'd1',
    //   undefined
    // );
    // expect(users2.data.length).toBe(2);
    // expect(users2.data[1].email).toBe('b@b.com');
  });
  // it('admin can see all user records', async () => {
  //   const user = await createUserAndGetToken(app, ctx);
  //   // const user2 = await createUserAndGetToken(app, ctx, 'b@b.com', 'password', 'editor');

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
  //   expect(usersResponse.data.length).toBe(1);
  // });
});
