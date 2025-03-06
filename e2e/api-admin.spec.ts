import { test, expect } from "@playwright/test";
import { purgeE2eTestData } from "@services/e2e";

const adminCredentials = {
  email: "demo@demo.com",
  password: "sonicjs!",
};

async function loginAsAdmin(request) {
  const response = await request.post(`/api/v1/auth/login`, {
    data: adminCredentials,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { bearer } = await response.json();
  // console.log("bearer", bearer);
  return bearer;
}

test("should allow admin to access /api/v1/users", async ({ request }) => {
  const token = await loginAsAdmin(request);
  const response = await request.get(`/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.status()).toBe(200);
  const { data } = await response.json();
  // console.log(data);
  expect(Array.isArray(data)).toBe(true);
});

test("should allow admin to create a user", async ({ request }) => {
  const token = await loginAsAdmin(request);
  const response = await createTestUser(request, token);
  expect(response.status()).toBe(201);
});

test("should allow admin to delete a user", async ({ request }) => {
  const token = await loginAsAdmin(request);

  const createUserResponse = await createTestUser(request, token);
  expect(createUserResponse.status()).toBe(201);
  const { data } = await createUserResponse.json();

  const response = await request.delete(`/api/v1/users/${data.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.status()).toBe(204);
});

test("should allow admin to update a user", async ({ request }) => {
  const token = await loginAsAdmin(request);
  const response = await request.put(`/api/v1/users/1`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      data: {
        email: "e2e-updated@test.com",
        password: "newpassword123abc",
      },
    },
  });
  expect(response.status()).toBe(200);
});

test("should allow unauthenticated user to access /api/v1/posts", async ({
  request,
}) => {
  const response = await request.get(`/api/v1/posts?limit=2`);
  expect(response.status()).toBe(200);
  const { data } = await response.json();
  console.log(data);
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
});

test.afterEach(async ({ request }) => {
  console.log("e2e cleanup...");

  const token = await loginAsAdmin(request);
  const response = await request.post(`/api/v1/test/e2e/cleanup`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.status()).toBe(200);

  console.log("Done with tests");
  // ...
});

const createTestUser = async (request, token) => {
  const response = await request.post(`/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      data: {
        email: "e2e!!@test.com",
        password: "newpassword123abc",
      },
    },
  });

  return response;
};

