import { insertD1Data, updateD1Data } from './d1-data';
import qs from 'qs';
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { getRecords, insertRecord } from './data';
import { clearInMemoryCache } from './cache';
import { clearKVCache } from './kv-data';
const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };

it('insert should return new record with id and dates', async () => {
  const urlKey = 'http://localhost:8888/some-cache-key-url';

  const db = await createCategoriesTestTable();
  const newRecord = await insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, {
    table: 'categories',
    data: {
      title: 'cat 1'
    }
  });
  console.log('newRecord', newRecord);

  const newRecord2 = await insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, {
    table: 'categories',
    data: {
      title: 'cat 2'
    }
  });
  console.log('newRecord2', newRecord2);

  const d1Result = await getRecords(ctx, 'categories', undefined, urlKey);

  //record should be in list
  expect(d1Result.data.length).toBe(2);
  expect(d1Result.total).toBe(2);
  expect(d1Result.source).toBe('d1');
  expect(d1Result.data[0].title).toBe('cat 1');
});

// it('CRUD', async () => {
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
//   console.log('rec1', rec1);
//
//   const rec2 = await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//     firstName: 'Jane',
//     id: '2'
//   });
//   console.log('rec2', rec2);
//
//   const d1Result = await getRecords(ctx, 'users', undefined, urlKey);
//
//   console.log('d1Result', d1Result);
//
//   expect(d1Result.data.length).toBe(2);
//   expect(d1Result.source).toBe('d1');
//
//   //if we request it again, it should be cached in memory
//   //TODO need to be able to pass in ctx so that we can setup d1 and kv
//   const inMemoryCacheResult = await getRecords(ctx, 'users', undefined, urlKey);
//
//   expect(inMemoryCacheResult.data.length).toBe(2);
//   expect(inMemoryCacheResult.source).toBe('cache');
//
//   //kill cache to simulate end user requesting kv cache data from another server node
//   clearInMemoryCache();
//
//   // if we request it again, it should also be cached in kv storage
//   const kvResult = await getRecords(ctx, 'users', undefined, urlKey);
//   expect(kvResult.data.length).toBe(2);
//   expect(kvResult.source).toBe('kv');
// });

it('update should return updated id', async () => {
  //start with a clear cache
  // await clearInMemoryCache();
  // await clearKVCache(KVDATA);
  //
  // const urlKey = 'http://localhost:8888/some-cache-key-url';
  //
  // const db = createTestTable();
  //
  // const rec1 = await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
  //   firstName: 'John',
  //   id: '1'
  // });
  //
  // const updatedRecord = await updateD1Data(__D1_BETA__D1DATA, 'users', {
  //   id: '1',
  //   data: {
  //     firstName: 'Jack'
  //   }
  // });
  //
  // expect(updatedRecord.id).toBe('1');
});

it('getRecords can accept custom function for retrieval of data', async () => {
  //start with a clear cache
  await clearInMemoryCache();
  await clearKVCache(KVDATA);

  const urlKey = 'http://localhost:8888/some-cache-key-url';

  const db = createTestTable();

  const rec1 = await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
    firstName: 'John',
    id: '1'
  });

  const func = function () {
    return { foo: 'bar' };
  };

  const result = await getRecords(
    ctx,
    'users',
    undefined,
    urlKey,
    'fastest',
    func
  );

  expect(result.data.foo).toBe('bar');
});

// it('getRecords should return single record if if passed in', async () => {
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
//     id: 'abc'
//   });
//
//   const result = await getRecords(
//     ctx,
//     'users',
//     { id: 'abc' },
//     urlKey,
//     'fastest',
//     undefined
//   );
//
//   expect(result.data.firstName).toBe('John');
//   expect(result.total).toBe(1);
//   expect(result.source).toBe('d1');
//
//   //if we get again it should be cached
//   const cachedResult = await getRecords(
//     ctx,
//     'users',
//     { id: 'abc' },
//     urlKey,
//     'fastest',
//     undefined
//   );
//
//   expect(cachedResult.data.firstName).toBe('John');
//   expect(cachedResult.total).toBe(1);
//   expect(cachedResult.source).toBe('cache');
// });

function createTestTable() {
  const db = drizzle(__D1_BETA__D1DATA);

  db.run(sql`
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

  return db;
}

async function createCategoriesTestTable() {
  const db = drizzle(ctx.env.D1DATA);
  console.log('creating categories table start');
  const result = await db.run(sql`
    CREATE TABLE "categories" (
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
