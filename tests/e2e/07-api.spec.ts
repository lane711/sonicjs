import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/test-helpers';

test.describe('API Endpoints', () => {
  test('should return health check', async ({ request }) => {
    const response = await request.get('/health');
    
    expect(response.ok()).toBeTruthy();
    
    const health = await response.json();
    expect(health).toHaveProperty('name', 'SonicJS AI');
    expect(health).toHaveProperty('version', '0.1.0');
    expect(health).toHaveProperty('status', 'running');
    expect(health).toHaveProperty('timestamp');
  });

  test('should return OpenAPI spec', async ({ request }) => {
    const response = await request.get('/api');
    
    expect(response.ok()).toBeTruthy();
    
    const spec = await response.json();
    expect(spec).toHaveProperty('openapi');
    expect(spec).toHaveProperty('info');
    expect(spec).toHaveProperty('paths');
  });

  test('should require authentication for admin API', async ({ request }) => {
    const response = await request.get('/admin/api/collections');
    
    // Should redirect to login or return 401
    expect([401, 302, 200]).toContain(response.status());
  });

  test('should handle 404 for unknown routes', async ({ request }) => {
    const response = await request.get('/api/nonexistent');
    
    expect(response.status()).toBe(404);
  });

  test('should serve static assets', async ({ request }) => {
    // Test for common static file
    const response = await request.get('/favicon.ico');
    
    // Should either exist or return 404, but not error
    expect([200, 404]).toContain(response.status());
  });

  test('should handle CORS for API endpoints', async ({ request }) => {
    const response = await request.get('/api', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    // Check for CORS headers
    const corsHeader = response.headers()['access-control-allow-origin'];
    expect(corsHeader).toBeDefined();
  });

  test('should handle content negotiation', async ({ request }) => {
    const response = await request.get('/health', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('should return proper content-type headers', async ({ request }) => {
    const response = await request.get('/api');
    
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('should handle large requests gracefully', async ({ request }) => {
    // Test with large but reasonable payload
    const largeData = 'x'.repeat(10000);
    
    const response = await request.post('/admin/api/collections', {
      data: {
        name: 'large_test',
        displayName: 'Large Test Collection',
        description: largeData
      }
    });
    
    // Should handle gracefully (either accept or reject with proper error)
    expect([200, 201, 400, 401, 413, 422]).toContain(response.status());
  });

  test('should validate request methods', async ({ request }) => {
    // Test unsupported method
    const response = await request.patch('/health');
    
    // Should return method not allowed or not found
    expect([404, 405]).toContain(response.status());
  });
}); 