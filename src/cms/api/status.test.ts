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

  // it('get should return results and 200', async () => {
  //   // await createCategoriesTestTable1(ctx);
  //   // await CreateTestCategory(ctx, 'cat 1');
  //   // await CreateTestCategory(ctx, 'cat 2');

  //   let req = new Request('http://localhost/status/20recordskv', {
  //     method: 'GET',
  //     headers: { 'Content-Type': 'application/json' }
  //   });
  //   let res = await app.fetch(req, ctx.env);
  //   expect(res.status).toBe(200);
  //   let body = await res.json();
  //   expect(body.data.length).toBe(2);
  // });
});
