import app from "../../server";
import { usersTable } from "../../db/schema";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { insertD1Data } from "../data/d1-data";
import { getRecords, insertRecord } from "../data/data";

const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();

describe("Test the application", () => {
  it("ping should return 200", async () => {
    const res = await app.request("http://localhost/v1/ping");
    expect(res.status).toBe(200);
  });

  it("kvtest should return 200", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/cache/kv"),
      env
    );
    expect(res.status).toBe(200);
  });

  it("forms should return 200", async () => {
    const res = await app.request("http://localhost/v1/forms");
    expect(res.status).toBe(200);
  });
});

describe("auto endpoints", () => {
  createTestTable();

  it("get should return results and 200", async () => {
    await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "John",
      },
    });

    await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      table: "users",
      data: {
        firstName: "Jack",
      },
    });

    let req = new Request("http://localhost/v1/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    let body = await res.json();
    expect(body.data.length).toBe(2);
  });

  it("post (insert) should return 204", async () => {
    let payload = JSON.stringify({ data: { firstName: "Joe" } });
    let req = new Request("http://localhost/v1/users", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });
    let res = await app.fetch(req, env);
    expect(res.status).toBe(201);
    let body = await res.json();
    expect(body.firstName).toBe("Joe");
    expect(body.id.length).toBeGreaterThan(1);
  });

  it("put should return 200 and return id", async () => {
    //create test record to update
    const testRecordToUpdate = await insertD1Data(
      __D1_BETA__D1DATA,
      KVDATA,
      "users",
      {
        firstName: "John",
        id: "a",
      }
    );

    let payload = JSON.stringify({ data: { firstName: "Steve" }, id: "a" });
    let req = new Request(`http://localhost/v1/users/a`, {
      method: "PUT",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });
    let res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    let body = await res.json();
    // expect(body.id.length).toBeGreaterThan(1);

    //make sure db was updated
    const d1Result = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
      "users",
      undefined,
      "urlKey"
    );

    expect(d1Result.data[0].id).toBe("a");
    expect(d1Result.data[0].firstName).toBe("Steve");
  });

  it("delete should return 200", async () => {
    //create test record to update

    const testRecordToUpdate = await insertRecord(__D1_BETA__D1DATA, KVDATA, {
      data: {
        firstName: "John",
      },
      table: 'users'
    });

    let req = new Request(
      `http://localhost/v1/users/${testRecordToUpdate.data.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    let res = await app.fetch(req, env);
    expect(res.status).toBe(204);

    //make sure db was updated
    const d1Result = await getRecords(
      env.__D1_BETA__D1DATA,
      env.KVDATA,
      "users",
      undefined,
      "urlKey"
    );

    expect(d1Result.data.length).toBe(0);
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
