import app from '../server';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import { getRecords, insertRecord } from '../cms/data/data';
import { migrateData } from './migrate-data';

const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();

const toJson = function (json) {
  return json;
};

const ctx = {
  env: { KVDATA: KVDATA, D1DATA: __D1_BETA__D1DATA },
  json: toJson,
  user: { id: 'fromtest' },
  _var: { user: { userId: 'abc123' } }
};

it('rp controller sanity', async () => {
  await createTestTable(ctx);

  await migrateData(ctx, 20);

  let req = new Request('http://localhost/v2', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  let res = await app.fetch(req, ctx.env);
  expect(res.status).toBe(200);
});

it('rp programs', async () => {
  await createTestTable(ctx);

  await migrateData(ctx, 20);

  let req = new Request('http://localhost/v2/programs', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  let res = await app.fetch(req, ctx.env);
  expect(res.status).toBe(200);
  let body = await res.json();
  expect(body.data.length).toBe(20);
  expect(body.data[0].frequencies).toBeInstanceOf(Array);

});

async function createTestTable(ctx) {
  const db = drizzle(ctx.env.D1DATA);
  console.log('creating programs table start');
  await db.run(sql`
      CREATE TABLE programs (
        id text PRIMARY KEY NOT NULL,
        type integer,
        title text,
        description text,
        source text,
        frequencies text,
        tags text,
        sort integer DEFAULT 10,
        userId text,
        createdOn integer,
        updatedOn integer
      );
      `);
  console.log('creating programs table end');

  return db;
}
