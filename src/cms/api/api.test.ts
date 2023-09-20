import app from "../../server";

const env = getMiniflareBindings();

describe("Test the application", () => {
  it("ping should return 200", async () => {
    const res = await app.request("http://localhost/v1/ping");
    expect(res.status).toBe(200);
  });

  it("kvtest should return 200", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/cache/kv"),
      env
    );
    expect(res.status).toBe(200);
  });

  it("forms should return 200", async () => {
    const res = await app.request("http://localhost/v1/forms");
    expect(res.status).toBe(200);
  });
});

describe("auto endpoints", () => {
  it("post should return 204", async () => {
    let payload = JSON.stringify({ firstName: "Joe" });
    let req = new Request("http://localhost/v1/users", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });
    let res = await app.fetch(req, env);
    expect(res.status).toBe(201);
    let body = await res.json<{ post: Post }>();
    const newPost = body["post"];
    expect(newPost.title).toBe("Morning");
    expect(newPost.body).toBe("Good Morning");
    // newPostId = newPost.id;

    // const res = await app.post('http://localhost/v1/users', {firstName: 'Joe'})
    // expect(res.status).toBe(204)
  });
});
