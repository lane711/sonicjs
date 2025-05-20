import test, { expect } from "@playwright/test";
import { updateEnvVar } from "./e2e-helpers";

test("should not allow unauthenticated user to create a user", async ({
  request,
}) => {
  await updateEnvVar(request, "USERS_CAN_REGISTER", "false");
  const response = await request.post(`/api/v1/users`, {
    data: {
      data: {
        username: "newuser",
        password: "password123",
      },
    },
  });
  expect(response.status()).toBe(401);
  const json = await response.json();
  expect(json.message).toEqual("Unauthorized");
});

test("should allow unauthenticated user to register", async ({ request }) => {
  await updateEnvVar(request, "USERS_CAN_REGISTER", "true");
  const response = await request.post(`/api/v1/users`, {
    data: {
      data: {
        email: "e2e!!@test.com",
        password: "newpassword123abc",
        firstName: "Demo",
        lastName: "User",
      },
    },
  });
  expect(response.status()).toBe(201);
  const { data } = await response.json();
  console.log("data-->", data);

  expect(data.id).toEqual(expect.any(String));
});