import { insertD1Data, updateD1Data } from "./d1-data";
import { usersTable } from "../../db/schema";
import * as schema from "../../db/schema";

import qs from "qs";
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getRecord, getRecords, insertRecord } from "./data";
import { clearInMemoryCache } from "./cache";
import { clearKVCache } from "./kv-data";

it("insert should allow refer", async () => {
  const urlKey = "http://localhost:8888/some-cache-key-url";

  const db = createTestTable();
  const { userRecord, categoryRecord, postRecord } =
    await createRelatedTestRecords();

  const d1Result = await getRecords(
    env.__D1_BETA__D1DATA,
    env.KVDATA,
    "posts",
    undefined,
    urlKey
  );

  //record should be in list
  expect(d1Result.data.length).toBe(1);
  expect(d1Result.source).toBe("d1");
  expect(d1Result.data[0].categoryId).toBe(categoryRecord.data.id);
  expect(d1Result.data[0].userId).toBe(userRecord.data.id);
});

it("get related data", async () => {
  const urlKey = "http://localhost:8888/some-cache-key-url";

  createTestTable();
  const { userRecord, categoryRecord, postRecord } =
    await createRelatedTestRecords();


      const db = drizzle(__D1_BETA__D1DATA, { schema });

  const user = await db.query.usersTable.findMany({
    with: {
      posts: true,
    },
  });


  //record should be in list
  expect(user.length).toBe(1);
  expect(user[0].posts.length).toBe(2);
  expect(user[0].posts[0].userId).toBe(user[0].id);

});

async function createRelatedTestRecords() {
  const userRecord = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
    table: "users",
    data: {
      firstName: "John",
    },
  });

  const categoryRecord = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
    table: "categories",
    data: {
      title: "Category One",
    },
  });

  const postRecord = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
    table: "posts",
    data: {
      title: "Post One",
      userId: userRecord.data.id,
      categoryId: categoryRecord.data.id,
    },
  });

  const postRecord2 = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
    table: "posts",
    data: {
      title: "Post Two",
      userId: userRecord.data.id,
      categoryId: categoryRecord.data.id,
    },
  });

  return { userRecord, categoryRecord, postRecord };
}

function createTestTable() {
  const db = drizzle(__D1_BETA__D1DATA);

  db.run(sql`
  CREATE TABLE "categories" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text,
    "body" text,
    "createdOn" integer,
    "updatedOn" integer
  )`);

  db.run(sql`
  CREATE TABLE "users" (
    "id" text PRIMARY KEY NOT NULL,
    "firstName" text,
    "lastName" text,
    "email" text,
    "password" text,
    "role" text,
    "createdOn" integer,
    "updatedOn" integer
  );
  )`);

  db.run(sql`
  CREATE TABLE "comments" (
    "id" text PRIMARY KEY NOT NULL,
    "body" text,
    "userId" text,
    "postId" integer,
    "createdOn" integer,
    "updatedOn" integer
  );
  )`);

  db.run(sql`
  CREATE TABLE "posts" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text,
    "body" text,
    "userId" text,
    "categoryId" text,
    "createdOn" integer,
    "updatedOn" integer
  );
  )`);

  db.run(sql`
  CREATE INDEX "user_idx" ON "comments" ("id");)`);

  db.run(sql`
  CREATE INDEX "post_idx" ON "comments" ("id");)`);

  return db;
}

