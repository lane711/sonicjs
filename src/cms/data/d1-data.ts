import { drizzle } from "drizzle-orm/d1";
import { v4 as uuidv4 } from "uuid";
import { posts, postsSchema, userSchema, users } from "../../db/schema";
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

  var whereClause = '';
  var sortBySyntax = '';
  var limitSyntax = '';
  var offsetSyntax = '';

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

export async function insertData(d1, table, data) {
  const db = drizzle(d1);

  console.log("inserting data", data);

  const now = new Date().getTime();
  data.created_on = now;
  data.updated_on = now;
  delete data.contentType;
  delete data.submit;
  delete data.table;

  console.log(JSON.stringify(data, null, 4));

  const schmea = getRepoFromTable(table);

  let result = await db.insert(schmea).values(data).run();

  return result;
}

export async function updateData(d1, table, data) {
  const db = drizzle(d1);

  console.log(JSON.stringify(data, null, 4));

  // data.created_at = new Date();
  // data.updated_at = new Date().getTime();
  // delete data.id;
  delete data.contentType;
  delete data.submit;
  delete data.table;

  console.log(JSON.stringify(data, null, 4));

  let result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, data.id))
    // .returning({ updated: users.updatedAt })
    .values();

  console.log("updating data result ", result);

  return result;
}

export function getSchemaFromTable(tableName) {
  console.log("getting schema", tableName);
  return tableName == "users" ? userSchema : postsSchema;
}

export function getRepoFromTable(tableName) {
  console.log("getting schema", tableName);
  return tableName == "users" ? users : posts;
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
