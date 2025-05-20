import { expect } from "@playwright/test";
import { adminCredentials } from "./settings";

export const cleanup = async (request, token) => {
    const response = await request.post(`/api/v1/test/e2e/cleanup`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    expect(response.status()).toBe(200);
  };

  export const loginAsAdmin = async (request) => {
    const response = await request.post(`/api/v1/auth/login`, {
      data: adminCredentials,
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { bearer } = await response.json();
    return bearer;
  }

  export const createTestUser = async (request, token) => {
    await updateEnvVar(request, "USERS_CAN_REGISTER", "true");

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

  export const updateEnvVar = async (request, key, value) => {
    const token = await loginAsAdmin(request);
    const response = await request.get(`/api/v1/test/vars/set?${key}=${value}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data).toEqual({
      key: key,
      value: value
    });

    return response;
  }