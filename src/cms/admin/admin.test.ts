it('admin.test.ts dummy', () => {});
// import app from '../../server';
// import { drizzle } from 'drizzle-orm/d1';
// import { sql } from 'drizzle-orm';
// import { insertD1Data } from '../data/d1-data';
// import { getRecords, insertRecord } from '../data/data';
// import { clearInMemoryCache } from '../data/cache';
// import { clearKVCache } from '../data/kv-data';
//
// const env = getMiniflareBindings();
// const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
//
// describe('Test admin front end', () => {
//   it('ping should return 200', async () => {
//     const res = await app.request('http://localhost/admin/ping');
//     expect(res.status).toBe(200);
//   });
// });
//
// describe('Test admin api', () => {
//   it('admin api should return 200', async () => {
//     createTestTable();
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//       firstName: 'John',
//       id: 'a'
//     });
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//       firstName: 'Jane',
//       id: 'b'
//     });
//
//     let req = new Request('http://localhost/admin/api/users?limit=1&offset=1', {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' }
//     });
//     let res = await app.fetch(req, env);
//     expect(res.status).toBe(200);
//     let body = await res.json();
//     expect(body.data.length).toBe(1);
//   });
//
//   it('in memory admin api should return 200', async () => {
//     //start with a clear cache
//     await clearInMemoryCache();
//     await clearKVCache(KVDATA);
//     createTestTable();
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//       firstName: 'John',
//       id: 'a'
//     });
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//       firstName: 'Jane',
//       id: 'b'
//     });
//
//     //this should add to cache
//     const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };
//     const d1Result = await getRecords(ctx, 'users', undefined, '/some-key');
//
//     let req = new Request('http://localhost/admin/api/in-memory-cache', {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' }
//     });
//     let res = await app.fetch(req, env);
//     expect(res.status).toBe(200);
//     let body = await res.json();
//     expect(body.data.length).toBe(1);
//     expect(body.data[0].key).toBe('/some-key');
//   });
//
//   it('kv admin api should return 200', async () => {
//     //start with a clear cache
//     await clearInMemoryCache();
//     await clearKVCache(KVDATA);
//     createTestTable();
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//       firstName: 'John',
//       id: 'a'
//     });
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//       firstName: 'Jane',
//       id: 'b'
//     });
//
//     // this should add to cache
//     const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };
//
//     const d1Result = await getRecords(ctx, 'users', undefined, '/some-key');
//
//     let req = new Request('http://localhost/admin/api/kv-cache', {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' }
//     });
//     let res = await app.fetch(req, env);
//     expect(res.status).toBe(200);
//     let body = await res.json();
//     expect(body.data.length).toBe(1);
//     expect(body.data[0].key).toBe('cache::/some-key');
//     expect(body.data[0].createdOn.length).toBeGreaterThan(0);
//   });
// });
//
// function createTestTable() {
//   const db = drizzle(__D1_BETA__D1DATA);
//   console.log('creating test table start');
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
//   console.log('creating test table end');
//
//   return db;
// }
//
