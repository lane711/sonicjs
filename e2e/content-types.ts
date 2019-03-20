const puppeteer = require('puppeteer');
const shortid = require('shortid');
const LoremIpsum = require("lorem-ipsum").LoremIpsum;

(async () => {
    const browser = await puppeteer.launch({
        headless:false
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:4200/admin/content-types');

    await page.click('.new-content-type');

    await page.waitFor('input[id=systemid]');

    await page.focus('input[id=systemid]')
    await page.keyboard.type('testSystemId')

    await page.focus('input[id=name]')
    await page.keyboard.type('testName')

    await page.focus('input[id=description]')
    await page.keyboard.type('Ipsum de lor description')

    await page.click('.save');

    //await page.screenshot({path: 'example.png'});
  
    //await browser.close();
  })();