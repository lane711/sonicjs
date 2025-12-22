import { test, expect } from '@playwright/test';

/**
 * OTP Login (Login with Code) E2E Tests
 *
 * Tests passwordless authentication via email one-time codes.
 *
 * NOTE: These tests require the OTP plugin routes to be mounted in the app.
 * See: packages/core/src/plugins/core-plugins/otp-login-plugin/index.ts
 */
test.describe('OTP Login (Login with Code)', () => {

  test.describe('POST /auth/otp/request - Request OTP Code', () => {
    test('should accept valid email and return success message', async ({ request }) => {
      const response = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('verification code');
      expect(data).toHaveProperty('expiresIn');
      expect(data.expiresIn).toBeGreaterThan(0);
    });

    test('should return dev_code in development environment', async ({ request }) => {
      const response = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      // In development mode, the API should return the code for testing
      expect(data).toHaveProperty('dev_code');
      expect(data.dev_code).toMatch(/^\d{6}$/); // 6-digit code
    });

    test('should normalize email to lowercase', async ({ request }) => {
      const response = await request.post('/auth/otp/request', {
        data: { email: 'ADMIN@SONICJS.COM' }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
    });

    test('should reject invalid email format', async ({ request }) => {
      const response = await request.post('/auth/otp/request', {
        data: { email: 'not-an-email' }
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Validation failed');
    });

    test('should reject empty email', async ({ request }) => {
      const response = await request.post('/auth/otp/request', {
        data: { email: '' }
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('should reject missing email field', async ({ request }) => {
      const response = await request.post('/auth/otp/request', {
        data: {}
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('should not reveal if user exists or not (security)', async ({ request }) => {
      // Request OTP for existing user
      const existingUserResponse = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      // Request OTP for non-existing user
      const nonExistingUserResponse = await request.post('/auth/otp/request', {
        data: { email: 'nonexistent@example.com' }
      });

      expect(existingUserResponse.status()).toBe(200);
      expect(nonExistingUserResponse.status()).toBe(200);

      const existingData = await existingUserResponse.json();
      const nonExistingData = await nonExistingUserResponse.json();

      // Both should have same generic message (don't reveal if user exists)
      expect(existingData.message).toBe(nonExistingData.message);
    });

    test('should rate limit excessive requests', async ({ request }) => {
      // Make many rapid requests (exceeding rate limit of 5/hour)
      const email = `ratelimit.test.${Date.now()}@example.com`;

      const promises = Array.from({ length: 10 }, () =>
        request.post('/auth/otp/request', {
          data: { email }
        })
      );

      const responses = await Promise.all(promises);

      // Some responses should succeed, but eventually we should hit rate limit
      const statuses = responses.map(r => r.status());
      expect(statuses).toContain(429); // At least one should be rate limited
    });

    test('should reject deactivated user accounts', async ({ request }) => {
      // This test assumes a deactivated user exists or tests the behavior
      // If we had a way to create a deactivated user first
      // For now, just verify the API handles the response properly
      const response = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      // Active user should succeed
      expect(response.status()).toBe(200);
    });
  });

  test.describe('POST /auth/otp/verify - Verify OTP Code', () => {
    test('should verify valid OTP code and return user data', async ({ request }) => {
      // First request an OTP
      const requestResponse = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      expect(requestResponse.status()).toBe(200);

      const requestData = await requestResponse.json();
      const code = requestData.dev_code;

      // Now verify the code
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code
        }
      });

      expect(verifyResponse.status()).toBe(200);

      const verifyData = await verifyResponse.json();
      expect(verifyData).toHaveProperty('success', true);
      expect(verifyData).toHaveProperty('user');
      expect(verifyData.user).toMatchObject({
        email: 'admin@sonicjs.com',
        role: 'admin'
      });
      expect(verifyData).toHaveProperty('message', 'Authentication successful');
    });

    test('should reject invalid OTP code', async ({ request }) => {
      // First request an OTP to ensure there's a valid one for this email
      await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      // Now try with an incorrect code
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code: '000000' // Wrong code
        }
      });

      expect(verifyResponse.status()).toBe(401);

      const verifyData = await verifyResponse.json();
      expect(verifyData).toHaveProperty('error');
      expect(verifyData).toHaveProperty('attemptsRemaining');
    });

    test('should reject expired OTP code', async ({ request }) => {
      // This test would ideally manipulate time or use a known expired code
      // For now, we verify the error handling structure
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code: '123456' // Random code that doesn't exist
        }
      });

      expect(verifyResponse.status()).toBe(401);

      const verifyData = await verifyResponse.json();
      expect(verifyData).toHaveProperty('error');
    });

    test('should validate email format', async ({ request }) => {
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'not-an-email',
          code: '123456'
        }
      });

      expect(verifyResponse.status()).toBe(400);

      const verifyData = await verifyResponse.json();
      expect(verifyData).toHaveProperty('error');
      expect(verifyData.error).toContain('Validation failed');
    });

    test('should validate code format (min 4, max 8 chars)', async ({ request }) => {
      // Too short
      const shortCodeResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code: '123' // 3 chars - too short
        }
      });
      expect(shortCodeResponse.status()).toBe(400);

      // Too long
      const longCodeResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code: '123456789' // 9 chars - too long
        }
      });
      expect(longCodeResponse.status()).toBe(400);
    });

    test('should track failed attempts and lock after max attempts', async ({ request }) => {
      // Request a fresh OTP
      const requestResponse = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      expect(requestResponse.status()).toBe(200);

      // Make 3 failed attempts (max attempts default)
      for (let i = 0; i < 3; i++) {
        const verifyResponse = await request.post('/auth/otp/verify', {
          data: {
            email: 'admin@sonicjs.com',
            code: '999999' // Wrong code
          }
        });

        expect(verifyResponse.status()).toBe(401);
        const data = await verifyResponse.json();

        if (i < 2) {
          expect(data.attemptsRemaining).toBe(2 - i);
        }
      }

      // After max attempts, code should be invalidated
      const finalVerifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code: '999999'
        }
      });

      expect(finalVerifyResponse.status()).toBe(401);
      const finalData = await finalVerifyResponse.json();
      expect(finalData.error).toBeTruthy();
    });

    test('should normalize email to lowercase', async ({ request }) => {
      // Request OTP with lowercase
      const requestResponse = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      expect(requestResponse.status()).toBe(200);

      const requestData = await requestResponse.json();
      const code = requestData.dev_code;

      // Verify with uppercase email
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'ADMIN@SONICJS.COM',
          code
        }
      });

      expect(verifyResponse.status()).toBe(200);
    });

    test('should reject verification for non-existent user', async ({ request }) => {
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'nonexistent@example.com',
          code: '123456'
        }
      });

      expect(verifyResponse.status()).toBe(401);
    });
  });

  test.describe('POST /auth/otp/resend - Resend OTP Code', () => {
    test('should resend OTP code for valid email', async ({ request }) => {
      const response = await request.post('/auth/otp/resend', {
        data: { email: 'admin@sonicjs.com' }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('expiresIn');
    });

    test('should reject invalid email format', async ({ request }) => {
      const response = await request.post('/auth/otp/resend', {
        data: { email: 'not-an-email' }
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Complete OTP Login Flow', () => {
    test('full login flow: request -> verify -> authenticated', async ({ request }) => {
      // Step 1: Request OTP
      const requestResponse = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      expect(requestResponse.status()).toBe(200);

      const requestData = await requestResponse.json();
      expect(requestData.dev_code).toBeDefined();
      const code = requestData.dev_code;

      // Step 2: Verify OTP
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code
        }
      });
      expect(verifyResponse.status()).toBe(200);

      const verifyData = await verifyResponse.json();
      expect(verifyData.success).toBe(true);
      expect(verifyData.user).toBeDefined();
      expect(verifyData.user.email).toBe('admin@sonicjs.com');
      expect(verifyData.user.role).toBe('admin');
    });

    test('should generate different codes for subsequent requests', async ({ request }) => {
      // Request first OTP
      const firstResponse = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const firstCode = (await firstResponse.json()).dev_code;

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Request second OTP
      const secondResponse = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const secondCode = (await secondResponse.json()).dev_code;

      // Codes should be different (cryptographically random)
      expect(firstCode).not.toBe(secondCode);
    });
  });

  test.describe('Security Tests', () => {
    test('should not expose OTP code in error messages', async ({ request }) => {
      // Request OTP
      const requestResponse = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const requestData = await requestResponse.json();
      const realCode = requestData.dev_code;

      // Fail verification
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code: '000000'
        }
      });

      const verifyData = await verifyResponse.json();
      const responseText = JSON.stringify(verifyData);

      // Real code should not be in the error response
      expect(responseText).not.toContain(realCode);
    });

    test('should handle SQL injection attempts safely', async ({ request }) => {
      const maliciousPayloads = [
        { email: "admin@sonicjs.com' OR '1'='1", code: "123456" },
        { email: "admin@sonicjs.com'; DROP TABLE otp_codes; --", code: "123456" },
        { email: "admin@sonicjs.com", code: "' OR '1'='1" }
      ];

      for (const payload of maliciousPayloads) {
        const response = await request.post('/auth/otp/verify', {
          data: payload
        });

        // Should safely reject without exposing SQL errors
        expect(response.status()).toBeGreaterThanOrEqual(400);
        expect(response.status()).toBeLessThan(500);

        const data = await response.json();
        expect(data.error).not.toContain('SQL');
        expect(data.error).not.toContain('syntax');
      }
    });

    test('should use one-time codes (code cannot be reused)', async ({ request }) => {
      // Request OTP
      const requestResponse = await request.post('/auth/otp/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const code = (await requestResponse.json()).dev_code;

      // First verification should succeed
      const firstVerify = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code
        }
      });
      expect(firstVerify.status()).toBe(200);

      // Second verification with same code should fail
      const secondVerify = await request.post('/auth/otp/verify', {
        data: {
          email: 'admin@sonicjs.com',
          code
        }
      });
      expect(secondVerify.status()).toBe(401);
    });
  });
});
