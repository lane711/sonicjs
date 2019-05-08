'use strict';
const puppeteer = require('puppeteer');

module.exports = function(E2etest) {

    E2etest.status = function (cb) {
        var response = new Date();
        cb(null, response);
      };
    
      E2etest.remoteMethod(
        'status', {
          http: {
            path: '/status',
            verb: 'get',
          },
          returns: {
            arg: 'status',
            type: 'string',
          },
        }
      );

      E2etest.initE2ETests = function (cb) {
        var response = new Date();

        (async () => {
            const browser = await puppeteer.launch({
                headless:false
            });
            const page = await browser.newPage();
            await page.goto('http://localhost:4200/admin/content-types');
            await page.click('.clickButton');
            await page.screenshot({path: 'example.png'});
          
            await browser.close();
          })();

        cb(null, 'ipsum de 123');
      };
    
      E2etest.remoteMethod(
        'initE2ETests', {
          http: {
            path: '/inite2etests',
            verb: 'get',
          },
          returns: {
            arg: 'status',
            type: 'string',
          },
        }
      );

};
