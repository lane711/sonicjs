import { getRecords } from '../cms/data/data';

export async function getPrograms(ctx) {
  const fn = async function () {
    const { results } = await ctx.env.D1DATA.prepare(
      `SELECT * FROM programs where type = 'set' order by sort;`
    ).all();

    let data = [];
    for(const freq of results){
      data.push({
        id: freq.id,
        title: freq.title,
        description: freq.description,
        source: freq.title,
        tags: freq.tags,
        userId:freq.userId,
        createdOn: freq.createdOn,
        updatedOn: freq.updatedOn,
        frequencies: JSON.parse(freq.frequencies),
        total: freq.total,
      })
    }

    return data;
  };

  const records = await getRecords(
    ctx,
    'programs',
    undefined,
    '/v2/programs',
    undefined,
    fn
  );

  return records;
}

function getProgramsWithJson(ctx) {}
