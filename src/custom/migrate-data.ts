import { insertRecord } from '../cms/data/data';

const { programs } = require('../custom/rife-data');

export async function migrateData(ctx, count = 10) {
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
  }
}
