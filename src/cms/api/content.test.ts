import app from "../../server";

describe("Test the content api", () => {

  it("admin should return 200", async () => {
    const res = await app.request("http://localhost/api/contnet");
    expect(res.status).toBe(200);
  });
});
