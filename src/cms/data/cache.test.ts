import { insertD1Data, updateD1Data } from "./d1-data";
import { usersTable } from "../../db/schema";
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { deleteRecord, getRecords, insertRecord, updateRecord } from "./data";
import {
  clearInMemoryCache,
  getAllCacheItemsFromInMemoryCache,
  getAllFromInMemoryCache,
  isCacheValid,
  rehydrateCacheFromKVKeys,
  setCacheStatus,
  setCacheStatusInvalid,
} from "./cache";
import {
  addToKvCache,
  addToKvKeys,
  clearKVCache,
  getKVCache,
  getRecordFromKvCache,
} from "./kv-data";
import app from "../../server";

const ctx = { env: { KVDATA: env.KVDATA, D1DATA: env.__D1_BETA__D1DATA } };

describe("cache hydration", () => {
  it("cache should hydrate based on KV keys", async () => {
    await addToKvCache({}, env.KVDATA, "http://some-url-1", {
      data: {
        foo: "bar",
      },
    });
    await addToKvCache({}, env.KVDATA, "http://some-url-2", {
      data: {
        foo: "bear",
      },
    });

    await rehydrateCacheFromKVKeys(ctx);

    const cache = await getAllCacheItemsFromInMemoryCache();
    expect(cache.data.length).toBe(2);
    expect(cache.source).toBe("cache");
  });
  it("cache should hydrate based on KV keys from prior api calls", async () => {
    //start with a clear cache
    await clearInMemoryCache();
    await clearKVCache(KVDATA);

    const urlKey1 = "http://localhost/v1/users?limit=1";
    const urlKey2 = "http://localhost/v1/users?limit=2";
    const urlKey3 = "http://localhost/v1/users?limit=3";

    const db = createTestTable();

    await insertTestUserRecord("Abe");
    await insertTestUserRecord("Bob");
    await insertTestUserRecord("Cat");

    let req = new Request(urlKey1, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(1);

    // const d1Result = await getRecords(ctx, "users", undefined, urlKey1);

    // await addToKvCache(ctx, ctx.env.KVDATA, cacheKey, {
    //   data: [{ some: "data" }],
    //   source: "kv",
    //   total: 1,
    // });

    await rehydrateCacheFromKVKeys(ctx);

    const cache = await getAllFromInMemoryCache();
    expect(cache.data.length).toBe(2);
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

    // let's update a record
    let recordToUpdate = d1Result.data[1];
    const rec3 = await updateRecord(__D1_BETA__D1DATA, KVDATA, {
      id: recordToUpdate.id,
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
    const resultAfterUpdate = await getRecords(ctx, "users", undefined, urlKey);

    expect(resultAfterUpdate.data.length).toBe(2);
    expect(resultAfterUpdate.source).toBe("d1");
    expect(resultAfterUpdate.data[1].firstName).toBe("Steve");
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

function insertTestUserRecord(firstName) {
  return insertRecord(__D1_BETA__D1DATA, KVDATA, {
    table: "users",
    data: {
      firstName,
    },
  });
}
