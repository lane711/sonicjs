// import app from "../../server";
import {content as app} from './content';
const env = getMiniflareBindings()

describe("Test the content api", () => {
  test('List', async () => {
    const res = await app.fetch(new Request('http://localhost/ping'), env)
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).not.toBeUndefined()
    // expect(body['posts'].length).toBe(0)
  })
  
  it("ping should return 200", async () => {
    const res = await app.request("http://localhost/ping");
    expect(res.status).toBe(200);
  });

  it("kvtest should return 200", async () => {
    const res = await app.request("http://localhost/v1/content/kvtest");
    expect(res.status).toBe(200);
  });
  it("content root should return 200", async () => {
    const res = await app.request("http://localhost/v1/content");
    expect(res.status).toBe(200);
  });

  it('kvtest should return 200', async () => {
    const res = await app.fetch(new Request('http://localhost/v1/content/kvtest'), env)
    expect(res.status).toBe(200)
  })
});

let newPostId = ''

test('CRUD', async () => {
  // POST /posts
  let payload = JSON.stringify({ title: 'Morning', body: 'Good Morning',table:'posts' })
  let req = new Request('http://localhost', {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' },
  })
  let res = await app.fetch(req, env)
  expect(res.status).toBe(201)
  let body = await res.json<{ post: Post }>()
  const newPost = body['post']
  expect(newPost.title).toBe('Morning')
  expect(newPost.body).toBe('Good Morning')
  newPostId = newPost.id
});