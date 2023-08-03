import { generateSelectSql, insertData, whereClauseBuilder } from "./d1-data";
import qs from "qs";
const env = getMiniflareBindings();
const { D1DATA, KVDATA } = getMiniflareBindings();

it("should not return a where clause", () => {
  const params = {};
  const clause = whereClauseBuilder(params);
  expect(clause).toBe("");
});

it("should return a where clause with eq", () => {
  const queryParams = "someurl?filters[id][eq]=100";
  const params = qs.parse(queryParams);
  const clause = whereClauseBuilder(params);
  expect(clause).toBe("where id = 100");
});

it("should return a where clause with multi in", () => {
  const queryParams = "someurl?filters[id][$in][0]=100&filters[id][$in][1]=101";
  const params = qs.parse(queryParams);
  const clause = whereClauseBuilder(params);
  expect(clause).toBe("");
});

it("should return a SQL select", () => {
  const queryParams = "someurl?limit=2";
  const params = qs.parse(queryParams);
  console.log("params ---->", params);
  const clause = generateSelectSql("my-table", params);
  expect(clause).toBe("SELECT * FROM my-table limit 2'");
});

it("CRUD", () => {
  console.log('env ==>', env)
  console.log('D1DATA', D1DATA);

  insertData(D1DATA, "posts", { title: "a", body: "b" });
});
