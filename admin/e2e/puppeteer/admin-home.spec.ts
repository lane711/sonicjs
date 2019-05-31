const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
//   console.log(page);
  await page.goto('http://localhost:4200/admin');
  await page.screenshot({path: 'screenshots/admin-home.png'});

  await browser.close();
})();

// describe('ContentTypesComponent', () => {
//   //   it('should create', () => {

//   //     (async () => {
//   //       const browser = await puppeteer.launch();
//   //       const page = await browser.newPage();
//   //     //   console.log(page);
//   //       await page.goto('http://localhost:4200/admin/content-types');
//   //       await page.screenshot({path: 'screenshots/admin-content-types.png'});
      
//   //       await browser.close();
//   //     })();

//   //   expect(true).toBeTruthy();
//   // });
// });
