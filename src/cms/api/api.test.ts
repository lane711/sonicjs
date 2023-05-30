import app from "../../server"


describe('Test the application', () => {
  it('ping should return 200', async () => {
    const res = await app.request('http://localhost/api/ping')
    expect(res.status).toBe(200)
  })

  it('forms should return 200', async () => {
    const res = await app.request('http://localhost/api/forms')
    expect(res.status).toBe(200)
  })
})