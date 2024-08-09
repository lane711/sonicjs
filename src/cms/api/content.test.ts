import { content as app } from './content';
const env = getMiniflareBindings();

describe('Test the content api', () => {
  test('List', async () => {
    const res = await app.fetch(new Request('http://localhost/ping'), env);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).not.toBeUndefined();
    // expect(body['posts'].length).toBe(0)
  });
});

let newPostId = '';

test('CRUD', async () => {
  // POST /posts
  // let payload = JSON.stringify({ title: 'Morning', body: 'Good Morning',table:'posts' })
  // let req = new Request('http://localhost/v1/posts', {
  //   method: 'POST',
  //   body: payload,
  //   headers: { 'Content-Type': 'application/json' },
  // })
  // let res = await app.fetch(req, env)
  // expect(res.status).toBe(201)
  // let body = await res.json<{ post: Post }>()
  // const newPost = body['post']
  // expect(newPost.title).toBe('Morning')
  // expect(newPost.body).toBe('Good Morning')
  // newPostId = newPost.id
});
