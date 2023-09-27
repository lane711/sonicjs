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
  categoriesToPostsTable,
  categoriesToPostsSchema,
} from "../../db/schema";
import { DefaultLogger, LogWriter, eq } from "drizzle-orm";
import { addToInMemoryCache, setCacheStatus } from "./cache";
import { addToKvCache } from "./kv-data";

export async function getAllContent(db) {
  const { results } = await db.prepare("SELECT * FROM users").all();
  return results;
}

export async function getD1DataByTable(db, table, params) {
  const sql = generateSelectSql(table, params);
  const { results } = await db.prepare(sql).all();

  return results;
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
  sql = sql.replace(/\s+/g, " ").trim() + ";";

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

export async function insertD1Data(d1, kv, table, data) {
  const db = drizzle(d1);

  const now = new Date().getTime();
  data.createdOn = now;
  data.updatedOn = now;
  delete data.table;

  const schmea = getRepoFromTable(table);
  try {
    // let sql = db.insert(schmea).values(data).getSQL();
    if (!schmea.id) {
      delete data.id;
    }
    let result = await db.insert(schmea).values(data).returning().get();
    return result;
  } catch (error) {
    console.error(error);
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

export async function updateD1Data(d1, table, data) {
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

  console.log("updateD1Data===>", recordId, JSON.stringify(data.data, null, 4));

  let result = await db
    .update(repo)
    .set(data.data)
    .where(eq(repo.id, recordId))
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

  console.log("updating data result ", result);

  return { id } ?? result;
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
    case "categoriesToPosts":
      return categoriesToPostsSchema;
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
    case "categoriesToPosts":
      return categoriesToPostsTable;
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
