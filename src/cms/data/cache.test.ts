import { insertD1Data, updateD1Data } from "./d1-data";
import { usersTable } from "../../db/schema";
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { deleteRecord, getRecords, insertRecord, updateRecord } from "./data";
import {
  clearInMemoryCache,
  isCacheValid,
  setCacheStatus,
  setCacheStatusInvalid,
} from "./cache";
import { clearKVCache, getKVCache, getRecordFromKvCache } from "./kv-data";

describe("cache expiration", () => {
  it("cache status should return false if never set", async () => {
    const cacheStatus = await isCacheValid();
    expect(cacheStatus).toBeFalsy();
  });

  it("cache status should return true", async () => {
    const result = await setCacheStatus(1000);
    const cacheStatus = await isCacheValid();
    expect(cacheStatus).toBeTruthy();
  });

  it("cache status should return false if expired", async () => {
    const result = await setCacheStatus(-1000);
    const cacheStatus = await isCacheValid();
    expect(cacheStatus).toBeFalsy();
  });

  it("cache status should return false if explicity set to invalid", async () => {
    const result = await setCacheStatusInvalid();
    const cacheStatus = await isCacheValid();
    expect(cacheStatus).toBeFalsy();
  });

  it("cache status should return false if explicity set to invalid after previously being valid", async () => {
    const result = await setCacheStatus(1000);
    const cacheStatus = await isCacheValid();
    expect(cacheStatus).toBeTruthy();

    const result2 = await setCacheStatusInvalid();
    const cacheStatus2 = await isCacheValid();
    expect(cacheStatus2).toBeFalsy();
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

    const d1Result = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
      "users",
      undefined,
      urlKey
    );

    console.log("d1Result", d1Result);

    expect(d1Result.data.length).toBe(2);
    expect(d1Result.source).toBe("d1");

    //if we request it again, it should be cached in memory
    const inMemoryCacheResult = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
      "users",
      undefined,
      urlKey
    );

    expect(inMemoryCacheResult.data.length).toBe(2);
    expect(inMemoryCacheResult.source).toBe("cache");

    // let's insert another records
    const rec3 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "Steve",
      },
    });

    //cache status should not be valid
    const cacheStatus = await isCacheValid();
    expect(cacheStatus).toBeFalsy();

    //kv cache for the urlKey should be empty
    const allCacheItems = await getRecordFromKvCache(
      KVDATA,
      `cache::${urlKey}`
    );
    expect(allCacheItems).toBeFalsy;

    // we inserted another record, it should be returned because the insert should invalidate cache
    // this will only work instantly on the node that the update is made and will be eventually consistent on other nodes
    // based on the in-memory cache settings
    const resultAfterInsert = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
      "users",
      undefined,
      urlKey
    );

    expect(resultAfterInsert.data.length).toBe(3);
    expect(resultAfterInsert.source).toBe("d1");
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

    const d1Result = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
      "users",
      undefined,
      urlKey
    );

    console.log("d1Result", d1Result);

    expect(d1Result.data.length).toBe(2);
    expect(d1Result.source).toBe("d1");

    //if we request it again, it should be cached in memory
    const inMemoryCacheResult = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
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

    //cache status should not be valid
    const cacheStatus = await isCacheValid();
    expect(cacheStatus).toBeFalsy();

    //kv cache for the urlKey should be empty
    const allCacheItems = await getRecordFromKvCache(
      KVDATA,
      `cache::${urlKey}`
    );
    expect(allCacheItems).toBeFalsy;

    // we inserted another record, it should be returned because the insert should invalidate cache
    // this will only work instantly on the node that the update is made and will be eventually consistent on other nodes
    // based on the in-memory cache settings
    const resultAfterUpdate = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
      "users",
      undefined,
      urlKey
    );

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

    const d1Result = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
      "users",
      undefined,
      urlKey
    );

    console.log("d1Result", d1Result);

    expect(d1Result.data.length).toBe(2);
    expect(d1Result.source).toBe("d1");

    //if we request it again, it should be cached in memory
    const inMemoryCacheResult = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
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

    //cache status should not be valid
    const cacheStatus = await isCacheValid();
    expect(cacheStatus).toBeFalsy();

    //kv cache for the urlKey should be empty
    const allCacheItems = await getRecordFromKvCache(
      KVDATA,
      `cache::${urlKey}`
    );
    expect(allCacheItems).toBeFalsy;

    // we inserted another record, it should be returned because the insert should invalidate cache
    // this will only work instantly on the node that the update is made and will be eventually consistent on other nodes
    // based on the in-memory cache settings
    const resultAfterUpdate = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
      "users",
      undefined,
      urlKey
    );

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
