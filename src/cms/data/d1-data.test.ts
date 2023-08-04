import { generateSelectSql, getByTable, insertData, whereClauseBuilder } from "./d1-data";
import qs from "qs";
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from 'drizzle-orm' 
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
  // console.log('env ==>', env)
  // console.log('D1DATA', __D1_BETA__D1DATA);
  const db = drizzle(__D1_BETA__D1DATA);

  const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
    json: blob('json', { mode: 'json' }).$type<string[]>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`strftime('%s', 'now')`),
  });

  db.run(sql`
		create table ${users} (
			id integer primary key,
			name text not null,
			verified integer not null default 0,
			json blob,
			created_at integer not null default (strftime('%s', 'now'))
		)
	`);

//   const insertResult = await db.insert(users).values({ id:1, name: 'Andrew' }).run();
// console.log('insertResult', insertResult)

  //create a table
  // await db.run(sql`CREATE TABLE users (
  //   id text PRIMARY KEY NOT NULL,
  //   firstName text,
  //   lastName text,
  //   email text,
  //   password text,
  //   role text,
  //   created_on integer,
  //   updated_on integer
  // );`)

  insertData(__D1_BETA__D1DATA, "users", { name: "a", id: '1234ad' });

  // const { results } = await db
  // .prepare(`SELECT * FROM users;`)
  // .all();

  const results = await db.select().from(users).all();

  const results2 = await getByTable(__D1_BETA__D1DATA, "users", undefined);

  // let results = await db.run(sql`SELECT * FROM users`);

  console.log('results-->', results);
  console.log('results2-->', results2);

});
