import { insertD1Data, updateD1Data } from "./d1-data";
import { usersTable } from "../../db/schema";
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  deleteRecord,
  getRecords,
  getRecordsByUrl,
  insertRecord,
  updateRecord,
} from "./data";
import {
  addToInMemoryCache,
  clearInMemoryCache,
  getAllCacheItemsFromInMemoryCache,
  getAllFromInMemoryCache,
  getFromInMemoryCache,
  isCacheValid,
  rehydrateCacheFromKVKeys,
  setCacheStatus,
  setCacheStatusInvalid,
} from "./cache";
import {
  addCachePrefix,
  addToKvCache,
  addToKvKeys,
  clearKVCache,
  getKVCache,
  getRecordFromKvCache,
} from "./kv-data";
import app from "../../server";
import { sleep } from "../util/helpers";

const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };

describe("cache in/out", () => {
  it("cache in/out", async () => {
    await addToInMemoryCache(ctx, "key1", { key: 1 });
    await addToInMemoryCache(ctx, "key2", { key: 2 });

    const cache = await getAllCacheItemsFromInMemoryCache();
    expect(cache.data.length).toBe(2);
    expect(cache.source).toBe("cache");

    const key1 = await getFromInMemoryCache(ctx, "key1");
    const key2 = await getFromInMemoryCache(ctx, "key2");

    expect(key1[0].data.key).toBe(1);
    expect(key2[0].data.key).toBe(2);
  });
});

describe("cache hydration", () => {
  it("rehydrateCacheFromKVKeys should hydrate based on KV keys", async () => {
    await addToKvCache(ctx, "http://some-url-1", { foo: "bar" });
    await addToKvCache(ctx, "http://some-url-2", { foo: "bear" });

    await addToKvKeys(ctx, "http://some-url-1");
    await addToKvKeys(ctx, "http://some-url-2");

    await rehydrateCacheFromKVKeys(ctx);

    const cache = await getAllCacheItemsFromInMemoryCache();
    expect(cache.data.length).toBe(2);
    expect(cache.source).toBe("cache");
  });
});

describe("full cache hydration via api", () => {
  it("cache should hydrate based on KV keys from prior api calls", async () => {
    const db = createTestTable();

    //start with a clear cache
    await clearInMemoryCache();
    await clearKVCache(KVDATA);

    const urlKey1 = "http://localhost/v1/users?limit=1";
    const urlKey2 = "http://localhost/v1/users?limit=2";
    const urlKey3 = "http://localhost/v1/users?limit=3";

    await insertTestUserRecord("a", "Abe");
    await insertTestUserRecord("b", "Bob");
    await insertTestUserRecord("c", "Cat");

    let req = new Request(urlKey1, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(1);

    const cache = await getAllCacheItemsFromInMemoryCache();
    expect(cache.data.length).toBe(1);
    expect(cache.data[0].data.data[0].firstName).toBe("Abe");

    //now hit another api and we should have 2 entries
    let req2 = new Request(urlKey2, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let res2 = await app.fetch(req2, env);
    expect(res2.status).toBe(200);
    let body2 = await res2.json();
    expect(body2.data.length).toBe(2);

    const cache2 = await getAllCacheItemsFromInMemoryCache();
    expect(cache2.data.length).toBe(2);
    expect(cache2.data[0].data.data[0].firstName).toBe("Abe");
    expect(cache2.data[1].data.data[0].firstName).toBe("Abe");
    expect(cache2.data[1].data.data[1].firstName).toBe("Bob");

    //now update name and retry get
    let payload = JSON.stringify({ data: { firstName: "Abe2" }, id: "a" });
    let req3 = new Request(`http://localhost/v1/users/a`, {
      method: "PUT",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });
    let res3 = await app.fetch(req3, env);
    expect(res3.status).toBe(200);
    let body3 = await res3.json();

    //retry get
    let req4 = new Request(urlKey1, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let res4 = await app.fetch(req4, env);
    expect(res4.status).toBe(200);
    let body4 = await res4.json();
    expect(body4.data.length).toBe(1);
    expect(body4.data[0].firstName).toBe("Abe2");

    const cache4 = await getAllCacheItemsFromInMemoryCache();
    expect(cache4.data.length).toBe(2);
    expect(cache4.data.source).toBe("cache");
    expect(cache4.data[0].data.data[0].firstName).toBe("Abe2");
  });
});
describe("insert", () => {
  it("cache should update after insert", async () => {
    //start with a clear cache
    await clearInMemoryCache();
    await clearKVCache(KVDATA);

    const urlKey = "http://localhost:8888/some-cache-key-url";

    const db = createTestTable();

    const rec1 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "John",
      },
    });
    console.log("rec1", rec1);

    const rec2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "Jane",
      },
    });
    console.log("rec2", rec2);

    const d1Result = await getRecords(ctx, "users", undefined, urlKey);

    console.log("d1Result", d1Result);

    expect(d1Result.data.length).toBe(2);
    expect(d1Result.source).toBe("d1");

    //if we request it again, it should be cached in memory
    const inMemoryCacheResult = await getRecords(
      ctx,
      "users",
      undefined,
      urlKey
    );

    expect(inMemoryCacheResult.data.length).toBe(2);
    expect(inMemoryCacheResult.source).toBe("cache");

    // if we clear memory cache, we should get kv cache
    await clearInMemoryCache();
    const kvResult = await getRecords(ctx, "users", undefined, urlKey);

    expect(kvResult.data.length).toBe(2);
    expect(kvResult.source).toBe("kv");

    // let's insert another records
    const rec3 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "Steve",
      },
    });

    //kv cache for the urlKey should be empty
    const allCacheItems = await getRecordFromKvCache(
      KVDATA,
      `cache::${urlKey}`
    );
    expect(allCacheItems).toBeFalsy;

    // we inserted another record, it should be returned because the insert should invalidate cache
    // this will only work instantly on the node that the update is made and will be eventually consistent on other nodes
    // based on the in-memory cache settings
    const resultAfterInsert = await getRecords(ctx, "users", undefined, urlKey);

    expect(resultAfterInsert.data.length).toBe(3);
    expect(resultAfterInsert.source).toBe("d1");

    //new record should now be in the cache since this is the second time we're requesting it
    const resultAfterGet = await getRecords(ctx, "users", undefined, urlKey);

    expect(resultAfterGet.data.length).toBe(3);
    expect(resultAfterGet.source).toBe("cache");
  });
});

describe("update", () => {
  it("cache should update after update", async () => {
    //start with a clear cache
    await clearInMemoryCache();
    await clearKVCache(KVDATA);

    const urlKey = "http://localhost/v1/users?limit=10&offset=0";

    const db = createTestTable();

    const rec1 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "John",
      },
    });
    console.log("rec1", rec1);

    const rec2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "Jane",
      },
    });
    console.log("rec2", rec2);

    const d1Result = await getRecordsByUrl(ctx, urlKey);

    console.log("d1Result", d1Result);

    expect(d1Result.data.length).toBe(2);
    expect(d1Result.source).toBe("d1");

    //if we request it again, it should be cached in memory
    const inMemoryCacheResult = await getRecordsByUrl(ctx, urlKey);

    expect(inMemoryCacheResult.data.length).toBe(2);
    expect(inMemoryCacheResult.source).toBe("cache");

    // let's update a record
    let recordToUpdate = d1Result.data[1];
    const rec3 = await updateRecord(ctx, __D1_BETA__D1DATA, KVDATA, {
      id: recordToUpdate.id,
      table: "users",
      data: {
        firstName: "Jane2",
      },
    });

    //kv cache for the urlKey should be empty
    const allCacheItems = await getRecordFromKvCache(
      KVDATA,
      `cache::${urlKey}`
    );
    expect(allCacheItems).toBeFalsy;

    //wait a moment and the kv should be repopulated
    sleep(1000);

    const allCacheItemsAfterDelay = await getRecordFromKvCache(
      KVDATA,
      `cache::${urlKey}`
    );
    expect(allCacheItemsAfterDelay).toBeTruthy;

    // we inserted another record, it should be returned because the insert should invalidate cache
    // this will only work instantly on the node that the update is made and will be eventually consistent on other nodes
    // based on the in-memory cache settings
    const cacheCheck = await getAllCacheItemsFromInMemoryCache();
    const resultAfterUpdate = await getRecordsByUrl(ctx, urlKey);

    expect(resultAfterUpdate.data.length).toBe(2);
    expect(resultAfterUpdate.source).toBe("cache");
    expect(resultAfterUpdate.data[1].firstName).toBe("Jane2");
  });
});

describe("delete", () => {
  it("cache should update after delete", async () => {
    //start with a clear cache
    await clearInMemoryCache();
    await clearKVCache(KVDATA);

    const urlKey = "http://localhost:8888/some-cache-key-url";

    const db = createTestTable();

    const rec1 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "John",
      },
    });
    console.log("rec1", rec1);

    const rec2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "Jane",
      },
    });
    console.log("rec2", rec2);

    const d1Result = await getRecords(ctx, "users", undefined, urlKey);

    console.log("d1Result", d1Result);

    expect(d1Result.data.length).toBe(2);
    expect(d1Result.source).toBe("d1");

    //if we request it again, it should be cached in memory
    const inMemoryCacheResult = await getRecords(
      ctx,
      "users",
      undefined,
      urlKey
    );

    expect(inMemoryCacheResult.data.length).toBe(2);
    expect(inMemoryCacheResult.source).toBe("cache");

    // let's delete a record
    let recordToDelete = d1Result.data[1];

    const rec3 = await deleteRecord(__D1_BETA__D1DATA, KVDATA, {
      firstName: "Steve",
      id: recordToDelete.id,
      table: "users",
    });

    //kv cache for the urlKey should be empty
    const allCacheItems = await getRecordFromKvCache(
      KVDATA,
      `cache::${urlKey}`
    );
    expect(allCacheItems).toBeFalsy;

    // we inserted another record, it should be returned because the insert should invalidate cache
    // this will only work instantly on the node that the update is made and will be eventually consistent on other nodes
    // based on the in-memory cache settings
    const resultAfterUpdate = await getRecords(ctx, "users", undefined, urlKey);

    expect(resultAfterUpdate.data.length).toBe(1);
    expect(resultAfterUpdate.source).toBe("d1");
  });
});

function createTestTable() {
  const db = drizzle(__D1_BETA__D1DATA);

  db.run(sql`
    CREATE TABLE ${usersTable} (
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

function insertTestUserRecord(id: string, firstName) {
  return insertRecord(__D1_BETA__D1DATA, KVDATA, {
    table: "users",
    data: {
      id,
      firstName,
    },
  });
}
