it('example.test.ts dummy', () => {});
// import app from '../server';
// const env = getMiniflareBindings();
// const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
// import { sql } from 'drizzle-orm';
// import { drizzle } from 'drizzle-orm/d1';
//
// import { insertRecord } from '../cms/data/data';
//
// it('get should return results and 200', async () => {
//   const db = createTestTable();
//   const { userRecord, categoryRecord, postRecord } =
//     await createRelatedTestRecords();
//
//   let req = new Request(
//     'http://localhost/v1/example/blog-posts?limit=2&offset=0',
//     {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' }
//     }
//   );
//   let res = await app.fetch(req, env);
//   expect(res.status).toBe(200);
//   let body = await res.json();
//   expect(body.data.length).toBe(2);
//   expect(body.source).toBe('d1');
//   expect(body.total).toBe(3);
//   expect(body.executionTime).toBeGreaterThan(-1);
//
//   //if we get again, should be cached
//   let req2 = new Request(
//     'http://localhost/v1/example/blog-posts?limit=2&offset=0',
//     {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' }
//     }
//   );
//   let res2 = await app.fetch(req2, env);
//   expect(res2.status).toBe(200);
//   let body2 = await res2.json();
//   expect(body2.data.length).toBe(2);
//   expect(body2.source).toBe('cache');
//   expect(body2.total).toBe(3);
//
//   // sleep(200);
//   //anticipated next request should be cached
//   let req3 = new Request(
//     'http://localhost/v1/example/blog-posts?limit=2&offset=2',
//     {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' }
//     }
//   );
//   let res3 = await app.fetch(req3, env);
//   expect(res3.status).toBe(200);
//   let body3 = await res3.json();
//   expect(body3.data.length).toBe(1);
//   expect(body3.source).toBe('cache');
//   expect(body3.total).toBe(3);
// });
//
// it('get should return single result if id passed in', async () => {
//   const db = createTestTable();
//   const { userRecord, categoryRecord, postRecord } =
//     await createRelatedTestRecords();
//
//   let req = new Request(
//     `http://localhost/v1/example/blog-posts/${postRecord.data.id}`,
//     {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' }
//     }
//   );
//   let res = await app.fetch(req, env);
//   expect(res.status).toBe(200);
//   let body = await res.json();
//   expect(body.data.title).toBe('Post One');
//   expect(body.data.category).toBe('Category One');
//   expect(body.source).toBe('d1');
//   expect(body.total).toBe(1);
//   expect(body.executionTime).toBeGreaterThan(-1);
//
//   //if we get again, should be cached
//   let req2 = new Request(
//     `http://localhost/v1/example/blog-posts/${postRecord.data.id}`,
//     {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' }
//     }
//   );
//
//   let res2 = await app.fetch(req2, env);
//   expect(res.status).toBe(200);
//   let body2 = await res2.json();
//   expect(body2.data.category).toBe('Category One');
//   expect(body2.source).toBe('cache');
//   expect(body2.total).toBe(1);
//   expect(body2.executionTime).toBeGreaterThan(-1);
// });
//
// async function createRelatedTestRecords() {
//   const userRecord = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'users',
//     data: {
//       firstName: 'John'
//     }
//   });
//
//   const categoryRecord = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'categories',
//     data: {
//       title: 'Category One'
//     }
//   });
//
//   const categoryRecord2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'categories',
//     data: {
//       title: 'Category Two'
//     }
//   });
//
//   const postRecord = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'posts',
//     data: {
//       id: 'abc',
//       title: 'Post One',
//       userId: userRecord.data.id
//     }
//   });
//
//   const postRecord2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'posts',
//     data: {
//       title: 'Post Two',
//       userId: userRecord.data.id
//     }
//   });
//
//   const postRecord3 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'posts',
//     data: {
//       title: 'Post Three',
//       userId: userRecord.data.id
//     }
//   });
//
//   const categoryToPost = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'categoriesToPosts',
//     data: {
//       categoryId: categoryRecord.data.id,
//       postId: postRecord.data.id
//     }
//   });
//
//   const categoryToPost2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'categoriesToPosts',
//     data: {
//       categoryId: categoryRecord2.data.id,
//       postId: postRecord2.data.id
//     }
//   });
//
//   const commentRecord = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'comments',
//     data: {
//       body: 'My first comment',
//       postId: postRecord.data.id,
//       userId: userRecord.data.id
//     }
//   });
//
//   const commentRecord2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//     table: 'comments',
//     data: {
//       body: 'My second comment',
//       postId: postRecord.data.id,
//       userId: userRecord.data.id
//     }
//   });
//
//   return { userRecord, categoryRecord, postRecord, commentRecord };
// }
//
// async function createTestTable() {
//   const db = drizzle(__D1_BETA__D1DATA);
//
//   db.run(sql`
//   CREATE TABLE "categories" (
//     "id" text PRIMARY KEY NOT NULL,
//     "title" text,
//     "body" text,
//     "createdOn" integer,
//     "updatedOn" integer
//   )`);
//
//   db.run(sql`
//   CREATE TABLE "users" (
//     "id" text PRIMARY KEY NOT NULL,
//     "firstName" text,
//     "lastName" text,
//     "email" text,
//     "password" text,
//     "role" text,
//     "createdOn" integer,
//     "updatedOn" integer
//   );
//   )`);
//
//   db.run(sql`
//   CREATE TABLE "comments" (
//     "id" text PRIMARY KEY NOT NULL,
//     "body" text,
//     "userId" text,
//     "postId" integer,
//     "createdOn" integer,
//     "updatedOn" integer
//   );
//   )`);
//
//   db.run(sql`
//   CREATE TABLE "posts" (
//     "id" text PRIMARY KEY NOT NULL,
//     "title" text,
//     "body" text,
//     "userId" text,
//     "createdOn" integer,
//     "updatedOn" integer
//   );
//   )`);
//
//   let res = await db.run(sql`
//   CREATE TABLE "categoriesToPosts" (
//     "id" text NOT NULL,
//     "postId" text NOT NULL,
//     "categoryId" text NOT NULL,
//     "createdOn" integer,
//     "updatedOn" integer,
//     FOREIGN KEY ("postId") REFERENCES "posts"("id") ON UPDATE no action ON DELETE no action,
//     FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON UPDATE no action ON DELETE no action
//   );
//   `);
//
//   return db;
// }
//
// function sleep(miliseconds) {
//   var currentTime = new Date().getTime();
//
//   while (currentTime + miliseconds >= new Date().getTime()) {}
// }
