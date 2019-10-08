var dataService = require('./data.service');
var helperService = require('./helper.service');
var eventBusService = require('./event-bus.service');

const axios = require('axios');


module.exports = cssService = {

    startup: async function () {
        // eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
        //     if (options) {
        //         await mediaService.processHeroImage(options.page);
        //     }
        // });
    },

    getGeneratedCss: async function () {
        let css = 'body {background:lightblue;}';
        return css;
    }

}