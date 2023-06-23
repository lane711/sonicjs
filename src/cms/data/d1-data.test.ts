import { whereClauseBuilder } from "./d1-data";
import qs from "qs";

it("should not return a where clause", () => {
  const params = {};
  const clause = whereClauseBuilder(params);
  expect(clause).toBe("");
});

it("should return a where clause with eq", () => {
  const queryParams = 'someurl?filters[id][eq]=100'
  const params = qs.parse(queryParams);
  const clause = whereClauseBuilder(params);
  expect(clause).toBe("where id = 100");
});

it("should return a where clause with multi in", () => {
  const queryParams = 'someurl?filters[id][$in][0]=100&filters[id][$in][1]=101'
  const params = qs.parse(queryParams);
  const clause = whereClauseBuilder(params);
  expect(clause).toBe("");
});

