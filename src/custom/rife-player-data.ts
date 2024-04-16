import { getRecords } from '../cms/data/data';

export async function getPrograms(ctx) {
  const fn = async function () {
    const { results } = await ctx.env.D1DATA.prepare(
      `SELECT * FROM programs order by sort;`
    ).all();

    let data = [];
    for (const freq of results) {
      data.push({
        id: freq.id,
        title: freq.title,
        description: freq.description,
        source: freq.title,
        tags: freq.tags,
        userId: freq.userId,
        createdOn: freq.createdOn,
        updatedOn: freq.updatedOn,
        frequencies: JSON.parse(freq.frequencies),
        total: freq.total
      });
    }

    return data;
  };
}

export async function checkUserExists(ctx, email) {
  const fn = async function () {
    const sql = `SELECT count(*) as count FROM users WHERE email = '${email}';`;
    const { results } = await ctx.env.D1DATA.prepare(sql).all();

    return results;
  };

  const records = await getRecords(
    ctx,
    'programs',
    undefined,
    `/v2/check-user/exists${email}`,
    'd1',
    fn
  );

  return records.data[0].count > 0;
}

function getProgramsWithJson(ctx) {}
