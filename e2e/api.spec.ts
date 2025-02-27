import { test, expect } from '@playwright/test';

test('should not allow unauthenticated user to create a user', async ({ request }) => {
    const response = await request.post(`/api/v1/users`, {
      data: {
        username: 'newuser',
        password: 'password123',
      }
    });
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual(expect.objectContaining({
      error: 'Unauthorized'
    }));
  });

test('should not allow unauthenticated user to access /api/v1/users', async ({ request }) => {
    const response = await request.get(`/api/v1/users`);
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual(expect.objectContaining({
      error: 'Unauthorized'
    }));
  });
test('should not allow unauthenticated user to create a user', async ({ request }) => {
    const response = await request.post(`/api/v1/users`, {
      data: {
        username: 'newuser',
        password: 'password123',
      }
    });
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual(expect.objectContaining({
      error: 'Unauthorized'
    }));
  });

test('should create a bug report', async ({ request }) => {
    const newIssue = await request.post(`/api/v1/posts`, {
      data: {
        title: '[Bug] report 1',
        body: 'Bug description',
      }
    });
    expect(newIssue.ok()).toBeTruthy();
  
    const issues = await request.get(`/api/v1/posts`);
    expect(issues.ok()).toBeTruthy();
    expect(await issues.json()).toContainEqual(expect.objectContaining({
      title: '[Bug] report 1',
      body: 'Bug description'
    }));
  });

test('should create a bug report', async ({ request }) => {
    const newIssue = await request.post(`/api/v1/posts`, {
      data: {
        title: '[Bug] report 1',
        body: 'Bug description',
      }
    });
    expect(newIssue.ok()).toBeTruthy();
  
    const issues = await request.get(`/api/v1/posts`);
    expect(issues.ok()).toBeTruthy();
    expect(await issues.json()).toContainEqual(expect.objectContaining({
      title: '[Bug] report 1',
      body: 'Bug description'
    }));
  });