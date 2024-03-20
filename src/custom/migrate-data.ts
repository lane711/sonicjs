import { insertRecord } from '../cms/data/data';

const { programs } = require('../custom/rife-data');

export async function migrateData(ctx, count = 99999) {

  await ctx.env.D1DATA.prepare(`Delete from programs`).all();

  // await ctx.env.D1DATA.prepare(
  //   `DELETE FROM SQLITE_SEQUENCE WHERE name='programs';`
  // ).all();

  const testPrograms = programs.slice(0, count);

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
        userId: ctx._var.user.userId
      }
    });

    await sleep(100);
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
