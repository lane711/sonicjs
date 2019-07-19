var dataService = require('./data.service');
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

        var source = await this.getHandlebarsTemplate(contentType);
        var template = handlebars.compile(source);

        // var data = {
        //     "name": "Alan", "hometown": "Somewhere, TX",
        //     "kids": [{ "name": "Jimmy", "age": "12" }, { "name": "Sally", "age": "4" }]
        // };
        var data = await dataService.getContent(contentType);

        let viewModel = data.map(function (record) {
            return {
                title: record.data.title,
                body: helperService.truncateString(record.data.body, 400),
                image: dataService.getImage(record.data.image[0]),
                url: record.data.url
            };
        });
        console.log('getList data ====>', data);
        console.log('getList viewModel ====>', viewModel);

        var result = template(viewModel);

        // console.log('resulr', result);

        return result;
    },

    getHandlebarsTemplate: async function (contentType) {
        let themePath = __dirname + `/../views/partials/${contentType}/list.handlebars`;

        return new Promise((resolve, reject) => {
            fs.readFile(themePath, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    // console.log('getHandlebarsTemplate==>', data);
                    resolve(data);
                }
            });
        });
    }
}