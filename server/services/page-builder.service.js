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
        // console.log('<==processPageBuilder', page);
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
        let sectionWrapper = $('.s--section').parent();
        sectionWrapper.empty();

        console.log('sectionTemplate', sectionTemplate);

        if (this.page.data && this.page.data.layout) {
            let sections = this.page.data.layout;

            await this.asyncForEach(sections, async (sectionId) => {
                let section = await this.getContentById(sectionId);
                pageContent += sectionTemplate.replace('{{section.data.title}}', section.data.title);
                // console.log(section);
                // pageContent += `${section.data.title}`;
                // await this.processRows($, sectionWrapper, section.data.rows)
 
                // console.log(section);
            });

            sectionWrapper.append(pageContent);
        }
    },

    processRows: async function ($, sectionWrapper, rows) {
        for (const row of rows) {
            pageContent += `<div class='row'>`;
            await this.processColumns(row)
            pageContent += `</div>`;
        }
    },

    processColumns: async function (row) {
        for (const column of row.columns) {
            // console.log('== column ==')
            pageContent += `<div class='${column.class}'>`;
            pageContent += `${column.content}`;
            await this.processBlocks(column.content);
            pageContent += `</div>`;
        }
    },

    processBlocks: async function (blocks) {
        await this.processShortCodes(blocks);
    },


    processShortCodes: async function (body) {
        let bodyBlocks = ShortcodeTree.parse(body);
        if (bodyBlocks.children) {
            for (let bodyBlock of bodyBlocks.children) {
                let shortcode = bodyBlock.shortcode;
                if (shortcode.name == "BLOCK") {
                    await this.replaceShortCode(shortcode)
                }
            }
        }
    },

    getContentById: async function (id) {
        let url = `${apiUrl}contents/${id}`;
        // console.log('url', url);
        let page = await axios.get(url);
        page.data.html = undefined;
        // console.log('getContent', page.data);
        return page.data;
    },

    asyncForEach: async function (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

}