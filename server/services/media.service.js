var dataService = require('./data.service');
var helperService = require('./helper.service');
var eventBusService = require('./event-bus.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;



module.exports = mediaService = {

    startup: async function () {
        console.log('>>=== media startup');

        eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
            console.log('>>=== media executing');
            await mediaService.processHeroImage(options.page);
        });
    },

    processHeroImage: async function (page) {
        if (page.data.heroImage) {
            page.data.heroImage = page.data.heroImage[0].originalName;
        }
    }
}