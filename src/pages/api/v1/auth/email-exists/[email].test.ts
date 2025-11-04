import { describe, expect, test, vi } from 'vitest';
import { GET } from './[email]';
import { doesEmailExist } from '@services/auth';

vi.mock('@services/auth', () => ({
  doesEmailExist: vi.fn()
}));

describe('Email Exists Endpoint', () => {
  test('should return exists: false when email does not exist', async () => {
    // Mock the context
    const context = {
      params: { email: 'test@example.com' },
      locals: {
        runtime: {
          env: {
            D1: {}
          }
        }
      }
    };

    // Mock the doesEmailExist function
    vi.mocked(doesEmailExist).mockResolvedValue({ exists: false, confirmed: false });

    const response = await GET(context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ exists: false, confirmed: false });
    expect(doesEmailExist).toHaveBeenCalledWith(context.locals.runtime.env.D1, 'test@example.com');
  });

  test('should return exists: true when email exists', async () => {
    // Mock the context
    const context = {
      params: { email: 'existing@example.com' },
      locals: {
        runtime: {
          env: {
            D1: {}
          }
        }
      }
    };

    // Mock the doesEmailExist function
    vi.mocked(doesEmailExist).mockResolvedValue({ exists: true, confirmed: true });

    const response = await GET(context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ exists: true, confirmed: true });
    expect(doesEmailExist).toHaveBeenCalledWith(context.locals.runtime.env.D1, 'existing@example.com');
  });

  test('should handle URL encoded email addresses', async () => {
    // Mock the context with URL encoded email
    const context = {
      params: { email: 'test%40example.com' },
      locals: {
        runtime: {
          env: {
            D1: {}
          }
        }
      }
    };

    // Mock the doesEmailExist function
    vi.mocked(doesEmailExist).mockResolvedValue({ exists: false, confirmed: false });

    const response = await GET(context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ exists: false, confirmed: false });
    expect(doesEmailExist).toHaveBeenCalledWith(context.locals.runtime.env.D1, 'test@example.com');
  });
}); 