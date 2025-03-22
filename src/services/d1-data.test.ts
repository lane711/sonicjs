import { describe, it, expect } from "vitest";
import { sortClauseBuilder } from "./d1-data";

describe("sortClauseBuilder", () => {
  it("should return an empty string if no sort parameters are provided", () => {
    const params = {};
    const result = sortClauseBuilder(params);
    expect(result).toBe("");
  });

  it("should return a valid SQL order by clause for a single sort parameter no array", () => {
    const params = { sort: "name" };
    const result = sortClauseBuilder(params);
    expect(result).toBe("order by name asc");
  });


  it("should return a valid SQL order by clause for a single sort parameter desc no array", () => {
    const params = { sort: "name:desc" };
    const result = sortClauseBuilder(params);
    expect(result).toBe("order by name desc");
  });

  it("should return a valid SQL order by clause for a single sort parameter", () => {
    const params = { sort: ["name:asc"] };
    const result = sortClauseBuilder(params);
    expect(result).toBe("order by name asc");
  });

  it("should return a valid SQL order by clause for multiple sort parameters", () => {
    const params = { sort: ["name:asc", "age:desc"] };
    const result = sortClauseBuilder(params);
    expect(result).toBe("order by name asc, age desc");
  });

  it("should handle sort parameters with different cases", () => {
    const params = { sort: ["Name:ASC", "AGE:desc"] };
    const result = sortClauseBuilder(params);
    expect(result).toBe("order by Name ASC, AGE desc");
  });

  it("should handle sort parameters with spaces", () => {
    const params = { sort: [" name : asc", " age : desc "] };
    const result = sortClauseBuilder(params);
    expect(result).toBe("order by name asc, age desc");
  });
});