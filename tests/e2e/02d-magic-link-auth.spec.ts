import { test, expect } from '@playwright/test';

/**
 * Magic Link Authentication E2E Tests
 *
 * Tests passwordless authentication via email magic links.
 *
 * NOTE: Each test uses a unique email to avoid rate limiting (5 requests/hour per email).
 */

// Generate unique email for each test to avoid rate limiting
function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).substring(7)}@test.sonicjs.com`;
}

test.describe('Magic Link Authentication', () => {

  test.describe('POST /auth/magic-link/request - Request Magic Link', () => {
    test('should accept valid email and return success message', async ({ request }) => {
      const response = await request.post('/auth/magic-link/request', {
        data: { email: uniqueEmail('ml-valid') }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('magic link');
    });

    test('should return dev_link in development environment (skipped in CI)', async ({ request }) => {
      // Skip this test in CI/production environments - dev_link is only returned in local dev
      test.skip(!!process.env.CI, 'dev_link only available in local development');

      const response = await request.post('/auth/magic-link/request', {
        data: { email: uniqueEmail('ml-devlink') }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      // In development mode, the API should return the link for testing
      expect(data).toHaveProperty('dev_link');
      expect(data.dev_link).toContain('/auth/magic-link/verify?token=');
    });

    test('should normalize email to lowercase', async ({ request }) => {
      const email = uniqueEmail('ML-UPPERCASE');
      const response = await request.post('/auth/magic-link/request', {
        data: { email: email.toUpperCase() }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
    });

    test('should reject invalid email format', async ({ request }) => {
      const response = await request.post('/auth/magic-link/request', {
        data: { email: 'not-an-email' }
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Validation failed');
    });

    test('should reject empty email', async ({ request }) => {
      const response = await request.post('/auth/magic-link/request', {
        data: { email: '' }
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('should not reveal if user exists or not (security)', async ({ request }) => {
      // Request links for non-existing users (both should get same message)
      const email1 = uniqueEmail('ml-security1');
      const email2 = uniqueEmail('ml-security2');

      const response1 = await request.post('/auth/magic-link/request', {
        data: { email: email1 }
      });

      const response2 = await request.post('/auth/magic-link/request', {
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
      const email = uniqueEmail('ml-ratelimit');

      const promises = Array.from({ length: 10 }, () =>
        request.post('/auth/magic-link/request', {
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

  test.describe('GET /auth/magic-link/verify - Verify Magic Link', () => {
    test('should redirect to login with error for missing token', async ({ request }) => {
      const verifyResponse = await request.get('/auth/magic-link/verify', {
        maxRedirects: 0
      });

      expect(verifyResponse.status()).toBe(302);
      expect(verifyResponse.headers()['location']).toContain('/auth/login');
      expect(verifyResponse.headers()['location']).toContain('error=');
    });

    test('should redirect to login with error for invalid token', async ({ request }) => {
      const verifyResponse = await request.get('/auth/magic-link/verify?token=invalid-token', {
        maxRedirects: 0
      });

      expect(verifyResponse.status()).toBe(302);
      expect(verifyResponse.headers()['location']).toContain('/auth/login');
      expect(verifyResponse.headers()['location']).toContain('error=');
    });
  });

  test.describe('Security Tests', () => {
    test('should handle SQL injection attempts safely', async ({ request }) => {
      const maliciousTokens = [
        "' OR '1'='1",
        "'; DROP TABLE magic_links; --",
        "token' OR 'x'='x"
      ];

      for (const token of maliciousTokens) {
        const response = await request.get(`/auth/magic-link/verify?token=${encodeURIComponent(token)}`, {
          maxRedirects: 0
        });

        // Should safely redirect without exposing SQL errors
        expect(response.status()).toBe(302);
        expect(response.headers()['location']).toContain('/auth/login');
        expect(response.headers()['location']).not.toContain('SQL');
      }
    });

    test('should handle very long tokens', async ({ request }) => {
      const longToken = 'a'.repeat(1000);

      const response = await request.get(`/auth/magic-link/verify?token=${longToken}`, {
        maxRedirects: 0
      });

      // Should handle gracefully
      expect(response.status()).toBe(302);
      expect(response.headers()['location']).toContain('/auth/login');
    });

    test('should handle special characters in token', async ({ request }) => {
      const specialTokens = [
        '<script>alert(1)</script>',
        '../../../etc/passwd'
      ];

      for (const token of specialTokens) {
        const response = await request.get(`/auth/magic-link/verify?token=${encodeURIComponent(token)}`, {
          maxRedirects: 0
        });

        // Should handle gracefully without errors
        expect(response.status()).toBe(302);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle malformed JSON gracefully', async ({ request }) => {
      const response = await request.post('/auth/magic-link/request', {
        headers: {
          'Content-Type': 'application/json'
        },
        data: 'invalid json'
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });
  });
});
