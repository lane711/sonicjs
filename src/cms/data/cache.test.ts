import { insertD1Data } from "./d1-data";
import { usersTable } from "../../db/schema";
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getRecords } from "./data";
import { clearInMemoryCache, isCacheValid, setCacheStatus } from "./cache";
import { clearKVCache } from "./kv-data";

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
});

describe("cache invalidation", () => {
  it("cache should update after insert", async () => {
    //start with a clear cache
    await clearInMemoryCache();
    await clearKVCache(KVDATA);

    const urlKey = "http://localhost:8888/some-cache-key-url";

    const db = createTestTable();

    const rec1 = await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
      firstName: "John",
      id: "1",
    });
    console.log("rec1", rec1);

    const rec2 = await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
      firstName: "Jane",
      id: "2",
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
    //TODO need to be able to pass in ctx so that we can setup d1 and kv
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
    const rec3 = await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
      firstName: "Steve",
      id: "3",
    });

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

    //cache status should not be valid
    // const cacheStatus = await isCacheValid();
    // expect(cacheStatus).toBeTruthy();

    // expect(resultAfterInsert.data.length).toBe(3);
    // expect(resultAfterInsert.source).toBe("d1");
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
      created_on integer,
      updated_on integer
    );
	`);

  return db;
}
