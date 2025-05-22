import { expect } from "@playwright/test";
import { adminCredentials } from "./settings";


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

  export const createTestUser = async (request, token, e2ePrefix = "e2e!!") => {
    await updateEnvVar(request, "USERS_CAN_REGISTER", "true");

    const response = await request.post(`/api/v1/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        data: {
          email: `${e2ePrefix}@test.com`,
          password: "password",
          firstName: "Demo",
          lastName: "User",
        },
      },
    });

    return response.json();
  };

  export const createTestPost = async (request, token, body) => {
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

  export const cleanup = async (request, token, table, field, likeValue) => {
    console.log("Cleaning up", table, field, likeValue);
    if (table && field && likeValue) {
      const response = await request.post(`/api/v1/test/e2e/cleanup`, {
        headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        table: table,
        field: field,
        likeValue: likeValue,
      },
    });
  
      expect(response.status()).toBe(200);
    }
  };