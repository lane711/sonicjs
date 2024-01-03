import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import { tableSchemas } from "../../db/routes";

export async function getAllContent(db) {
  const { results } = await db.prepare("SELECT * FROM users").all();
  return results;
}

export async function getD1DataByTable(db, table, params) {
  const sql = generateSelectSql(table, params);
  const { results } = await db.prepare(sql).all();
  return params?.id ? results[0] : results;
}

export function generateSelectSql(table, params) {
  // console.log("params ==>", JSON.stringify(params, null, 2));

  var whereClause = "";
  var sortBySyntax = "";
  var limitSyntax: string = "";
  var offsetSyntax = "";

  if (params) {
    let { sortDirection, sortBy, limit, offset, ...filters } = params;
    sortDirection = sortDirection ?? "asc";
    // console.log("sortDirection ==>", sortDirection);

    sortBySyntax = sortBy ? `order by ${sortBy} ${sortDirection}` : "";

    limit = limit ?? 0;
    limitSyntax = limit > 0 ? `limit ${limit}` : "";
    // console.log("limitSyntax ==>", limitSyntax);

    offset = offset ?? 0;
    offsetSyntax = offset > 0 ? `offset ${offset}` : "";
    whereClause = whereClauseBuilder(filters);
  }

  let sql = `SELECT *, COUNT() OVER() AS total FROM ${table} ${whereClause} ${sortBySyntax} ${limitSyntax} ${offsetSyntax}`;
  sql = sql.replace(/\s+/g, " ").trim() + ";";

  console.log("sql ==>", sql);
  return sql;
}

export async function getD1ByTableAndId(db, table, id, params) {
  const { results } = await db
    .prepare(`SELECT * FROM ${table} where id = '${id}';`)
    .all();

  return results[0];
}

export function prepareD1Data(data, tbl = "") {
  const table = data.table || tbl;
  const schema = getRepoFromTable(table);
  const now = new Date().getTime();
  data.createdOn = now;
  data.updatedOn = now;
  delete data.table;

  if (!schema.id) {
    delete data.id;
  }
  return data;
}

export async function insertD1Data(d1, kv, table, data) {
  const db = drizzle(d1);
  data = prepareD1Data(data, table);
  const schema = getRepoFromTable(table);
  try {
    // let sql = db.insert(schmea).values(data).getSQL();
    let result = await db.insert(schema).values(data).returning().get();
    return result;
  } catch (error) {
    return error;
  }
}

export async function deleteD1ByTableAndId(d1, table, id) {
  console.log("deleteD1ByTableAndId", table, id);
  const db = drizzle(d1);

  const schmea = getRepoFromTable(table);
  let sql = await db.delete(schmea).where(eq(schmea.id, id)).toSQL();

  let result = await db.delete(schmea).where(eq(schmea.id, id)).run();

  return result;
}

export async function updateD1Data(
  d1,
  table,
  data,
  params?: Record<string, any>
) {
  const db = drizzle(d1);
  const schemaTable = table ?? data.table;
  const repo = getRepoFromTable(schemaTable);
  const recordId = data.id;
  // delete data.table;
  if (data.data && data.data.id) {
    delete data.data.id;
  }

  const now = new Date().getTime();
  data.data.updatedOn = now;

  const eqArgs = [eq(repo.id, recordId)];
  if (params) {
    for (const key in params) {
      if (key !== "id") {
        eqArgs.push(eq(repo[key], params[key]));
      }
    }
  }
  let result = await db
    .update(repo)
    .set(data.data)
    .where(and(...eqArgs))
    .returning({ id: repo.id })
    .values();

  // let result = await db
  // .update(repo)
  // .set(data)
  // .where(eq(repo.id, data.id))
  // // .returning({ updated: users.updatedAt })
  // .values();

  // .returning().get();

  const id = result && result[0] ? result[0]["0"] : undefined;

  // console.log("updating data result ", result);

  return { id } ?? result;
}

export function getSchemaFromTable(tableName) {
  return tableSchemas[tableName]?.definition;
}

export function getRepoFromTable(tableName) {
  return tableSchemas[tableName]?.table;
}

export function whereClauseBuilder(filters: Record<string, any>) {
  let whereClause = "";

  if (!filters || Object.keys(filters).length === 0) {
    return whereClause;
  }

  let AND = "";
  whereClause = "WHERE";
  for (const key of Object.keys(filters)) {
    const value =
      typeof filters[key] === "string" ? `'${filters[key]}'` : filters[key];
    whereClause = `${whereClause} ${AND} ${key} = ${value}`;
    AND = "AND";
  }
  return whereClause;
}
