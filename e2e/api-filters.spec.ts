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

test("should allow admin to create a post", async ({ request }) => {
  const response = await createTestPost(request, token, 'create');
  expect(response.status()).toBe(201);
});

// test("should allow admin to delete a user", async ({ request }) => {
//   const createUserResponse = await createTestUser(request, token);
//   expect(createUserResponse.status()).toBe(201);
//   const { data } = await createUserResponse.json();

//   const response = await request.delete(`/api/v1/users/${data.id}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   expect(response.status()).toBe(204);
// });

// test("should allow admin to update a user", async ({ request }) => {
//   const createUserResponse = await createTestUser(request, token);
//   expect(createUserResponse.status()).toBe(201);
//   const { data } = await createUserResponse.json();

//   const response = await request.put(`/api/v1/users/${data.id}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     data: {
//       data: {
//         email: "e2e!!-updated@test.com",
//         password: "newpassword123abc",
//         firstName: "updated",
//         lastName: "user",
//       },
//     },
//   });

//   expect(response.status()).toBe(200);

//   const response2 = await request.get(`/api/v1/users/${data.id}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   expect(response2.status()).toBe(200);

//   const { data: updatedData } = await response2.json();
//   expect(typeof updatedData === 'object').toBe(true);
//   expect(updatedData.data.firstName).toBe('updated');
// });

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

const createTestPost = async (request, token, body) => {
  const response = await request.post(`/api/v1/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      data: {
        title: "e2e!! test title",
        body,
      },
    },
  });

  return response;
};
