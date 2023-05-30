import app from "../../../server";

describe("Test the admin", () => {

  it("admin should return 200", async () => {
    const res = await app.request("http://localhost/admin/sites");
    expect(res.status).toBe(200);
  });
});
