import { chromium } from '@playwright/test'
const BASE = 'https://sonicjs-pr-lane711-m5aa1.ldc0618847.workers.dev'
const b = await chromium.launch()
const ctx = await b.newContext({ baseURL: BASE })
await ctx.request.post('/auth/seed-admin').catch(()=>{})
await ctx.request.post('/auth/sign-in/email', { data:{email:'admin@sonicjs.com',password:'sonicjs!'}, headers:{'Content-Type':'application/json',Origin:BASE} })
const p = await ctx.newPage()
let stalls = 0
for (let round=1; round<=12; round++) {
  const line = []
  for (const u of ['/admin','/admin/content','/admin/content/new']) {
    const t = Date.now()
    try { await p.goto(u,{waitUntil:'domcontentloaded',timeout:30000}); line.push(`${u}=${Date.now()-t}ms`) }
    catch { line.push(`${u}=STALL>${Date.now()-t}ms`); stalls++ }
  }
  console.log(`r${round}: ${line.join('  ')}`)
}
console.log('STALLS:', stalls, '/ 36')
await b.close()
