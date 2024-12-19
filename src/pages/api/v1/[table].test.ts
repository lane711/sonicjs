import { describe, expect, test, vi } from 'vitest';
import { GET } from './[table]';
import { apiConfig } from '../../../db/routes';
import { getApiAccessControlResult, getItemReadResult } from '../../../auth/auth-helpers';
import { getRecords } from '../../../services/data';

vi.mock('../../../db/routes', () => ({
  apiConfig: [
    {
      route: 'test-table',
      table: 'test_table',
      access: {
        operation: { read: true },
        filter: { read: true },
        item: { read: true },
        fields: {},
      },
      hooks: {
        beforeOperation: vi.fn(),
        afterOperation: vi.fn(),
      },
    },
  ],
}));

vi.mock('../../../auth/auth-helpers', () => ({
  getApiAccessControlResult: vi.fn(),
  getItemReadResult: vi.fn(),
  filterReadFieldAccess: vi.fn(),
}));

vi.mock('../../../services/data', () => ({
  getRecords: vi.fn(),
}));

// vi.mock("../../../services/utils", () => ({ getEntryByRoute: vi.fn() }));

describe('GET /api/v1/:table', () => {
  test('returns 500 if table is not defined in schema', async () => {
    const context = {
      params: { table: 'undefined-table' },
      locals: { runtime: { env: {} } },
      request: { url: 'http://localhost/api/v1/undefined-table' },
    };

    const response = await GET(context as any);
    const result = await response.json() as { error: string };

    expect(response.status).toBe(500);
    expect(result.error).toBe('Table "undefined-table" not defined in your schema');
  });

  test('returns 401 if access control fails', async () => {
    const context = {
      params: { table: 'test-table' },
      locals: { runtime: { env: {} } },
      request: { url: 'http://localhost/api/v1/test-table' },
    };

    (getApiAccessControlResult as any).mockResolvedValue(false);

    const response = await GET(context as any);
    const result = await response.json() as { error: string };

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized');
  });

  test('returns data if access control passes', async () => {
    const context = {
      params: { table: 'test-table' },
      locals: { runtime: { env: {} } },
      request: { url: 'http://localhost/api/v1/test-table' },
    };

    const mockData = { data: [{ id: 1, name: 'test' }] };

    (getApiAccessControlResult as any).mockResolvedValue(true);
    (getRecords as any).mockResolvedValue(mockData);
    (getItemReadResult as any).mockResolvedValue(true);

    const response = await GET(context as any);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual(mockData);
  });
});