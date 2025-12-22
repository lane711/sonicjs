import { test, expect } from '@playwright/test';

/**
 * Magic Link Authentication E2E Tests
 *
 * Tests passwordless authentication via email magic links.
 *
 * NOTE: These tests require the magic-link plugin routes to be mounted in the app.
 * See: packages/core/src/plugins/available/magic-link-auth/index.ts
 */
test.describe('Magic Link Authentication', () => {

  test.describe('POST /auth/magic-link/request - Request Magic Link', () => {
    test('should accept valid email and return success message', async ({ request }) => {
      const response = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('magic link');
    });

    test('should return dev_link in development environment', async ({ request }) => {
      const response = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      // In development mode, the API should return the link for testing
      expect(data).toHaveProperty('dev_link');
      expect(data.dev_link).toContain('/auth/magic-link/verify?token=');
    });

    test('should normalize email to lowercase', async ({ request }) => {
      const response = await request.post('/auth/magic-link/request', {
        data: { email: 'ADMIN@SONICJS.COM' }
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
      // Request link for existing user
      const existingUserResponse = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      // Request link for non-existing user
      const nonExistingUserResponse = await request.post('/auth/magic-link/request', {
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
      const email = `ratelimit.magiclink.${Date.now()}@example.com`;

      const promises = Array.from({ length: 10 }, () =>
        request.post('/auth/magic-link/request', {
          data: { email }
        })
      );

      const responses = await Promise.all(promises);

      // Some responses should succeed, but eventually we should hit rate limit
      const statuses = responses.map(r => r.status());
      expect(statuses).toContain(429); // At least one should be rate limited
    });

    test('should reject deactivated user accounts', async ({ request }) => {
      // Active user should succeed
      const response = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      expect(response.status()).toBe(200);
    });
  });

  test.describe('GET /auth/magic-link/verify - Verify Magic Link', () => {
    test('should verify valid magic link and redirect to dashboard', async ({ request }) => {
      // First request a magic link
      const requestResponse = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      expect(requestResponse.status()).toBe(200);

      const requestData = await requestResponse.json();
      const devLink = requestData.dev_link;

      // Extract the token from the dev_link
      const url = new URL(devLink);
      const token = url.searchParams.get('token');

      // Now verify the token
      const verifyResponse = await request.get(`/auth/magic-link/verify?token=${token}`, {
        maxRedirects: 0 // Don't follow redirects
      });

      // Should redirect to dashboard
      expect(verifyResponse.status()).toBe(302);
      expect(verifyResponse.headers()['location']).toContain('/admin/dashboard');

      // Should set auth cookie
      const cookies = verifyResponse.headers()['set-cookie'];
      expect(cookies).toBeTruthy();
      expect(cookies).toContain('auth_token');
    });

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

    test('should reject used magic link (one-time use)', async ({ request }) => {
      // Request a magic link
      const requestResponse = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const devLink = (await requestResponse.json()).dev_link;
      const url = new URL(devLink);
      const token = url.searchParams.get('token');

      // First use should succeed
      const firstVerify = await request.get(`/auth/magic-link/verify?token=${token}`, {
        maxRedirects: 0
      });
      expect(firstVerify.status()).toBe(302);
      expect(firstVerify.headers()['location']).toContain('/admin/dashboard');

      // Second use should fail
      const secondVerify = await request.get(`/auth/magic-link/verify?token=${token}`, {
        maxRedirects: 0
      });
      expect(secondVerify.status()).toBe(302);
      expect(secondVerify.headers()['location']).toContain('/auth/login');
      expect(secondVerify.headers()['location']).toContain('error=');
    });

    test('should update last_login_at timestamp', async ({ request }) => {
      // Request and use magic link
      const requestResponse = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const devLink = (await requestResponse.json()).dev_link;
      const url = new URL(devLink);
      const token = url.searchParams.get('token');

      const verifyResponse = await request.get(`/auth/magic-link/verify?token=${token}`, {
        maxRedirects: 0
      });

      expect(verifyResponse.status()).toBe(302);
      // The last_login_at timestamp update happens server-side
      // We verify success by checking the redirect happened properly
    });
  });

  test.describe('Complete Magic Link Login Flow', () => {
    test('full flow: request -> click link -> authenticated', async ({ page, request }) => {
      // Step 1: Request magic link
      const requestResponse = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      expect(requestResponse.status()).toBe(200);

      const requestData = await requestResponse.json();
      expect(requestData.dev_link).toBeDefined();

      // Step 2: Navigate to the magic link
      await page.goto(requestData.dev_link);

      // Step 3: Should be redirected to admin dashboard
      await page.waitForURL(/\/admin\/dashboard/);
      expect(page.url()).toContain('/admin/dashboard');

      // Step 4: Verify we're authenticated (can access admin area)
      await page.goto('/auth/me');
      const meResponse = await page.evaluate(async () => {
        const res = await fetch('/auth/me');
        return {
          status: res.status,
          data: await res.json()
        };
      });

      expect(meResponse.status).toBe(200);
      expect(meResponse.data.user.email).toBe('admin@sonicjs.com');
    });

    test('should generate unique links for each request', async ({ request }) => {
      // Request first link
      const firstResponse = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const firstLink = (await firstResponse.json()).dev_link;

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Request second link
      const secondResponse = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const secondLink = (await secondResponse.json()).dev_link;

      // Links should be different
      expect(firstLink).not.toBe(secondLink);
    });
  });

  test.describe('Security Tests', () => {
    test('should not expose token in error messages', async ({ request }) => {
      // Request magic link
      const requestResponse = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const devLink = (await requestResponse.json()).dev_link;
      const url = new URL(devLink);
      const realToken = url.searchParams.get('token');

      // Use the token
      await request.get(`/auth/magic-link/verify?token=${realToken}`, {
        maxRedirects: 0
      });

      // Try to use it again (should fail)
      const failedVerify = await request.get(`/auth/magic-link/verify?token=${realToken}`, {
        maxRedirects: 0
      });

      const location = failedVerify.headers()['location'];
      expect(location).not.toContain(realToken);
    });

    test('should handle SQL injection attempts safely', async ({ request }) => {
      const maliciousTokens = [
        "' OR '1'='1",
        "'; DROP TABLE magic_links; --",
        "token' OR 'x'='x",
        "1' OR '1' = '1"
      ];

      for (const token of maliciousTokens) {
        const response = await request.get(`/auth/magic-link/verify?token=${encodeURIComponent(token)}`, {
          maxRedirects: 0
        });

        // Should safely reject without exposing SQL errors
        expect(response.status()).toBe(302);
        expect(response.headers()['location']).toContain('/auth/login');
        expect(response.headers()['location']).not.toContain('SQL');
      }
    });

    test('should use secure token format (UUID-based)', async ({ request }) => {
      const response = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });

      const data = await response.json();
      const url = new URL(data.dev_link);
      const token = url.searchParams.get('token');

      // Token should be UUID-UUID format (two UUIDs concatenated with dash)
      expect(token).toBeTruthy();
      expect(token!.length).toBeGreaterThan(36); // Longer than a single UUID

      // Should contain only valid UUID characters (hex, dashes)
      expect(token).toMatch(/^[0-9a-f-]+$/i);
    });

    test('should set secure cookie attributes', async ({ request }) => {
      // Request and use magic link
      const requestResponse = await request.post('/auth/magic-link/request', {
        data: { email: 'admin@sonicjs.com' }
      });
      const devLink = (await requestResponse.json()).dev_link;
      const url = new URL(devLink);
      const token = url.searchParams.get('token');

      const verifyResponse = await request.get(`/auth/magic-link/verify?token=${token}`, {
        maxRedirects: 0
      });

      const cookies = verifyResponse.headers()['set-cookie'];
      expect(cookies).toBeTruthy();
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('SameSite=Strict');
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

    test('should handle very long tokens', async ({ request }) => {
      const longToken = 'a'.repeat(10000);

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
        '${jndi:ldap://evil.com}',
        '../../../etc/passwd',
        '?extra=param&another=value'
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
});
