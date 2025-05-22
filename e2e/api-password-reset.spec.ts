import test, { expect } from "@playwright/test";
import {
  cleanup,
  createTestUser,
  loginAsAdmin,
  updateEnvVar,
} from "./e2e-helpers";
import { getRecords } from "@services/data";

var token = "";
const e2ePrefix = "e2e.reset";
test.describe("Preset Password API Tests", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ request }) => {
    token = await loginAsAdmin(request);
    await cleanup(request, token, "users", "email", e2ePrefix);
  });

  test("should return 404 for non-existent email", async ({ request }) => {
    const response = await request.get(
      `/api/v1/auth/password/reset/test@test.com`
    );
    expect(response.status()).toBe(404);
    const json = await response.json();
    expect(json.message).toEqual("Not Found");
  });

  test("should send password reset email", async ({ request }) => {
    await updateEnvVar(request, "EMAIL_ENABLED", "false");
    const userEmail = `${e2ePrefix}-no-confirmation`;

    const createUserResponse = await createTestUser(request, token, userEmail);


    const response = await request.get(
      `/api/v1/auth/password/reset/${encodeURIComponent(createUserResponse.data.email)}`
    );
    expect(response.status()).toBe(200);

    //check that the user has a password reset code
    const user = await getRecords(request, "users", {
      filters: {
        email: {
          $eq: userEmail,
        },
      },
    });

    expect(user.data.length).toBe(1);
    expect(user.data[0].passwordResetCode).toBeDefined();
    expect(user.data[0].passwordResetCodeExpiresOn).toBeDefined();
  });

  test("should allow unauthenticated user to register with email confirmation", async ({
    request,
  }) => {
    await updateEnvVar(request, "USERS_CAN_REGISTER", "true");
    await updateEnvVar(request, "REQUIRE_EMAIL_CONFIRMATION", "true");
    await updateEnvVar(
      request,
      "EMAIL_CONFIRMATION_REDIRECT_URL",
      "https://sonicjs.com"
    );

    const response = await request.post(`/api/v1/users`, {
      data: {
        data: {
          email: `${e2ePrefix}-with-confirmation@test.com`,
          password: "newpassword123abc",
          firstName: "Demo",
          lastName: "User",
        },
      },
    });
    expect(response.status()).toBe(201);
    const { data } = await response.json();

    expect(data.id).toEqual(expect.any(String));
    expect(data.email).toEqual(`${e2ePrefix}-with-confirmation@test.com`);
    expect(data.firstName).toEqual("Demo");
    expect(data.lastName).toEqual("User");

    //now get user again so we can check the email confirmed status
    const response2 = await request.get(`/api/v1/users/${data.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response2.status()).toBe(200);
    const { data: userData } = await response2.json();
    expect(userData.role).toEqual("user");
    expect(userData.emailConfirmationToken).toEqual(expect.any(String));

    //now simulate the email confirmation link being clicked
    const response3 = await request.get(
      `/api/v1/auth/email-confirmation/receive/${userData.emailConfirmationToken}`
    );
    const status = response3.status();
    expect(response3.status()).toBe(200); // 302 is redirect status code
    // expect(response3.headers()['location']).toBe('https://sonicjs.com');

    //now confirm user has been confirmed
    const response4 = await request.get(`/api/v1/users/${data.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response4.status()).toBe(200);
    const { data: userDataAfterConfirmation } = await response4.json();
    expect(userDataAfterConfirmation.emailConfirmedOn).not.toBeNull();
  });

  test("should not allow duplicate email to register", async ({ request }) => {
    await updateEnvVar(request, "USERS_CAN_REGISTER", "true");
    await updateEnvVar(request, "REQUIRE_EMAIL_CONFIRMATION", "false");

    const response = await request.post(`/api/v1/users`, {
      data: {
        data: {
          email: `${e2ePrefix}-duplicate@test.com`,
          password: "newpassword123abc",
          firstName: "Demo",
          lastName: "User",
        },
      },
    });
    expect(response.status()).toBe(201);
    const { data } = await response.json();

    expect(data.id).toEqual(expect.any(String));

    // second request with same email should fail
    const response2 = await request.post(`/api/v1/users`, {
      data: {
        data: {
          email: `${e2ePrefix}-duplicate@test.com`,
          password: "newpassword123abc",
          firstName: "Demo",
          lastName: "User",
        },
      },
    });
    expect(response2.status()).toBe(500);
    const { message } = await response2.json();

    expect(message.toLowerCase()).toContain("unique");
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, token, "users", "email", e2ePrefix);
  });
});
