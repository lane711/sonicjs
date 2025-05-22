import { test, expect } from "@playwright/test";
import { cleanup, loginAsAdmin, createTestUser, getTestUser } from "./e2e-helpers";
// Annotate entire file as serial.
test.describe("Admin API Tests", () => {
  test.describe.configure({ mode: "serial" });

  var token = "";
  const e2ePrefix = "e2e-admin!!";
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
    const response = await createTestUser(request, token, e2ePrefix);
    expect(response.status()).toBe(201);
    const { data: createdData } = await response.json();
    expect(typeof createdData === "object").toBe(true);
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
    const createUserResponse = await createTestUser(request, token, `${e2ePrefix}-delete`);
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
