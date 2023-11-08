import { extraTableFromUrl } from "./helpers";

describe("Utilities Tests", () => {
  it("extraTableFromUrl should return table name", async () => {
    const url1 = extraTableFromUrl('http://0.0.0.0:8788/admin/api/users?limit=10&offset=0')
    expect(url1).toBe('users');

    const url2 = extraTableFromUrl('http://0.0.0.0:8788/v1/users?limit=2&offset=2&sortBy=createdOn&sortDirection=desc')
    expect(url2).toBe('users');

    const url3 = extraTableFromUrl('http://0.0.0.0:8788/v1/users/858656bb-8afe-4005-b652-9f3c65339c02')
    expect(url3).toBe('users');

    //for tests
    const url4 = extraTableFromUrl('http://localhost/v1/users/a')
    expect(url4).toBe('users');

  });
});