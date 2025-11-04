import { describe, expect, test, vi } from 'vitest';
import { POST } from './[table]';
import { hashString } from '@services/cyrpt';
import { apiConfig } from '../../../db/routes';
import type { APIContext } from 'astro';

vi.mock('@services/cyrpt', () => ({
  hashString: vi.fn().mockResolvedValue('hashed_password')
}));

vi.mock('@services/data', () => ({
  insertRecord: vi.fn().mockImplementation(async (d1, kv, content) => {
    return {
      status: 201,
      data: {
        id: 'test-id',
        ...content.data,
        password: 'hashed_password' // The password should be hashed
      }
    };
  })
}));



describe('User Registration Endpoint', () => {
  const createMockContext = (requestData: any) => ({
    params: { table: 'users' },
    locals: {
      runtime: {
        env: {
          D1: {},
          isAdminAccountCreated: true
        }
      }
    },
    request: {
      json: vi.fn().mockResolvedValue(requestData)
    },
    site: new URL('http://localhost'),
    generator: 'test',
    url: new URL('http://localhost/api/v1/users'),
    props: {},
    redirect: vi.fn(),
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    },
    clientAddress: '127.0.0.1'
  } as unknown as APIContext);

  test('should successfully register a new user', async () => {
    const context = createMockContext({
      data: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }
    });

    const response = await POST(context);
    const user = await response.json() as { data: { email: string; firstName: string; lastName: string } };

    expect(response.status).toBe(201);
    expect(user).toHaveProperty('data');
    expect(user.data).toHaveProperty('email', 'test@example.com');
    expect(user.data).toHaveProperty('firstName', 'John');
    expect(user.data).toHaveProperty('lastName', 'Doe');
    expect(user.data).not.toHaveProperty('password'); // Password should not be returned
    expect(hashString).toHaveBeenCalledWith('password123');
  });

  test('should handle registration with role', async () => {
    const context = createMockContext({
      data: {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    });

    // Override isAdminAccountCreated for this test
    context.locals.runtime.env.isAdminAccountCreated = false;

    const response = await POST(context);
    const data = await response.json() as { data: { role: string } };

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('role', 'admin');
  });

  test('should return 401 when unauthorized', async () => {
    const context = createMockContext({
      data: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }
    });

    // Mock the access control to return false
    const createAccess = apiConfig[0].access.operation.create as ReturnType<typeof vi.fn>;
    createAccess.mockReturnValue(false);

    const response = await POST(context);
    expect(response.status).toBe(401);
  });

  test('should return 500 when data is not wrapped in data object', async () => {
    const context = createMockContext({
      email: 'test@example.com',
      password: 'password123'
    });

    const response = await POST(context);
    expect(response.status).toBe(500);
  });
}); 