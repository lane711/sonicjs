import { describe, it, expect } from "vitest";
import { generateSelectSql, sortClauseBuilder, whereClauseBuilder } from "./d1-data";
import qs from "qs";

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

describe("generateSelectSql", () => {
  it("should generate SQL with no parameters", () => {
    const table = "users";
    const params = {};
    const result = generateSelectSql(table, params);
    expect(result).toBe("SELECT *, COUNT() OVER() AS total FROM users;");
  });

  it("should generate SQL with id parameter", () => {
    const table = "users";
    const params = { id: "123" };
    const result = generateSelectSql(table, params);
    expect(result).toBe(
      "SELECT *, COUNT() OVER() AS total FROM users WHERE id = '123';"
    );
  });

  it("should generate SQL with limit and offset parameters", () => {
    const table = "users";
    const params = { limit: 10, offset: 5 };
    const result = generateSelectSql(table, params);
    expect(result).toBe(
      "SELECT *, COUNT() OVER() AS total FROM users limit 10 offset 5;"
    );
  });

  it("should generate SQL with sort parameters", () => {
    const table = "users";
    const params = { sort: ["name:asc", "age:desc"] };
    const result = generateSelectSql(table, params);
    expect(result).toBe(
      "SELECT *, COUNT() OVER() AS total FROM users order by name asc, age desc;"
    );
  });

  it("should generate SQL with filters", () => {
    const table = "users";
    const params = { filters: { name: { $eq: "John" }, age: { $gt: 30 } } };
    const result = generateSelectSql(table, params);
    expect(result).toBe(
      "SELECT *, COUNT() OVER() AS total FROM users WHERE name = 'John' AND age > '30';"
    );
  });

  it("should generate SQL with all parameters", () => {
    const table = "users";
    const params = {
      id: "123",
      limit: 10,
      offset: 5,
      sort: ["name:asc", "age:desc"],
      filters: { name: { $eq: "John" }, age: { $gt: 30 } },
    };
    const result = generateSelectSql(table, params);
    expect(result).toBe(
      "SELECT *, COUNT() OVER() AS total FROM users WHERE id = '123';"
    );
  });
});


describe("whereClauseBuilder", () => {
  it("should return an empty string if no filters are provided", () => {
    const filters = {};
    const result = whereClauseBuilder(filters);
    expect(result).toBe("");
  });

  it("should return a valid SQL where clause for a single filter", () => {
    const filters = { name: { $eq: "John" } };
    const result = whereClauseBuilder(filters);
    expect(result).toBe("WHERE name = 'John'");
  });

  it("should return a valid SQL where clause for multiple filters", () => {
    const filters = { name: { $eq: "John" }, age: { $eq: 30 } };
    const result = whereClauseBuilder(filters);
    expect(result).toBe("WHERE name = 'John' AND age = '30'");
  });

  it("should return a valid SQL where clause for filters with array values", () => {
    const filters = { country: { $eq: ["USA", "UK"] } };
    const result = whereClauseBuilder(filters);
    expect(result).toBe("WHERE (country = 'USA' OR country = 'UK')");
  });

  it("should handle filters with different conditions", () => {
    const filters = { name: { $eq: "John" }, age: { $eq: 30 }, country: { $eq: ["USA", "UK"] } };
    const result = whereClauseBuilder(filters);
    expect(result).toBe("WHERE name = 'John' AND age = '30' AND (country = 'USA' OR country = 'UK')");
  });

  it("should return a valid SQL where clause for multiple filters", () => {
      const filters = { name: { $eq: "John" }, age: { $gt: 30 } };
      const result = whereClauseBuilder(filters);
      expect(result).toBe("WHERE name = 'John' AND age > '30'");
    });
  
    it("should handle filters with different conditions", () => {
      const filters = { name: { $eq: "John" }, age: { $lt: 30 }, country: { $neq: "USA" } };
      const result = whereClauseBuilder(filters);
      expect(result).toBe("WHERE name = 'John' AND age < '30' AND country != 'USA'");
    });
  
    it("should handle filters with array values", () => {
      const filters = { country: { $in: ["USA", "UK"] } };
      const result = whereClauseBuilder(filters);
      expect(result).toBe("WHERE (country = 'USA' OR country = 'UK')");
    });
  
    it("should handle filters with LIKE condition", () => {
      const filters = { name: { $contains: "John" } };
      const result = whereClauseBuilder(filters);
      expect(result).toBe("WHERE name LIKE 'John'");
    });
  
    it("should handle filters with greater than condition", () => {
      const filters = { age: { $gt: 30 } };
      const result = whereClauseBuilder(filters);
      expect(result).toBe("WHERE age > '30'");
    });
  
    it("should handle filters with less than condition", () => {
      const filters = { age: { $lt: 30 } };
      const result = whereClauseBuilder(filters);
      expect(result).toBe("WHERE age < '30'");
    });
  
    it("should handle filters with IS NULL condition", () => {
      const filters = { name: { $null: true } };
      const result = whereClauseBuilder(filters);
      expect(result).toBe("WHERE name IS NULL");
    });
  
    it("should handle filters with IS NOT NULL condition", () => {
      const filters = { name: { $nnull: true } };
      const result = whereClauseBuilder(filters);
      expect(result).toBe("WHERE name IS NOT NULL");
    });
});

describe("generateSelectSql via query string", () => {
  it("should generate SQL with no parameters", () => {
    const table = "users";
    const query = "";
    const params = query ? qs.parse(query, { duplicates: "combine" }) : {};
    const result = generateSelectSql(table, params);
    expect(result).toBe("SELECT *, COUNT() OVER() AS total FROM users;");
  });

  it("should generate SQL with filters", () => {
    const table = "users";
    // const params = { filters: { name: { $eq: "John" }, age: { $gt: 30 } } };
    const query = "filters[name][$eq]=John&filters[age][$gt]=30";
    const params = query ? qs.parse(query, { duplicates: "combine" }) : {};
    const result = generateSelectSql(table, params);
    expect(result).toBe(
      "SELECT *, COUNT() OVER() AS total FROM users WHERE name = 'John' AND age > '30';"
    );
  });
});