import { test, expect } from "@playwright/test";
import { purgeE2eTestData } from "@services/e2e";
import { adminCredentials } from "./settings";

// Annotate entire file as serial.
test.describe.configure({ mode: 'serial' });

var token = "";

test.beforeAll(async ({ request }) => {
  token = await loginAsAdmin(request);
  await cleanup(request, token);
});

async function loginAsAdmin(request) {
  const response = await request.post(`/api/v1/auth/login`, {
    data: adminCredentials,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { bearer } = await response.json();
  return bearer;
}

test("should allow admin to access /api/v1/users", async ({ request }) => {
  const response = await request.get(`/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.status()).toBe(200);
  const { data } = await response.json();
  expect(Array.isArray(data)).toBe(true);
});

test("should allow admin to create a user", async ({ request }) => {
  const response = await createTestUser(request, token);
  expect(response.status()).toBe(201);
  const { data: createdData } = await response.json();
  expect(typeof createdData === 'object').toBe(true);
});

test("should allow admin to delete a user", async ({ request }) => {
  const createUserResponse = await createTestUser(request, token);
  expect(createUserResponse.status()).toBe(201);
  const { data: createdData } = await createUserResponse.json();

  const response = await request.delete(`/api/v1/users/${createdData.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { data } = await createUserResponse.json();

  expect(response.status()).toBe(200);
  expect(data.id).toBe(createdData.id);
});

test("should allow admin to update a user", async ({ request }) => {
  const createUserResponse = await createTestUser(request, token);
  expect(createUserResponse.status()).toBe(201);
  const { data } = await createUserResponse.json();

  const response = await request.put(`/api/v1/users/${data.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      data: {
        email: "e2e!!-updated@test.com",
        password: "newpassword123abc",
        firstName: "updated",
        lastName: "user",
      },
    },
  });

  expect(response.status()).toBe(200);

  const response2 = await request.get(`/api/v1/users/${data.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response2.status()).toBe(200);

  const { data: updatedData } = await response2.json();
  expect(typeof updatedData === 'object').toBe(true);
  expect(updatedData.firstName).toBe('updated');
});

test("should allow admin to access /api/v1/auth/user for session and user info", async ({ request }) => {
  const response = await request.get(`/api/v1/auth/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.status()).toBe(200);
  const { data } = await response.json();
  expect(typeof data.user).toBe("object");
  expect(data.user.email.length).toBeGreaterThan(0);
  expect(typeof data.session).toBe("object");
});

test.afterEach(async ({ request }) => {
  await cleanup(request, token);
});

const cleanup = async (request, token) => {
  const response = await request.post(`/api/v1/test/e2e/cleanup`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.status()).toBe(200);
};

const createTestUser = async (request, token) => {
  const response = await request.post(`/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      data: {
        email: "e2e!!@test.com",
        password: "newpassword123abc",
        firstName: "Demo",
        lastName: "User",
      },
    },
  });

  return response;
};
