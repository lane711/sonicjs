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