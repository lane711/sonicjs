export async function getAllContent(db) {
  const { results } = await db.prepare("SELECT * FROM users").all();
  return results;
}

export async function getByTable(db, table) {
    const { results } = await db.prepare(
      `SELECT * FROM ${table};`
    ).all();
  
    return results;
  }

export async function getByTableAndId(db, table, id) {
  const { results } = await db.prepare(
    `SELECT * FROM ${table} where id = '${id}';`
  ).all();

  return results[0];
}
