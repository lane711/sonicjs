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
        emitterService.on('requestBegin', async function (options) {
            if(options){
                await siteSettingsService.processSiteSettings(options);
            }
        });
    },

    processSiteSettings: async function (options) {
        var siteSettings =  await dataService.getContentTopOne('site-settings', options.req.sessionID);
        options.req.siteSettings = siteSettings.data;
    }
}
