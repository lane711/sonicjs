const puppeteer = require('puppeteer');
const shortid = require('shortid');
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const { assert } = require('chai'); 

(async () => {
    const browser = await puppeteer.launch({
        headless:false,
        args: [`--window-size=${1080},${680}`] // new option
    });
    
    const page = await browser.newPage();
    await page.setViewport({
        width: 1080,
        height: 680
    });

    await page.goto('http://localhost:3018/admin/content-types');

    //login
    await page.focus('input[id=email]')
    await page.keyboard.type('a@a.com')

    await page.focus('input[id=password]')
    await page.keyboard.type('tiger44')

    await page.click('#login-submit');



    //create new content type
    await page.click('.new-content-type');

    await page.waitFor('input[id=systemid]');
    await page.focus('input[id=systemid]')
    await page.keyboard.type('testSystemId')

    await page.focus('input[id=name]')
    await page.keyboard.type('testName')

    await page.focus('input[id=description]')
    await page.keyboard.type('Ipsum de lor description')

    await page.click('.save');

    //verify new content type
    let foo = 'bar';
    assert.lengthOf(foo, 3, 'foo`s value has a length of 3');
    
    await page.waitFor('.edit-content-type');
    const element = await page.$(".edit-content-type");
    assert.isNotNull(element);
  
    //add new field
    await page.click('.add-field');
    await page.waitFor('.textBox');
    await sleep(500)
    await page.click('.textBox');
    await page.waitFor('.field-edit-1');
    await page.click('.field-edit-1');

    //edit field properties
    await page.focus('input[id=label]')
    await page.keyboard.type('xXxX')
    await page.$eval('.aside-menu .save', elem => elem.click());

    //delete content type

    await browser.close();

    
  })();

  function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}