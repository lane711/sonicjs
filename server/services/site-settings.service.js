var dataService = require('./data.service');
var helperService = require('./helper.service');
var emitterService = require('./emitter.service');

var fs = require('fs');
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;



module.exports = siteSettingsService = {

    startup: async function () {
        emitterService.on('getRenderedPagePostDataFetch', async function (options) {
            if(options){
                await siteSettingsService.processSiteSettings(options.page);
            }
        });
    },

    processSiteSettings: async function (page) {
        var siteSettings =  await dataService.getContentTopOne('site-settings');
        page.data.siteSettings = siteSettings.data;
    }
}
