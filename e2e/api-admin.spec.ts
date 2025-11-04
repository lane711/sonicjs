import { test, expect } from "@playwright/test";
import { cleanup, loginAsAdmin, createTestUser, getTestUser, createTestPost } from "./e2e-helpers";
// Annotate entire file as serial.
test.describe("Admin API Tests", () => {
  test.describe.configure({ mode: "serial" });

  var token = "";
  const e2ePrefix = "e2e-admin";
  test.beforeAll(async ({ request }) => {
    token = await loginAsAdmin(request);
    await cleanup(request, token, "users", "email", e2ePrefix);
  });

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
    const user = await createTestUser(request, token, e2ePrefix);
    expect(typeof user === "object").toBe(true);
  });

  test("should allow admin to update a user", async ({ request }) => {
    const createUserData = await createTestUser(request, token, `${e2ePrefix}-update`);


    const response = await request.put(`/api/v1/users/${createUserData.data.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        data: {
          email: `${e2ePrefix}-updated@test.com`,
          password: "updatedPassword",
          firstName: "updated",
          lastName: "user",
        },
      },
    });

    expect(response.status()).toBe(200);  

    const updatedUser = await getTestUser(request, token, createUserData.data.id);
    
    expect(updatedUser.data.firstName).toBe("updated");
    expect(updatedUser.data.lastName).toBe("user");
    expect(updatedUser.data.email).toBe(`${e2ePrefix}-updated@test.com`);
    expect(updatedUser.data.password).toBe("updatedPassword");
  });

  test("should allow admin to delete a user", async ({ request }) => {
    const user = await createTestUser(request, token, `${e2ePrefix}-delete`);

    const response = await request.delete(`/api/v1/users/${user.data.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(200);
    const deleteResponse = await response.json();
    expect(deleteResponse.success).toBe(true);
    expect(deleteResponse.id).toBe(user.data.id);
  });

  test("should allow admin to delete a post", async ({ request }) => {
    const post = await createTestPost(request, token, 'test body', `${e2ePrefix}-delete`);

    const response = await request.delete(`/api/v1/posts/${post.data.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(200);
    const deleteResponse = await response.json();
    expect(deleteResponse.success).toBe(true);
    expect(deleteResponse.id).toBe(post.data.id);
  });

  test("should allow admin to access /api/v1/auth/user for session and user info", async ({
    request,
  }) => {
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

  test.afterAll(async ({ request }) => {
    // await cleanup(request, token, "users", "email", e2ePrefix);
  });
});
