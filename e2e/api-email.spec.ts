// import { test, expect } from "@playwright/test";
// import { purgeE2eTestData } from "@services/e2e";

// // Annotate entire file as serial.
// test.describe.configure({ mode: "serial" });

// const adminCredentials = {
//   email: "demo@demo.com",
//   password: "sonicjs!",
// };
// var token = "";

// test.beforeAll(async ({ request }) => {
//   token = await loginAsAdmin(request);
//   await cleanup(request, token);
// });

// async function loginAsAdmin(request) {
//   const response = await request.post(`/api/v1/auth/login`, {
//     data: adminCredentials,
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
//   const { bearer } = await response.json();
//   return bearer;
// }

// test("should allow admin to send email /api/v1/email", async ({ request }) => {
//   const emailBody = {
//     to: "z@z.com",
//     subject: "Hello World",
//     template: "magic-link",
//     templateData: {
//       otp: "123456",
//     },
//   };
  
//   const responseLogout = await request.post(`/api/v1/email`, {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     data: emailBody,
//   });
//   expect(responseLogout.status()).toBe(200);
//   const { message } = await responseLogout.json();
// });

// test.afterEach(async ({ request }) => {
//   await cleanup(request, token);
// });

// const cleanup = async (request, token) => {
//   const response = await request.post(`/api/v1/test/e2e/cleanup`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   expect(response.status()).toBe(200);
// };

// const createTestUser = async (request, token) => {
//   const response = await request.post(`/api/v1/users`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     data: {
//       data: {
//         email: "e2e!!@test.com",
//         password: "newpassword123abc",
//         firstName: "Demo",
//         lastName: "User",
//       },
//     },
//   });

//   return response;
// };
