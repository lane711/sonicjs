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


test("logout should invalidate session", async ({ request }) => {
  const response = await request.get(`/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.status()).toBe(200);

  //now logout
  const responseLogout = await request.post(`/api/v1/auth/logout`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  expect(responseLogout.status()).toBe(200);
  const { message } = await responseLogout.json();
  expect(message.toLowerCase().includes('success')).toBe(true);

  const responseUnauth = await request.get(`/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(responseUnauth.status()).toBe(401);
});


test.afterEach(async ({ request }) => {
  // await cleanup(request, token);
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
      },
    },
  });

  return response;
};
