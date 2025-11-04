import { uuid } from "./utils";

export const statsGetUrl = async (context, url) => {
  try {
    new URL(url);
    const sql = `SELECT avg(executionTime) as avgExecutionTime FROM stats where url = "${url}" group by url`;
    console.log("statsGetUrl", sql);
    const { results } = await context.env.DB.prepare(sql).run();
    return results ? results[0] : {};
  } catch (e) {
    throw new Error("Invalid URL provided");
  }
};


export const statsInsert = async (ctx, url, executionTime) => {
    //   console.log("requestInsert", url);
    const id = uuid();
    const now = new Date().toISOString();
  
    const sql = await ctx.env.DB.prepare(
      "INSERT INTO stats (id, url, createdOn, executionTime) VALUES (?1, ?2, ?3, ?4);"
    ).bind(id, url, now, executionTime);
  
    console.log(sql, `${id}, ${url}, ${executionTime}`);

  const record = await sql.run();

  console.log(ctx, record);
};
