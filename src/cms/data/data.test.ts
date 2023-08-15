import { insertD1Data } from "./d1-data";
import { usersTable } from "../../db/schema";
import qs from "qs";
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getData, insertRecord } from "./data";
import { clearInMemoryCache } from "./cache";

it("Insert Data", async () => {
  const urlKey = "http://localhost:8888/some-cache-key-url";

  const db = createTestTable();
  const newRecord = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
    firstName: "John",
    id: "1",
    table: "users",
  });
  console.log('newRecord', newRecord);

  const d1Result = await getData(
    env.__D1_BETA__D1DATA,
    env.KVDATA,
    "users",
    undefined,
    urlKey
  );

  //record should be in list
  expect(d1Result.data.length).toBe(1);
  expect(d1Result.source).toBe("d1");

  //should be able to lookup new record 
});

it("CRUD", async () => {
  const urlKey = "http://localhost:8888/some-cache-key-url";

  const db = createTestTable();

  await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
    firstName: "John",
    id: "1",
  });
  await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
    firstName: "Jane",
    id: "2",
  });

  const d1Result = await getData(
    env.__D1_BETA__D1DATA,
    env.KVDATA,
    "users",
    undefined,
    urlKey
  );

  expect(d1Result.data.length).toBe(2);
  expect(d1Result.source).toBe("d1");

  //if we request it again, it should be cached in memory
  //TODO need to be able to pass in ctx so that we can setup d1 and kv
  const inMemoryCacheResult = await getData(
    env.__D1_BETA__D1DATA,
    env.KVDATA,
    "users",
    undefined,
    urlKey
  );

  expect(inMemoryCacheResult.data.length).toBe(2);
  expect(inMemoryCacheResult.source).toBe("cache");

  //kill cache to simulate end user requesting kv cache data from another server node
  clearInMemoryCache();

  // if we request it again, it should also be cached in kv storage
  const kvResult = await getData(
    env.__D1_BETA__D1DATA,
    env.KVDATA,
    "users",
    undefined,
    urlKey
  );
  expect(kvResult.data.length).toBe(2);
  expect(kvResult.source).toBe("kv");
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
