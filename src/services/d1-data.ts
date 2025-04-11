import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import { tableSchemas } from "@custom/custom.config";
import qs from "qs";
import { uuid } from "./utils";

// export async function getAllContent(db) {
//   const { results } = await db.prepare("SELECT * FROM users").all();
//   return results;
// }

export async function getD1DataByTable(db, table, params) {
  const sql = generateSelectSql(table, params);
  console.log("sql ==>", sql);
  const { results } = await db.prepare(sql).all();
  return params?.id ? results[0] : results;
}

export function generateSelectSql(table, params) {
  // console.log("params ==>", JSON.stringify(params, null, 2));

  var whereClause = "";
  var sortBySyntax = "";
  var limitSyntax: string = "";
  var offsetSyntax = "";

  if (params && params.id) {
    whereClause = `WHERE id = '${params.id}'`;
  } else if (params) {
    let { limit, offset, filters } = params;

    sortBySyntax = sortClauseBuilder(params);

    limit = limit ?? 0;
    limitSyntax = limit > 0 ? `limit ${limit}` : "";
    // console.log("limitSyntax ==>", limitSyntax);

    offset = offset ?? 0;
    offsetSyntax = offset > 0 ? `offset ${offset}` : "";

    whereClause = whereClauseBuilder(filters);
  }

  let sql = `SELECT *, COUNT() OVER() AS total FROM ${table} ${whereClause} ${sortBySyntax} ${limitSyntax} ${offsetSyntax}`;
  sql = sql.replace(/\s+/g, " ").trim() + ";";

  // console.log("sql ==>", sql);
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

  if(!data.id){ 
    data.id =   uuid();
  }

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
    let result = await db.insert(schema).values(data);
    return data;
  } catch (error) {
    return { error };
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

  const sql = await db
    .update(repo)
    .set(data.data)
    .where(and(...eqArgs))
    .returning({ id: repo.id })
    .toSQL();

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
  if (id) {
    return { id };
  } else {
    return result;
  }
}

export function getSchemaFromTable(tableName) {
  return tableSchemas[tableName]?.definition;
}

export function getRepoFromTable(tableName) {
  return tableSchemas[tableName]?.table;
}

export function sortClauseBuilder(params) {
  if (!params.sort) {
    return "";
  }

  let sortClause = "";

  if (Array.isArray(params.sort)) {
    sortClause =
      "order by " + params.sort.join(", ").replace(new RegExp(":", "g"), " ");
  }else{
    const direction = params.sort.includes(":desc") ? "desc" : "asc";
    const sort = params.sort.replace(":desc", "").replace(":asc", "");
    sortClause = `order by ${sort} ${direction}`;
  }

  return sortClause.replace(/\s+/g, " ").trim();
}

export function whereClauseBuilder(filters: any) {
  let whereClause = "";

  if (!filters || Object.keys(filters).length === 0) {
    return whereClause;
  }

  let AND = "";
  whereClause = "WHERE";
  for (const key of Object.keys(filters)) {
    let filter = filters[key];

    //need to first loop over the object keys in the case of multiple filters on the same field
    for (const condition of Object.keys(filter)) {

    // let condition = Object.keys(filter)[0];

    if (Array.isArray(filter[condition])) {
      // AND (country = 'usa' OR country = 'uk')
      const arr = filter[condition];
      let multiArr = [];
      for (const prop of arr) {
        multiArr.push(`${key} = '${prop}'`);
      }
      whereClause = `${whereClause} ${AND} (${multiArr.join(` OR `)})`;
    }else if(condition === '$null' || condition === '$nnull'){
      whereClause = `${whereClause} ${AND} ${key} ${processCondition(
        condition
      )}`;
    }else if(condition === '$contains'){
      whereClause = `${whereClause} ${AND} ${key} ${processCondition(
        condition
      )} '%${filter[condition]}%'`;
    }else if(condition === '$starts_with' || condition === '$nstarts_with'){
      whereClause = `${whereClause} ${AND} ${key} ${processCondition(
        condition
      )} '${filter[condition]}%'`;
    }else if(condition === '$ends_with' || condition === '$nends_with'){
      whereClause = `${whereClause} ${AND} ${key} ${processCondition(
        condition
      )} '%${filter[condition]}'`;
    } else {
      whereClause = `${whereClause} ${AND} ${key} ${processCondition(
        condition
      )} '${filter[condition]}'`;
    }
    // if (typeof filter === 'string') {
    //   if (filter.toLowerCase().includes('is')) {
    //     whereClause = `${whereClause} ${AND} ${key} ${filter}`;
    //   } else {
    //     whereClause = `${whereClause} ${AND} ${key} = '${filter}'`;
    //   }
    // } else {
    //   whereClause = `${whereClause} ${AND} ${key} = ${filter}`;
    // }

    AND = "AND";
  }
}
  return whereClause.replace(/\s+/g, " ");
}

export async function getTableCounts(db, table) {
  const { results } = await db
    .prepare(`SELECT count(id) as count FROM '${table}';`)
    .all();

  return results[0];
}

export function processCondition(condition) {
  switch (condition) {
    case "$eq":
      return "=";
    case "$neq":
      return "!=";
    case "$lt":
      return "<";
    case "$lte":
      return "<=";
    case "$gt":
      return ">";
    case "$gte":
      return ">=";
    case "$in":
      return "IN";
    case "$nin":
      return "NOT IN";
    case "$null":
      return "IS NULL";
    case "$nnull":
      return "IS NOT NULL";
    case "$contains":
      return "LIKE";
    case "$ncontains":
      return "NOT LIKE";
    case "$starts_with":
      return "LIKE";
    case "$nstarts_with":
      return "NOT LIKE";
    case "$ends_with":
      return "LIKE";
    case "$nends_with":
      return "NOT LIKE";
    case "$between":
      return "BETWEEN";
    case "$nbetween":
      return "NOT BETWEEN";
    case "$empty":
      return "= ''";
    case "$nempty":
      return "!= ''";
    case "$intersects":
      return "&&";
    case "$nintersects":
      return "NOT &&";
    case "$intersects_bbox":
      return "&&";
    case "$nintersects_bbox":
      return "NOT &&";
    default:
      throw new Error(`Unsupported condition: ${condition}`);
  }
}

export async function purgeD1Table(db, table) {
  const sql = `DELETE FROM ${table}`;
  const { results } = await db.prepare(sql).all();
  return {status: "success"};
}
