import { adminCredentials } from "./index.spec";

export const cleanup = async (request, token, expect) => {
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