var dataService = require('./data.service');
var helperService = require('./helper.service');
var eventBusService = require('./event-bus.service');
const css = require('css');
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

        var ast = css.parse('body {background:lightblue;}');

        let cssFile = css.stringify(ast);
        return cssFile; 
    }

}