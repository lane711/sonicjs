var dataService = require('./data.service');
var viewService = require('./view.service');

var helperService = require('./helper.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;

var handlebars = require('handlebars');


module.exports = {

    getList: async function (contentType) {

        var data = await dataService.getContentByType(contentType);

        let viewModel = data.map(function (record) {
            return {
                title: record.data.title,
                body: helperService.truncateString(record.data.body, 400),
                image: dataService.getImage(record.data.image[0]),
                url: record.data.url
            };
        });

        var result = await viewService.getProccessedView(contentType, viewModel);

        return result;
    },

}