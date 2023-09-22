import {
  generateSelectSql,
  getByTable,
  getD1DataByTable,
  insertD1Data,
  updateD1Data,
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
it("get should return results", async () => {
  const db = createTestTable();

  await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
    firstName: "John",
    id: "1",
  });
  await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
    firstName: "Jane",
    id: "2",
  });

  const d1Result = await getD1DataByTable(
    __D1_BETA__D1DATA,
    "users",
    undefined
  );

  expect(d1Result.data.length).toBe(2);
  expect(d1Result.source).toBe("d1");
});

it("put should update record", async () => {
  const db = createTestTable();

  await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
    firstName: "John",
    id: "a",
  });
  await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
    firstName: "Jane",
    id: "b",
  });

  updateD1Data(__D1_BETA__D1DATA, "users", {
    data: { firstName: "Steve" },
    id: "b",
  });

  const d1Result = await getD1DataByTable(
    __D1_BETA__D1DATA,
    "users",
    undefined
  );

  expect(d1Result.data.length).toBe(2);
  expect(d1Result.data[1].firstName).toBe("Steve");
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
