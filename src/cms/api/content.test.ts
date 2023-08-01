import app from "../../server";

describe("Test the content api", () => {
  it("ping should return 200", async () => {
    const res = await app.request("http://localhost/v1/content/ping");
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
});
