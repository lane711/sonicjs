import test, { expect } from "@playwright/test";
import {
  cleanup,
  createTestUser,
  getEnvVar,
  getTestUser,
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
    await updateEnvVar(request, "EMAIL_ENABLED", "false");
    await cleanup(request, token, "users", "email", e2ePrefix);
  });

  test("should get and set testing env vars", async ({ request }) => {
    const updatedVars = await updateEnvVar(request, "e2e_reset_test", "abc");
    expect(updatedVars.key).toEqual("e2e_reset_test");
    expect(updatedVars.value).toEqual("abc");

    const envVar = await getEnvVar(request, "e2e_reset_test");
    expect(envVar.value).toEqual("abc");
  });

  test("should return 404 for non-existent email", async ({ request }) => {
    const response = await request.get(
      `/api/v1/auth/password/reset/send/test@test.com`
    );
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.message).toEqual(
      "If the email address is valid, a password reset email has been sent"
    );
    const envVar = await getEnvVar(request, "e2e_forgot_password");
    expect(envVar.value).toEqual("user not found");
  });

  test("should send password reset email", async ({ request }) => {
    const userEmail = `${e2ePrefix}-no-confirmation`;

    const createUserResponse = await createTestUser(request, token, userEmail);

    const response = await request.get(
      `/api/v1/auth/password/reset/send/${encodeURIComponent(createUserResponse.data.email)}`
    );
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.message).toEqual(
      "If the email address is valid, a password reset email has been sent"
    );

    //check that the user has a password reset code
    const user = await getTestUser(request, token, createUserResponse.data.id);

    expect(user.data.passwordResetCode).toBeDefined();
    expect(user.data.passwordResetCodeExpiresOn).toBeDefined();
    const envVar = await getEnvVar(request, "e2e_forgot_password");
    expect(envVar.value).toEqual("email sent");
  });

  test("should receive password reset and update password", async ({
    request,
  }) => {
    const userEmail = `${e2ePrefix}-update-password`;

    const createUserResponse = await createTestUser(request, token, userEmail);

    const response = await request.get(
      `/api/v1/auth/password/reset/send/${encodeURIComponent(createUserResponse.data.email)}`
    );
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.message).toEqual(
      "If the email address is valid, a password reset email has been sent"
    );

    //check that the user has a password reset code
    const user = await getTestUser(request, token, createUserResponse.data.id);

    expect(response.status()).toBe(200);
    expect(user.data.passwordResetCode).toBeDefined();
    expect(user.data.passwordResetCodeExpiresOn).toBeDefined();
    const envVar = await getEnvVar(request, "e2e_forgot_password");
    expect(envVar.value).toEqual("email sent");

    // simulate user updating password with new password and code
    const responseUpdated = await request.post(
      `/api/v1/auth/password/reset/receive`,
      {
        data: {
          email: createUserResponse.data.email,
          password: "newPassword",
          code: user.data.passwordResetCode,
        },
      }
    );

    expect(responseUpdated.status()).toBe(200);
    const jsonUpdated = await responseUpdated.json();
    expect(jsonUpdated.message).toEqual("Password updated successfully");

    const userUpdated = await getTestUser(
      request,
      token,
      createUserResponse.data.id
    );

    expect(userUpdated.data.password).toEqual("newPassword");
    expect(userUpdated.data.passwordResetCode).toBeNull();
    expect(userUpdated.data.passwordResetCodeExpiresOn).toBeNull();
    // const envVar = await getEnvVar(request, "e2e_forgot_password");
    // expect(envVar.value).toEqual("password updated");
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, token, "users", "email", e2ePrefix);
  });
});
