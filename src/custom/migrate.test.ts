import app from '../server';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import { getRecords, insertRecord } from '../cms/data/data';

const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();

const toJson = function (json) {
  return json;
};

const ctx = {
  env: { KVDATA: KVDATA, D1DATA: __D1_BETA__D1DATA },
  json: toJson
};
const { programs } = require('../custom/rife-data');

it('migration WIP', async () => {
  await createTestTable(ctx);

  const testPrograms = programs.slice(0, 10);

  for (const program of testPrograms) {
    console.log(program.title);

    const type = program.sweep ? 'sweep' : 'set';

    const result = await insertRecord(ctx.env.D1DATA, ctx.env.KVDATA, {
      table: 'programs',
      data: {
        title: program.title,
        description: program.description,
        source: program.source,
        frequencies: program.frequencies,
        type,
        userId: '123'
      }
    });

    // type: integer('type'),
    // title: text('title'),
    // description: text('description'),
    // source: text('source'),
    // frequencies: text('text', { mode: 'json' }),
    // tags: text('tags', { mode: 'json' }).$type<string[]>(),
    // sort: integer('sort').default(10),
    // userId: text('userId'),
  }

  //check that data is in the db
  let data = await getRecords(
    ctx,
    'programs',
    {},
    '/any-url',
    'fastest',
    undefined
  );
  expect(data.data.length).toBeGreaterThan(1);
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
        text text,
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
