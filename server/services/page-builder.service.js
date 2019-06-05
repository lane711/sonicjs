var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;

const apiUrl = 'http://localhost:3000/api/';
var pageContent = '';
var page;
var id;

module.exports = {

    foo: function () {
        return 'bar';
    },

    processPageBuilder: async function (html) {
        console.log('<==processPageBuilder');

        const $ = cheerio.load(html);

        let body = $('body');

        //load pb root index file
        let ui = await this.getPageBuilderUI();

        // console.log(pageBuilder);
        body.prepend(ui);

        return $.html();

    },

    getPageBuilderUI: async function (){
        let themePath = __dirname + '/../page-builder/page-builder.html';

        return new Promise((resolve, reject) => {
            fs.readFile(themePath, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    // console.log('data==>', data);
                    resolve(data);
                    // this.processTemplate(data).then(html => {
                    //     resolve(html);
                    // })
                }
            });
        });
    },

}