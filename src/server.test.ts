import app from './server';
import { getTestingContext } from './cms/util/testing';

const ctx = getTestingContext();

describe('Test the APIs', () => {
  it('ping should return 200', async () => {
    const res = await app.fetch(
      new Request('http://localhost/status'),
      ctx.env
    );
    expect(res.status).toBe(200);
    let body = await res.json();
  });
});
