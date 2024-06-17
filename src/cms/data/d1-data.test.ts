import {
  generateSelectSql,
  getD1DataByTable,
  insertD1Data,
  updateD1Data,
  whereClauseBuilder,
  getRepoFromTable,
  getSchemaFromTable
} from './d1-data';
import { tableSchemas } from '../../db/routes';
import qs from 'qs';
const env = getMiniflareBindings();
const { __D1_BETA__D1DATA, KVDATA } = getMiniflareBindings();
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

it('should not return a where clause', () => {
  const params = {};
  const clause = whereClauseBuilder(params);
  expect(clause).toBe('');
});

//TODO: support id equals 100
// it("should return a where clause with eq", () => {
//   const queryParams = "someurl?filters[id][eq]=100";
//   const params = qs.parse(queryParams);
//   const clause = whereClauseBuilder(params);
//   expect(clause).toBe("where id = 100");
// });

//TODO: support "in" clause
// it("should return a where clause with multi in", () => {
//   const queryParams = "someurl?filters[id][$in][0]=100&filters[id][$in][1]=101";
//   const params = qs.parse(queryParams);
//   const clause = whereClauseBuilder(params);
//   expect(clause).toBe("");
// });

it('should get table schema from table name', async () => {
  const tableToFind = 'users';
  const userTable = getSchemaFromTable(tableToFind);
  expect(userTable).toEqual(tableSchemas.users.definition);
});

it('should get table object from table name', async () => {
  const tableToFind = 'users';
  const findableTable = await getRepoFromTable(tableToFind);
  expect(findableTable).toEqual(tableSchemas.users.table);
});

it('should return a SQL select with limit', () => {
  const queryParams = 'limit=2';
  const params = qs.parse(queryParams);
  console.log('params ---->', params);
  const clause = generateSelectSql('my-table', params);
  expect(clause).toBe(
    'SELECT *, COUNT() OVER() AS total FROM my-table limit 2;'
  );
});

it('should return a SQL select with offset', () => {
  const queryParams = 'offset=2';
  const params = qs.parse(queryParams);
  console.log('params ---->', params);
  const clause = generateSelectSql('my-table', params);
  expect(clause).toBe(
    'SELECT *, COUNT() OVER() AS total FROM my-table offset 2;'
  );
});

it('should return a SQL select with limit and offset', () => {
  const queryParams = 'limit=2&offset=2';
  const params = qs.parse(queryParams);
  console.log('params ---->', params);
  const clause = generateSelectSql('my-table', params);
  expect(clause).toBe(
    'SELECT *, COUNT() OVER() AS total FROM my-table limit 2 offset 2;'
  );
});

it('should convert filters into where clause', () => {
  const queryParams = 'limit=2&offset=2&filters[name][$eq]=joe';
  const params = qs.parse(queryParams);
  console.log('params ---->', params);
  const clause = generateSelectSql('my-table', params);
  expect(clause).toBe(
    `SELECT *, COUNT() OVER() AS total FROM my-table WHERE name = 'joe' limit 2 offset 2;`
  );
});

it('should convert filters into where clause', () => {
  const queryParams = 'limit=2&offset=2&filters[name][$eq]=joe&filters[country][$eq]=usa';
  const params = qs.parse(queryParams);
  console.log('params ---->', params);
  const clause = generateSelectSql('my-table', params);
  expect(clause).toBe(
    `SELECT *, COUNT() OVER() AS total FROM my-table WHERE name = 'joe' AND country = 'usa' limit 2 offset 2;`
  );
});

it('should apply 2 sort fields', () => {
  const queryParams = 'sort[0]=body:asc&sort[1]=title:desc';
  const params = qs.parse(queryParams);
  console.log('params ---->', params);
  const clause = generateSelectSql('my-table', params);
  expect(clause).toBe(
    `SELECT *, COUNT() OVER() AS total FROM my-table order by body asc, title desc;`
  );
});

//TODO: rework to hit the full api
// it('get should return results', async () => {
//   const db = createTestTable();
//
//   await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//     firstName: 'John',
//     id: '1'
//   });
//   await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//     firstName: 'Jane',
//     id: '2'
//   });
//
//   const d1Result = await getD1DataByTable(
//     __D1_BETA__D1DATA,
//     'users',
//     undefined
//   );
//
//   expect(d1Result.length).toBe(2);
// });
//
// it('updateD1Data should update record', async () => {
//   const db = createTestTable();
//
//   await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//     firstName: 'John',
//     id: 'a'
//   });
//   await insertD1Data(__D1_BETA__D1DATA, KVDATA, 'users', {
//     firstName: 'Jane',
//     id: 'b'
//   });
//
//   await updateD1Data(__D1_BETA__D1DATA, 'users', {
//     data: { firstName: 'Steve' },
//     id: 'b'
//   });
//
//   const d1Result = await getD1DataByTable(
//     __D1_BETA__D1DATA,
//     'users',
//     undefined
//   );
//
//   expect(d1Result.length).toBe(2);
//   expect(d1Result[1].firstName).toBe('Steve');
// });

function createTestTable() {
  const db = drizzle(__D1_BETA__D1DATA);

  const usersTable = tableSchemas.users.table;

  db.run(sql`
    CREATE TABLE ${usersTable} (
      id text PRIMARY KEY NOT NULL,
      firstName text,
      lastName text,
      email text,
      password text,
      role text,
      createdOn integer,
      updatedOn integer
    );
	`);

  return db;
}
