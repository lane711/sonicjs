import app from "../../server"

const env = getMiniflareBindings()

describe('Test the status url', () => {
  it('ping should return 200', async () => {
    const res = await app.request('http://localhost/status')
    expect(res.status).toBe(200)
  })

  it('log should return 200', async () => {
    const res = await app.request('http://localhost/status/log')
    expect(res.status).toBe(200)
  })


})