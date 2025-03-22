import { describe, it, expect } from "vitest";
import { whereClauseBuilder } from "./d1-data";

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
  });