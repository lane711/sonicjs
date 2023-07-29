import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { v4 as uuidv4 } from "uuid";
import {
  post,
  postSchema,
  userSchema,
  user,
  categorySchema,
  commentSchema,
  category,
  comment,
} from "../../db/schema";
import { DefaultLogger, LogWriter, eq } from "drizzle-orm";

export async function getAllContent(db) {
  const { results } = await db.prepare("SELECT * FROM users").all();
  return results;
}

export async function getByTable(db, table, params) {
  // const { results } = await db.prepare(`SELECT * FROM ${table};`).all();

  // return results;
  // console.log("db ==>", db);
  console.log("params ==>", JSON.stringify(params, null, 2));

  var whereClause = "";
  var sortBySyntax = "";
  var limitSyntax = "";
  var offsetSyntax = "";

  if (params) {
    const sortDirection = params.sortDirection ?? "asc";
    console.log("sortDirection ==>", sortDirection);

    const sortBySyntax = params.sortBy
      ? `order by ${params.sortBy} ${sortDirection}`
      : "";

    const limitSyntax = params.limit > 0 ? `limit ${params.limit}` : "";
    const offsetSyntax = params.offset > 0 ? `offset ${params.offset}` : "";
    const whereClause = whereClauseBuilder(params);
  }

  const sql = `SELECT * FROM ${table} ${whereClause} ${sortBySyntax} ${limitSyntax} ${offsetSyntax};`;

  console.log("sql ==>", sql);

  const { results } = await db.prepare(sql).all();

  console.log("sql results ==>", results);

  return results;
}

export async function getByTableAndId(db, table, id) {
  const { results } = await db
    .prepare(`SELECT * FROM ${table} where id = '${id}';`)
    .all();

  return results[0];
}

// export async function saveData(d1, table, data) {
//   if (!data.id) {
//     data.id = uuidv4();
//     return insertData(d1, table, data);
//   } else {
//     return updateData(d1, table, data);
//   }
// }

export async function insertUserTest(d1, data) {
  const db = drizzle(d1);

  return db.insert(user).values(data).returning().get();
}

export async function insertData(d1, table, data) {
  const db = drizzle(d1);

  // console.log("inserting D1 data", table, data);

  const now = new Date().getTime();
  data.created_on = now;
  data.updated_on = now;
  // delete data.contentType;
  // delete data.submit;
  delete data.table;

  console.log("D1==>", JSON.stringify(data, null, 4));

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

  // data.created_at = new Date();
  // data.updated_at = new Date().getTime();
  // delete data.id;
  // delete data.contentType;
  // delete data.submit;
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
  // console.log("getting schema", tableName);
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
  // console.log("getting schema", tableName);
  switch (tableName) {
    case "users":
      return user;
      break;
    case "posts":
      return post;
      break;
    case "categories":
      return category;
      break;
    case "comments":
      return comment;
      break;
  }
}

export function whereClauseBuilder(params) {
  console.log("whereClauseBuilder", JSON.stringify(params.filters, null, 2));

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
