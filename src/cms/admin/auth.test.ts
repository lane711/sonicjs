import { drizzle } from "drizzle-orm/d1";
import app from "../../server";
import { sql } from "drizzle-orm";
import { insertD1Data } from "../data/d1-data";

const env = getMiniflareBindings();
env.KVDATA = env.KVDATA;
env.D1DATA = env.__D1_BETA__D1DATA;

env.useAuth = true;

describe("admin should be restricted", () => {
  it("ping should return 200", async () => {
    const res = await app.request("http://localhost/admin/ping");
    expect(res.status).toBe(200);
  });

  it("user record", async () => {
    createTestTables();

    await insertD1Data(env.D1DATA, env.KVDATA, "users", {
      firstName: "John",
      id: "aaa",
      email: "a@a.com",
      password: "password",
      role: 'admin'
    });

    let req = new Request("http://localhost/v1/users/aaa", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let res = await app.fetch(req, env);
    expect(res.status).toBe(200);
  });
});

function createTestTables() {
  createTestTable1();
  createTestTable2();
  createTestTable3();
}

function createTestTable1() {
  const db = drizzle(env.D1DATA);
  console.log("creating test table start");
  db.run(sql`
      CREATE TABLE users (
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
  console.log("creating test table end");

  return db;
}

function createTestTable2() {
  const db = drizzle(env.D1DATA);
  console.log("creating test table start");
  db.run(sql`
    CREATE TABLE user_keys (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        hashed_password text,
        createdOn integer,
        updatedOn integer,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      );
      `);
  console.log("creating test table end");

  return db;
}

function createTestTable3() {
  const db = drizzle(env.D1DATA);
  console.log("creating test table start");
  db.run(sql`
    CREATE TABLE user_sessions (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        active_expires integer NOT NULL,
        idle_expires integer NOT NULL,
        createdOn integer,
        updatedOn integer,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      );
      `);
  console.log("creating test table end");

  return db;
}
