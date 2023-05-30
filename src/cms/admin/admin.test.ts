import app from "../../server"

describe('Test the application', () => {
  it('ping should return 200', async () => {
    const res = await app.request('http://localhost/admin/ping')
    expect(res.status).toBe(200)
  })

})