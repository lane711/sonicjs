it('data-references.test.ts dummy', () => {});
// import { insertD1Data } from './d1-data';
// import { tableSchemas } from '../../db/routes';
// import { sql } from 'drizzle-orm';
// import { drizzle } from 'drizzle-orm/d1';
// import { getRecords, insertRecord } from './data';
// import { clearInMemoryCache } from './cache';
// import { clearKVCache } from './kv-data';
//
// const schema = {};
// for (const key of Object.keys(tableSchemas)) {
//   schema[key] = tableSchemas[key]?.table;
//   schema[key + 'Relation'] = tableSchemas[key]?.relation;
// }
// const env = getMiniflareBindings();
// const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
// const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };
//
// it('insert should allow refer', async () => {
//   const urlKey = 'http://localhost:8888/some-cache-key-url';
//
//   const db = createTestTable();
//   const { userRecord, categoryRecord, postRecord } =
//     await createRelatedTestRecords();
//
//   const d1Result = await getRecords(ctx, 'posts', undefined, urlKey);
//
//   //record should be in list
//   expect(d1Result.data.length).toBe(1);
//   expect(d1Result.source).toBe('d1');
//   expect(d1Result.data[0].userId).toBe(userRecord.data.id);
// });
//
// it('get user related data', async () => {
//   const urlKey = 'http://localhost:8888/some-cache-key-url';
//
//   createTestTable();
//   const { userRecord, categoryRecord, postRecord } =
//     await createRelatedTestRecords();
//
//   const db = drizzle(__D1_BETA__D1DATA, { schema });
//
//   const user = await db.query.users.findMany({
//     with: {
//       posts: true,
//       comments: true
//     }
//   });
//
//   //record should be in list
//   expect(user.length).toBe(1);
//   expect(user[0].posts.length).toBe(1);
//   expect(user[0].posts[0].userId).toBe(user[0].id);
//   expect(user[0].comments.length).toBe(2);
//   expect(user[0].comments[0].userId).toBe(user[0].id);
// });
//
// it('get post related data', async () => {
//   const urlKey = 'http://localhost:8888/some-cache-key-url';
//
//   await createTestTable();
//   const { userRecord, categoryRecord, postRecord, commentRecord } =
//     await createRelatedTestRecords();
//
//   const db = drizzle(__D1_BETA__D1DATA, { schema });
//
//   const comments = await db.query.comments.findMany();
//
//   const post = await db.query.posts.findFirst({
//     with: {
//       user: true,
//       comments: { with: { user: true } },
//       categories: { with: { category: true } }
//     }
//   });
//
//   expect(post.user.id).toBe(userRecord.data.id);
//   expect(post.categories.length).toBe(2);
//   expect(post.categories[1].postId).toBe(postRecord.data.id);
//   expect(post.comments.length).toBe(2);
//   expect(post.comments[0].user.id).toBe(userRecord.data.id);
// });
//
// it('getRecords can accept custom function for retrieval of data', async () => {
//   //start with a clear cache
//   await clearInMemoryCache();
//   await clearKVCache(KVDATA);
//
//   const urlKey = 'http://localhost:8888/some-cache-key-url';
//
//   const db = createTestTable();
//
//   const rec1 = await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//     firstName: 'John',
//     id: '1'
//   });
//
//   const func = function () {
//     return { foo: 'bar' };
//   };
//
//   const result = await getRecords(
//     ctx,
//     'users',
//     undefined,
//     urlKey,
//     'fastest',
//     func
//   );
//
//   expect(result.data.foo).toBe('bar');
// });
//
// it('getRecords can accept custom function with parameters for retrieval of data', async () => {
//   //start with a clear cache
//   await clearInMemoryCache();
//   await clearKVCache(KVDATA);
//
//   await createTestTable();
//   const { userRecord, categoryRecord, postRecord, commentRecord } =
//     await createRelatedTestRecords();
//
//   const urlKey = 'http://localhost:8888/some-cache-key-url';
//
//   const func = async function () {
//     const db = drizzle(__D1_BETA__D1DATA, { schema });
//
//     return await db.query.posts.findFirst({
//       with: {
//         user: true,
//         comments: { with: { user: true } },
//         categories: { with: { category: true } }
//       }
//     });
//   };
//
//   const { data } = await getRecords(
//     ctx,
//     'users',
//     undefined,
//     urlKey,
//     'fastest',
//     func
//   );
//
//   expect(data.comments.length).toBe(2);
//   expect(data.categories.length).toBe(2);
//   expect(data.user.firstName).toBe('John');
//
//   //if we get data again, the custom data should be cached
//   const postCached = await getRecords(
//     ctx,
//     'users',
//     undefined,
//     urlKey,
//     'fastest',
//     func
//   );
//   expect(postCached.data.comments.length).toBe(2);
//   expect(postCached.data.categories.length).toBe(2);
//   expect(postCached.data.user.firstName).toBe('John');
//   expect(postCached.source).toBe('cache');
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
//       title: 'Post One',
//       userId: userRecord.data.id
//     }
//   });
//
//   // const postRecord2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
//   //   table: "posts",
//   //   data: {
//   //     title: "Post Two",
//   //     userId: userRecord.data.id,
//   //   },
//   // });
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
//       postId: postRecord.data.id
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
