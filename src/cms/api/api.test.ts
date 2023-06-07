import app from "../../server"


describe('Test the application', () => {
  it('ping should return 200', async () => {
    const res = await app.request('http://localhost/v1/ping')
    expect(res.status).toBe(200)
  })

  it('forms should return 200', async () => {
    const res = await app.request('http://localhost/v1/forms')
    expect(res.status).toBe(200)
  })
})