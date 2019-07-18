var dataService = require('./data.service');

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
        console.log('getList data ====>', data);
        var result = template(data);

        console.log('resulr', result);

        return result;
    },

    getHandlebarsTemplate: async function (contentType) {
        let themePath = __dirname + '/../views/partials/blog.handlebars';

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