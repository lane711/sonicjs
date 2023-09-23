import { insertD1Data, updateD1Data } from "./d1-data";
import { usersTable } from "../../db/schema";
import qs from "qs";
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getRecord, getRecords, insertRecord } from "./data";
import { clearInMemoryCache } from "./cache";
import { clearKVCache } from "./kv-data";

it("insert should return new record with id and dates", async () => {
  const urlKey = "http://localhost:8888/some-cache-key-url";

  const db = createTestTable();
  const newRecord = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
    table: "users",
    data: {
      firstName: "John",
    },
  });
  console.log("newRecord", newRecord);

  await insertRecord(__D1_BETA__D1DATA, KVDATA, {
    table: "categories",
    data: {
      title: "Category One",
    },
  });

  const newRecord2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
    table: "users",
    data: {
      firstName: "Steve",
    },
  });
  console.log("newRecord2", newRecord2);

  const d1Result = await getRecords(
    env.__D1_BETA__D1DATA,
    env.KVDATA,
    "users",
    undefined,
    urlKey
  );

  //record should be in list
  expect(d1Result.data.length).toBe(2);
  expect(d1Result.source).toBe("d1");
  expect(d1Result.data[0].firstName).toBe("John");
});

function createTestTable() {
  const db = drizzle(__D1_BETA__D1DATA);

  db.run(sql`
  CREATE TABLE "categories" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text,
    "body" text,
    "created_on" integer,
    "updated_on" integer
  )`);

  db.run(sql`
  CREATE TABLE "users" (
    "id" text PRIMARY KEY NOT NULL,
    "firstName" text,
    "lastName" text,
    "email" text,
    "password" text,
    "role" text,
    "created_on" integer,
    "updated_on" integer
  );
  )`);

  db.run(sql`
  CREATE TABLE "comments" (
    "id" text PRIMARY KEY NOT NULL,
    "body" text,
    "user_id" text,
    "post_id" integer,
    "created_on" integer,
    "updated_on" integer
  );
  )`);

  db.run(sql`
  CREATE TABLE "posts" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text,
    "body" text,
    "user_id" text,
    "category_id" text,
    "created_on" integer,
    "updated_on" integer
  );
  )`);

  db.run(sql`
  CREATE INDEX "user_idx" ON "comments" ("id");--> statement-breakpoint
  )`);

  db.run(sql`
  CREATE INDEX "post_idx" ON "comments" ("id");
  )`);

  return db;
}
