import app from '../../server';
import { getTestingContext } from '../util/testing';

const ctx = getTestingContext();

describe('Test the status url', () => {
  it('status should return 200', async () => {
    const res = await app.fetch(
      new Request('http://localhost/status'),
      ctx.env
    );
    expect(res.status).toBe(200);
    let body = await res.json();
  });

  it('log should return 200', async () => {
    const res = await app.fetch(
      new Request('http://localhost/status/log'),
      ctx.env
    );
    expect(res.status).toBe(200);
    let body = await res.json();
  });
});
