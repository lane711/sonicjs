import {
  generateSelectSql,
  getByTable,
  getD1DataByTable,
  insertD1Data,
  whereClauseBuilder,
} from "./d1-data";
import { usersTable } from "../../db/schema";
import qs from "qs";
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

it("should not return a where clause", () => {
  const params = {};
  const clause = whereClauseBuilder(params);
  expect(clause).toBe("");
});

//TODO: support id equals 100
// it("should return a where clause with eq", () => {
//   const queryParams = "someurl?filters[id][eq]=100";
//   const params = qs.parse(queryParams);
//   const clause = whereClauseBuilder(params);
//   expect(clause).toBe("where id = 100");
// });

//TODO: support "in" clause
// it("should return a where clause with multi in", () => {
//   const queryParams = "someurl?filters[id][$in][0]=100&filters[id][$in][1]=101";
//   const params = qs.parse(queryParams);
//   const clause = whereClauseBuilder(params);
//   expect(clause).toBe("");
// });

it("should return a SQL select", () => {
  const queryParams = "limit=2";
  const params = qs.parse(queryParams);
  console.log("params ---->", params);
  const clause = generateSelectSql("my-table", params);
  expect(clause).toBe("SELECT * FROM my-table limit 2;");
});

//TODO: rework to hit the full api
it.skip("CRUD", async () => {
  const db = createTestTable();

  await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", { firstName: "John", id: "1" });
  await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", { firstName: "Jane", id: "2" });

  const d1Result = await getByTable(
    __D1_BETA__D1DATA,
    KVDATA,
    "users",
    undefined,
    "some-cache-key-url"
  );

  expect(d1Result.data.length).toBe(2);
  expect(d1Result.source).toBe("d1");

  //if we request it again, it should be cached in memory
  //TODO need to be able to pass in ctx so that we can setup d1 and kv
  const inMemoryCacheResult = await getByTable(
    __D1_BETA__D1DATA,
    "users",
    undefined,
    "some-cache-key-url"
  );
  expect(inMemoryCacheResult.data.length).toBe(2);
  expect(inMemoryCacheResult.source).toBe("cache");

  // if we request it again, it should also be cached in kv storage
  const kvResult = await getByTable(
    __D1_BETA__D1DATA,
    "users",
    undefined,
    "some-cache-key-url"
  );
  expect(kvResult.data.length).toBe(2);
  expect(kvResult.source).toBe("cache");

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
