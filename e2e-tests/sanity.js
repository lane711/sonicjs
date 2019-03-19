const puppeteer = require('puppeteer');
 
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4200/admin');
  await page.screenshot({path: 'adminHome.png'});
 
  await browser.close();
})();