import app from "../../server";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { insertD1Data } from "../data/d1-data";
import { getRecords, insertRecord } from "../data/data";
import { clearInMemoryCache } from "../data/cache";
import { clearKVCache } from "../data/kv-data";

const env = getMiniflareBindings();
const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };

describe("Test admin front end", () => {
  it("ping should return 200", async () => {
    const res = await app.request("http://localhost/admin/ping");
    expect(res.status).toBe(200);
  });
});

// describe("Test admin api", () => {
//   it("admin api should return 200", async () => {
//     createCategoriesTestTable();
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
//       firstName: "John",
//       id: "a",
//     });
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
//       firstName: "Jane",
//       id: "b",
//     });

//     let req = new Request("http://localhost/admin/api/users?limit=1&offset=1", {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     });
//     let res = await app.fetch(req, env);
//     expect(res.status).toBe(200);
//     let body = await res.json();
//     expect(body.data.length).toBe(1);
//   });

//   it("in memory admin api should return 200", async () => {
//     //start with a clear cache
//     await clearInMemoryCache();
//     await clearKVCache(KVDATA);
//     createCategoriesTestTable();
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
//       firstName: "John",
//       id: "a",
//     });
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
//       firstName: "Jane",
//       id: "b",
//     });

//     //this should add to cache
//     const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };
//     const d1Result = await getRecords(ctx, "users", undefined, "/some-key");

//     let req = new Request("http://localhost/admin/api/in-memory-cache", {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     });
//     let res = await app.fetch(req, env);
//     expect(res.status).toBe(200);
//     let body = await res.json();
//     expect(body.data.length).toBe(1);
//     expect(body.data[0].key).toBe("cache::/some-key");
//   });

//   it("kv admin api should return 200", async () => {
//     //start with a clear cache
//     await clearInMemoryCache();
//     await clearKVCache(KVDATA);
//     createCategoriesTestTable();
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
//       firstName: "John",
//       id: "a",
//     });
//     await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
//       firstName: "Jane",
//       id: "b",
//     });

//     // this should add to cache
//     const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };

//     const d1Result = await getRecords(ctx, "users", undefined, "/some-key");

//     let req = new Request("http://localhost/admin/api/kv-cache", {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     });
//     let res = await app.fetch(req, env);
//     expect(res.status).toBe(200);
//     let body = await res.json();
//     expect(body.data.length).toBe(1);
//     expect(body.data[0].key).toBe("cache::/some-key");
//     expect(body.data[0].createdOn.length).toBeGreaterThan(0);
//   });
// });

it("keys admin api should return 200", async () => {
  //start with a clear cache
  await clearInMemoryCache();
  await clearKVCache(ctx.env.KVDATA);
  createCategoriesTestTable();
  const newRecord = await insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, {
    table: 'categories',
    data: {
      title: 'cat 1'
    }
  });
  const newRecord2 = await insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, {
    table: 'categories',
    data: {
      title: 'cat 1'
    }
  });

  // this should add to cache
  const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };

  const d1Result = await getRecords(ctx, "users", undefined, "/some-key");

  let req = new Request("http://localhost/admin/api/keys-cache", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  let res = await app.fetch(req, env);
  expect(res.status).toBe(200);
  let body = await res.json();
  expect(body.data.length).toBe(1);
  expect(body.data[0].key).toBe("cache::/some-key");
  expect(body.data[0].createdOn.length).toBeGreaterThan(0);
});

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
