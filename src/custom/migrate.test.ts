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
  _var: { user: { userId: 'abc123' } }
};

it('migration WIP', async () => {
  await createTestTable(ctx);
    await migrateData(ctx, 5);

  //check that data is in the db
  let data = await getRecords(
    ctx,
    'programs',
    {},
    '/any-url',
    'fastest',
    undefined
  );
  expect(data.data.length).toBe(5);
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
