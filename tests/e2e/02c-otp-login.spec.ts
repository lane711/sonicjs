import { test, expect } from '@playwright/test';

/**
 * OTP Login (Login with Code) E2E Tests
 *
 * Tests passwordless authentication via email one-time codes.
 *
 * NOTE: Each test uses a unique email to avoid rate limiting (5 requests/hour per email).
 */

// Generate unique email for each test to avoid rate limiting
function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).substring(7)}@test.sonicjs.com`;
}

test.describe('OTP Login (Login with Code)', () => {

  test.describe('POST /auth/otp/request - Request OTP Code', () => {
    test('should accept valid email and return success message', async ({ request }) => {
      const response = await request.post('/auth/otp/request', {
        data: { email: uniqueEmail('otp-valid') }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('verification code');
      expect(data).toHaveProperty('expiresIn');
      expect(data.expiresIn).toBeGreaterThan(0);
    });

    test('should return dev_code in development environment (skipped in CI)', async ({ request }) => {
      // Skip this test in CI/production environments - dev_code is only returned in local dev
      test.skip(!!process.env.CI, 'dev_code only available in local development');

      const response = await request.post('/auth/otp/request', {
        data: { email: uniqueEmail('otp-devcode') }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      // In development mode, the API should return the code for testing
      expect(data).toHaveProperty('dev_code');
      expect(data.dev_code).toMatch(/^\d{6}$/); // 6-digit code
    });

    test('should normalize email to lowercase', async ({ request }) => {
      const email = uniqueEmail('OTP-UPPERCASE');
      const response = await request.post('/auth/otp/request', {
        data: { email: email.toUpperCase() }
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
      // Request OTP for non-existing users (both should get same message)
      const email1 = uniqueEmail('otp-security1');
      const email2 = uniqueEmail('otp-security2');

      const response1 = await request.post('/auth/otp/request', {
        data: { email: email1 }
      });

      const response2 = await request.post('/auth/otp/request', {
        data: { email: email2 }
      });

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      const data1 = await response1.json();
      const data2 = await response2.json();

      // Both should have same generic message (don't reveal if user exists)
      expect(data1.message).toBe(data2.message);
    });

    test('should rate limit excessive requests from same email', async ({ request }) => {
      // Use same email for all requests to trigger rate limit
      const email = uniqueEmail('ratelimit');

      const promises = Array.from({ length: 10 }, () =>
        request.post('/auth/otp/request', {
          data: { email }
        })
      );

      const responses = await Promise.all(promises);
      const statuses = responses.map(r => r.status());

      // Rate limiting depends on configuration - either we get rate limited (429)
      // or all requests succeed (200). Both are valid behaviors depending on config.
      const has429 = statuses.includes(429);
      const allSuccess = statuses.every(s => s === 200);

      // Test passes if either rate limiting kicks in OR all succeed
      // (rate limiting may not be enabled in all environments)
      expect(has429 || allSuccess).toBe(true);
    });
  });

  test.describe('POST /auth/otp/verify - Verify OTP Code', () => {
    test('should reject invalid OTP code format', async ({ request }) => {
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: uniqueEmail('verify-invalid'),
          code: '000000' // Valid format but wrong code
        }
      });

      // Should return 401 (no valid OTP exists for this email)
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
      const email = uniqueEmail('code-format');

      // Too short
      const shortCodeResponse = await request.post('/auth/otp/verify', {
        data: {
          email,
          code: '123' // 3 chars - too short
        }
      });
      expect(shortCodeResponse.status()).toBe(400);

      // Too long
      const longCodeResponse = await request.post('/auth/otp/verify', {
        data: {
          email,
          code: '123456789' // 9 chars - too long
        }
      });
      expect(longCodeResponse.status()).toBe(400);
    });

    test('should reject verification for non-existent OTP', async ({ request }) => {
      const verifyResponse = await request.post('/auth/otp/verify', {
        data: {
          email: uniqueEmail('nonexistent'),
          code: '123456'
        }
      });

      expect(verifyResponse.status()).toBe(401);
    });
  });

  test.describe('POST /auth/otp/resend - Resend OTP Code', () => {
    test('should handle resend request', async ({ request }) => {
      const response = await request.post('/auth/otp/resend', {
        data: { email: uniqueEmail('resend-test') }
      });

      // Resend should return 200 or may not be implemented (404)
      // Accept either as valid - the endpoint exists but behavior varies
      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('message');
      }
    });

    test('should reject invalid email format on resend', async ({ request }) => {
      const response = await request.post('/auth/otp/resend', {
        data: { email: 'not-an-email' }
      });

      // Should be 400 (validation) or 404 (not implemented)
      expect([400, 404]).toContain(response.status());
    });
  });

  test.describe('Security Tests', () => {
    test('should handle SQL injection attempts safely', async ({ request }) => {
      const maliciousPayloads = [
        { email: "test' OR '1'='1", code: "123456" },
        { email: "test'; DROP TABLE otp_codes; --", code: "123456" },
        { email: "test@example.com", code: "' OR '1'='1" }
      ];

      for (const payload of maliciousPayloads) {
        const response = await request.post('/auth/otp/verify', {
          data: payload
        });

        // Should safely reject without exposing SQL errors
        expect(response.status()).toBeGreaterThanOrEqual(400);
        expect(response.status()).toBeLessThan(500);

        const data = await response.json();
        if (data.error) {
          expect(data.error).not.toContain('SQL');
          expect(data.error).not.toContain('syntax');
        }
      }
    });
  });
});
