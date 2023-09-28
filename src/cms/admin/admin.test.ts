import app from "../../server";
import { usersTable } from "../../db/schema";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { insertD1Data } from "../data/d1-data";
import { getRecords, insertRecord } from "../data/data";

const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();

describe("Test admin front end", () => {
  it("ping should return 200", async () => {
    const res = await app.request("http://localhost/admin/ping");
    expect(res.status).toBe(200);
  });

});

describe("Test admin api", () => {
  it("ping should return 200", async () => {
    createTestTable();
    await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
      firstName: "John",
      id: "a",
    });
    await insertD1Data(__D1_BETA__D1DATA, KVDATA, "users", {
      firstName: "Jane",
      id: "b",
    });

    let req = new Request("http://localhost/admin/api/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(2);
  });

});






function createTestTable() {
  const db = drizzle(__D1_BETA__D1DATA);
  console.log("creating test table");
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
