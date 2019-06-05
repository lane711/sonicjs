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

    processPageBuilder: async function (page) {
        console.log('<==processPageBuilder', page);
        this.page = page;
        const $ = cheerio.load(page.html);

        let body = $('body');

        //load pb root index file
        let ui = await this.getPageBuilderUI();

        // console.log(pageBuilder);
        body.prepend(ui);

        return $.html();

    },

    getPageBuilderUI: async function () {
        let themePath = __dirname + '/../page-builder/page-builder.html';

        return new Promise((resolve, reject) => {
            fs.readFile(themePath, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    // console.log('data==>', data);
                    this.processTemplate(data).then(html => {
                        resolve(html);
                    })
                }
            });
        });
    },

    processTemplate: async function (html) {
        pageContent = ''; //reset
        // this.setupShortCodeParser();
        // console.log('=== processTemplate ===')
        const $ = cheerio.load(html);
        // $('#page-id').val(this.page.id);

        // $('.blog-header-logo').text(this.page.id);
        // $('.blog-post-title').text('Cheerio Post');
        // await this.processMenu($);

        await this.processSections($);

        // await this.processPageBuilder($);

        return $.html();
    },

    processSections: async function ($) {
        let sectionTemplate = $.html('.s--section');

        if (this.page.data && this.page.data.layout) {
            let sections = this.page.data.layout;

            // await this.asyncForEach(sections, async (sectionId) => {
            //     let section = await this.getContentById(sectionId);
            //     pageContent += `<section id='${section.id}' class="jumbotron-fluid">`;
            //     pageContent += '<div class="container">';
            //     await this.processRows($, sectionWrapper, section.data.rows)
            //     pageContent += '</div>';
            //     pageContent += `</section>`;

            //     // console.log(section);
            // });

            // sectionTemplate.append(pageContent);
        }
    },

}