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
        eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
            if (options && options.page) {
                await mediaService.processHeroImage(options.page);
            }
        });
    },

    processHeroImage: async function (page) {
        // if (page.data.heroImage[0]) {
        //     page.data.heroImage = page.data.heroImage[0].originalName;
        // }

        let jumbotronStyle = "background:pink;"
        page.data.jumbotronStyle = jumbotronStyle;
    },

    getMedia: async function () {
        let url = '/api/containers/container1/files';
        return axios.get(url)
        .then(async function (record) {
            if (record.data) {
                return record.data;
            }
            return 'not found';
        })
        .catch(function (error) {
            console.log(error);
        });
    },
}