import {
  generateSelectSql,
  getByTable,
  insertData,
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

it("should return a where clause with eq", () => {
  const queryParams = "someurl?filters[id][eq]=100";
  const params = qs.parse(queryParams);
  const clause = whereClauseBuilder(params);
  expect(clause).toBe("where id = 100");
});

it("should return a where clause with multi in", () => {
  const queryParams = "someurl?filters[id][$in][0]=100&filters[id][$in][1]=101";
  const params = qs.parse(queryParams);
  const clause = whereClauseBuilder(params);
  expect(clause).toBe("");
});

it("should return a SQL select", () => {
  const queryParams = "someurl?limit=2";
  const params = qs.parse(queryParams);
  console.log("params ---->", params);
  const clause = generateSelectSql("my-table", params);
  expect(clause).toBe("SELECT * FROM my-table limit 2'");
});

it("CRUD", async () => {

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


  await insertData(__D1_BETA__D1DATA, "users", { firstName: "John", id: "1" });
  await insertData(__D1_BETA__D1DATA, "users", { firstName: "Jane", id: "2" });

  const firstResult = await getByTable(__D1_BETA__D1DATA, "users", undefined, 'some-cache-key-url');

  expect(firstResult.data.length).toBe(2);
  expect(firstResult.source).toBe('d1');
  // console.log("firstResult-->", firstResult.source, firstResult.data);

  //if we get it again, it should be cached

  const secondResult = await getByTable(__D1_BETA__D1DATA, "users", undefined, 'some-cache-key-url');
  expect(secondResult.data.length).toBe(2);
  expect(secondResult.source).toBe('cache');
  // console.log("secondResult-->", secondResult.source, secondResult.data);

  // let results = await db.run(sql`SELECT * FROM users`);

});
