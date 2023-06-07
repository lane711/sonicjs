import app from "../../server";

describe("Test the content api", () => {

  it("admin should return 200", async () => {
    const res = await app.request("http://localhost/v1/contnet");
    expect(res.status).toBe(200);
  });
});
