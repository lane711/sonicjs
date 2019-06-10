var pageBuilderService = require('.//page-builder.service');
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

    // getContentUrls: async function (id, instance) {
    //     ret
    // },

    getPage: async function (id, instance) {
        if (!id) {
            return;
        }
        // log(chalk.green(id));
        this.id = id;
        if (instance) {
            this.page = instance;
        }
        else {
            if (id) {
                this.page = await this.getContentById(id);
            }

        }
        // console.log('id',id, instance);
        let themePath = __dirname + '/../themes/base/index.html';

        return new Promise((resolve, reject) => {
            fs.readFile(themePath, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    // console.log('data==>', data);
                    this.processTemplate(data).then(html => {
                        resolve('ok');
                        // console.log('getPage.page-->', html.length);
                        // this.page.data.body = html;
                        // pageBuilderService.processPageBuilder(this.page).then(pagebuilder => {
                        //     // console.log('page-->2', pagebuilder.length);
                        //     this.page.data.pagebuilder = pagebuilder;

                        //     resolve(html);
                        // })

                    })
                }
            });
        });

    },

    getPageByUrl: async function (id, instance) {
    },

    processTemplate: async function (html) {
        pageContent = ''; //reset
        // this.setupShortCodeParser();
        // console.log('=== processTemplate ===')
        const $ = cheerio.load(html);


        await this.processSections($);

        // await this.processPageBuilder($);
        console.log('section content', pageContent);

        return $.html();
    },

    // processPageBuilder: async function ($) {

    //     let body = $('body');

    //     //load pb root index file
    //     let ui = await this.getPageBuilderUI();

    //     // console.log(pageBuilder);
    //     body.prepend(ui);
    // },

    // getPageBuilderUI: async function (){
    //     let themePath = __dirname + '/../page-builder/page-builder.html';

    //     return new Promise((resolve, reject) => {
    //         fs.readFile(themePath, "utf8", (err, data) => {
    //             if (err) {
    //                 console.log(err);
    //                 reject(err);
    //             }
    //             else {
    //                 // console.log('data==>', data);
    //                 resolve(data);
    //                 // this.processTemplate(data).then(html => {
    //                 //     resolve(html);
    //                 // })
    //             }
    //         });
    //     });
    // },

    processMenu: async function ($) {

        let menuItemTemplate = $.html('.s--menu-item');
        let navWrapper = $('.s--menu-item').parent();
        navWrapper.empty();

        let menuItems = await this.getContent('menu');
        // console.log('menuItems', menuItems);
        menuItems.forEach(menuItem => {
            // console.log('menuItem', menuItem);
            let item = menuItemTemplate.replace("Home", menuItem.data.name)
                .replace('#', menuItem.url)
            navWrapper.append(item);
        });
    },

    processSections: async function ($) {

        this.page.data.sections = [];
        let sectionWrapper = $('.s--section').parent(); //container
        sectionWrapper.empty();

        let page = this.page; // await this.getContentById('5cd5af93523eac22087e4358');
        // console.log('processSections:page==>', page);

        if (page.data && page.data.layout) {
            let sections = page.data.layout;

            await this.asyncForEach(sections, async (sectionId) => {


                let section = await this.getContentById(sectionId);
                pageContent += `<section id='${section.id}' class="jumbotron-fluid">`;
                pageContent += '<div class="container">';
                let rows = await this.processRows($, sectionWrapper, section.data.rows)
                pageContent += '</div>';
                pageContent += `</section>`;

                this.page.data.sections.push({id : sectionId, title: section.data.title,  rows: rows});


                // console.log('section==>', section);
            });

            // console.log('section====>', this.page.data.sections);


            sectionWrapper.append(pageContent);
        }

    },

    //TODO loop thru rows
    processRows: async function ($, sectionWrapper, rows) {
        let rowArray = [];
        for (const row of rows) {
            // console.log(chalk.red(JSON.stringify(row)));
            pageContent += `<div class='row'>`;
            let columns = await this.processColumns(row);
            pageContent += `</div>`;

            rowArray.push(row);
        }
        // console.log('rowArray---->', rowArray);
        return rowArray;
    },

    processColumns: async function (row) {
        let columnArray = [];
        for (const column of row.columns) {

            // console.log('== column ==', column);
            pageContent += `<div class='${column.class}'>`;
            pageContent += `${column.content}`;
            await this.processBlocks(column.content);
            pageContent += `</div>`;
            columnArray.push(column);
        }
        return columnArray;
    },

    processBlocks: async function (blocks) {
        await this.processShortCodes(blocks);
        // const parser = Shortcode();

        // await parser.add('BLOCK', tag=>{ 
        //     let blockId = tag.attributes.id
        //     console.log('in parser callback blockId:-->', blockId);
        //     // this.processBlock(blockId);
        //     return blockId;
        // });

        // await parser.add('BLOCK', tag=>{ // add handler for CONTENT tag
        //     return new Promise(async (resolve, reject)=>{ // Use the id attribute of the tag to do a lookup-up
        //         try{
        //             let blockId = tag.attributes.id
        //             // console.log('in parser callback blockId:-->', blockId);
        //             // await this.processBlock(blockId);
        //             return blockId;
        //         }
        //         catch(error){
        //             console.log(error);
        //         }frowarr
        //     });
        // });

        // await parser.parse(blocks).then(blockId =>{
        //     // console.log('parser resolve', blockId);
        //     // await this.processBlock(blockId);

        // })
    },

    // processBlocks: async function (blocks) {

    //     let blockIds = await this.processShortCodes(blocks);
    //     // console.log('blockIds', blockIds);
    //     for(const blockId of blockIds){
    //         await this.processBlock(blockId);
    //     }

    // },

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

    // setupShortCodeParser: async function(){
    //     await parser.add('BLOCK', tag=>{ 
    //                         try{
    //                 let blockId = tag.attributes.id
    //                 console.log('in parser callback blockId:-->', blockId);
    //                 await this.processBlock(blockId);
    //                 return blockId;
    //             }
    //             catch(error){
    //                 console.log(error);
    //             }
    //         // let blockId = tag.attributes.id
    //         // console.log('in parser callback blockId:-->', blockId);
    //         // await this.processBlock(blockId);
    //         // return blockId;
    //     });
    // },

    replaceShortCode: async function (shortcode) {
        let blockId = shortcode.properties.id;
        let content = await this.getContentById(blockId);
        // console.log('replaceShortCode.getContentById', content);
        let newBody = `<span data-id="${blockId}">${content.data.body}</span>`;
        pageContent = pageContent.replace(shortcode.codeText, newBody);
    },

    getContent: async function (contentType) {

        const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
        //axios.get(apiUrl + `contents?filter=${filter}`)
        let url = `${apiUrl}contents?filter=${filter}`;
        // console.log('url', url);
        let page = await axios.get(url);
        // page.data.html = 'delete this';
        // console.log('getContent', page.data);
        return page.data;
    },

    getContentByUrl: async function (pageUrl, contentType) {
        // log(chalk.red('getContentByUrl', pageUrl))
        const filter = `{"where":{"and":[{"url":"${pageUrl}"},{"data.contentType":"${contentType}"}]}}`;
        // log(chalk.red('filter', filter));
        const encodedFilter = encodeURI(filter);
        let url = `${apiUrl}contents?filter=${encodedFilter}`;
        // console.log('getContentByUrlurl', url);
        let pageRecord = await axios.get(url);
        // console.log('getContentByUrl:page.data', page.data[0]);
        //now render page
        if (pageRecord.data[0]) {
            await this.getPage(pageRecord.data[0].id, pageRecord.data[0]);
            let page = pageRecord.data[0];
            page.data.html = pageContent;
            console.log(page);
            return page;
        }
        // page.data[0].data.html = html;

        return 'not found';
    },

    getContentById: async function (id) {
        let url = `${apiUrl}contents/${id}`;
        // console.log('url', url);
        let content = await axios.get(url);
        //page.data.html = undefined;
        // console.log('getContent', page.data);
        return content.data;
    },

    // getMenuItems: async function () {
    //     let data;
    //     let contentType = 'menu';
    //     const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
    //     //axios.get(apiUrl + `contents?filter=${filter}`)
    //     await axios.get('http://localhost:3000/api/contents?filter=%7B%22where%22%3A%7B%22data.contentType%22%3A%22menu%22%7D%7D')
    //         .then(function (response) {
    //             // handle success
    //             // console.log('menu items ==>', response.data);
    //             data = response.data;
    //         })
    //         .catch(function (error) {
    //             // handle error
    //             console.log(error);
    //         })
    //         .then(function () {
    //             // always executed
    //         });
    //     return data;
    // },

    asyncForEach: async function (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }


    // async getContentByType(contentType) {
    //   const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
    //   let url = environment.apiUrl + `contents?filter=${filter}`;
    //   return this.http.get(url).toPromise();
    // }

}