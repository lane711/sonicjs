import { test, expect } from "@playwright/test";

test("should not allow unauthenticated user to access /api/v1/users", async ({
  request,
}) => {
  const response = await request.get(`/api/v1/users`);
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual(
    expect.objectContaining({
      message: "Unauthorized",
    })
  );
});
test("should not allow unauthenticated user to delete a user", async ({
  request,
}) => {
  const response = await request.delete(`/api/v1/users/1`);
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual(
    expect.objectContaining({
      message: "Unauthorized",
    })
  );
});

test("should not allow unauthenticated user to update a user", async ({
  request,
}) => {
  const response = await request.put(`/api/v1/users/1`, {
    data: {
      username: "updateduser",
      password: "newpassword123",
    },
  });
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual(
    expect.objectContaining({
      message: "Unauthorized",
    })
  );
});
test("should allow unauthenticated user to access /api/v1/posts", async ({
  request,
}) => {
  const response = await request.get(`/api/v1/posts?limit=2`);
  expect(response.status()).toBe(200);
  const { data } = await response.json();
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
});
test("should not allow unauthenticated user to create a user", async ({
  request,
}) => {
  const response = await request.post(`/api/v1/users`, {
    data: {
      username: "newuser",
      password: "password123",
    },
  });
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual(
    expect.objectContaining({
      message: "Unauthorized",
    })
  );
});
