import { test, expect } from "@playwright/test";


test("should allow unauthenticated user to access /api/v1/posts", async ({
  request,
}) => {
  const url = "http://localhost:4321/api/v1/employees?limit=18&offset=0&filters[region][$eq]=Northeast&filters[region][$eq]=Southwest&filters[region][$eq]=West&filters[region][$eq]=Southeast&filters[region][$eq]=Midwest";

  const response = await request.get(`/api/v1/stats?url=${url}`);
  expect(response.status()).toBe(200);
  const { data } = await response.json();
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
});
