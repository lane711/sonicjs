import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { v4 as uuidv4 } from "uuid";
import {
  postsTable,
  postSchema,
  userSchema,
  usersTable,
  categorySchema,
  commentSchema,
  categoriesTable,
  commentsTable,
} from "../../db/schema";
import { DefaultLogger, LogWriter, eq } from "drizzle-orm";
import { addToInMemoryCache } from "./cache";
import { addToKvCache } from "./kv-data";

export async function getAllContent(db) {
  const { results } = await db.prepare("SELECT * FROM users").all();
  return results;
}

export async function getD1DataByTable(db, table, params) {
  const sql = generateSelectSql(table, params);
  const { results } = await db.prepare(sql).all();

  return { data: results, source: "d1" };
}

export function generateSelectSql(table, params) {
  console.log("params ==>", JSON.stringify(params, null, 2));

  var whereClause = "";
  var sortBySyntax = "";
  var limitSyntax: string = "";
  var offsetSyntax = "";

  if (params) {
    const sortDirection = params.sortDirection ?? "asc";
    // console.log("sortDirection ==>", sortDirection);

    sortBySyntax = params.sortBy
      ? `order by ${params.sortBy} ${sortDirection}`
      : "";

    limitSyntax = params.limit > 0 ? `limit ${params.limit}` : "";
    // console.log("limitSyntax ==>", limitSyntax);

    offsetSyntax = params.offset > 0 ? `offset ${params.offset}` : "";
    whereClause = whereClauseBuilder(params);
  }

  let sql = `SELECT * FROM ${table} ${whereClause} ${sortBySyntax} ${limitSyntax} ${offsetSyntax}`;
  sql = sql.replace(/\s+/g, " ").trim() + ';';

  console.log("sql ==>", sql);
  return sql;
}

export async function getD1ByTableAndId(db, table, id) {
  const { results } = await db
    .prepare(`SELECT * FROM ${table} where id = '${id}';`)
    .all();

  return results[0];
}

export async function insertUserTest(d1, data) {
  const db = drizzle(d1);

  return db.insert(usersTable).values(data).returning().get();
}

export async function insertData(d1, table, data) {
  const db = drizzle(d1);

  const now = new Date().getTime();
  data.created_on = now;
  data.updated_on = now;
  delete data.table;

  const schmea = getRepoFromTable(table);
  let result = db.insert(schmea).values(data).returning().get();

  return result;
}

export async function deleteByTableAndId(d1, table, id) {
  console.log("deleteByTableAndId", table, id);
  const db = drizzle(d1);

  const schmea = getRepoFromTable(table);
  let sql = await db.delete(schmea).where(eq(schmea.id, id)).toSQL();
  console.log("deleteByTableAndId sql", sql);

  let result = await db.delete(schmea).where(eq(schmea.id, id)).run();

  return result;
}

export async function updateData(d1, table, data) {
  const db = drizzle(d1);
  console.log("updateData===>", JSON.stringify(data, null, 4));
  const repo = getRepoFromTable(data.table);
  delete data.table;

  console.log(JSON.stringify(data, null, 4));

  let result = await db
    .update(repo)
    .set(data)
    .where(eq(repo.id, data.id))
    // .returning({ updated: users.updatedAt })
    .values();

  console.log("updating data result ", result);

  return result;
}

export function getSchemaFromTable(tableName) {
  switch (tableName) {
    case "users":
      return userSchema;
      break;
    case "posts":
      return postSchema;
      break;
    case "categories":
      return categorySchema;
      break;
    case "comments":
      return commentSchema;
      break;
  }
}

export function getRepoFromTable(tableName) {
  console.log("getting schema", tableName);
  switch (tableName) {
    case "users":
      return usersTable;
      break;
    case "posts":
      return postsTable;
      break;
    case "categories":
      return categoriesTable;
      break;
    case "comments":
      return commentsTable;
      break;
  }
}

export function whereClauseBuilder(params) {
  // console.log("whereClauseBuilder", JSON.stringify(params.filters, null, 2));
  let whereClause = "";
  const filters = params.filters;

  if (!filters) {
    return whereClause;
  }

  if (Array.isArray(filters)) {
    filters.map((field) => {
      console.log(field);
    });
  } else {
    console.log("---filters----");
    console.log(filters);
    const field = Object.keys(filters)[0];
    console.log(field);

    whereClause = `where ${field} = `;
  }

  return whereClause;
}
