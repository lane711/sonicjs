var pageBuilderService = require('.//page-builder.service');
var formService = require('.//form.service');
var listService = require('.//list.service');
var menuService = require('.//menu.service');
var helperService = require('.//helper.service');


var dataService = require('.//data.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;
var eventBusService = require('./event-bus.service');


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

    getRenderedPage: async function(req){

        // eventBusService.emit('getRenderedPagePreDataFetch', req);

        this.page = await dataService.getContentByUrl(req.url);
        if (this.page.data[0]) {
            await this.getPage(this.page.data[0].id, this.page.data[0]);
            let page = this.page.data[0];
            this.page.data.html = pageContent;
        }

        this.page.data.eventCount = 0;

        await eventBusService.emit('getRenderedPagePostDataFetch', {req: req, page: this.page});

        // if (pageRecord.data[0]) {
        //     await this.getPage(pageRecord.data[0].id, pageRecord.data[0]);
        //     let page = pageRecord.data[0];
        //     page.data.html = pageContent;
        //     return page;
        // }

        // this.page.data.menu = await menuService.getMenu('Main');


        let rows = [];
        this.page.data.hasRows = false;
        if(this.page.data.layout){
            this.page.data.rows = this.page.data.layout.rows;
            this.page.data.hasRows = true;
        }
        // this.page.data.siteSettings = await dataService.getContentTopOne('site-settings');
        // console.log('this.page.data.siteSettings', this.page.data.siteSettings);
        // console.log('getRenderedPage page ====>', this.page.data.heroImage[0].originalName);
        // if(this.page.data.heroImage){
        //     this.page.data.heroImage = this.page.data.heroImage[0].originalName;
        // }

        // var events = eventBusService.listeners('getRenderedPagePostDataFetch');
        // var eventCount = eventBusService.listenerCount('getRenderedPagePostDataFetch');

        //wait till all events finished
        // while (this.page.data.eventCount < eventCount) {
        //     //wait
        // }

        return { page: this.page };
        // return{ id:this.page.id, title: this.page.data.name, rows: rows, 
        //   sections: this.page.data.sections, html: this.page.data.html, menu: menu, page: this.page };
    },

    invokeEmitter: async function (id, instance) {
        return
    },

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
                this.page = await dataService.getContentById(id);
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

    getBlog: async function(req){
        let blog = await dataService.getContentByUrl(req.url);
        blog = blog.data[0]
        if (blog) {
            blog.data.menu = await menuService.getMenu('Main');

            if(blog.data.image){
                blog.data.heroImage = blog.data.image[0].originalName;
            }
            // let page = this.page.data[0];
            // this.page.data.html = pageContent;
            return blog;
        }
        return 'error';
    },

    getPageByUrl: async function (id, instance) {
    },

    // getSandboxPage: async function (id, instance) {
    //     let themePath = __dirname + '/../assets/html/sandbox.html';

    //     return new Promise((resolve, reject) => {
    //         fs.readFile(themePath, "utf8", (err, data) => {
    //             if (err) {
    //                 console.log(err);
    //                 reject(err);
    //             }
    //             else {
    //                 console.log('data==>', data);
    //                 this.processTemplate(data).then(html => {
    //                     resolve('sandbox');
    //                 })
    //             }
    //         });
    //     });
    // },

    processTemplate: async function (html) {
        pageContent = ''; //reset
        // this.setupShortCodeParser();
        // console.log('=== processTemplate ===')
        const $ = cheerio.load(html);


        await this.processSections($);

        // await this.processPageBuilder($);
        // console.log('section content', pageContent);

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

        let menuItems = await dataService.getContent('menu');
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


                let section = await dataService.getContentById(sectionId);
                pageContent += `<section data-id='${section.id}' class="jumbotron-fluid">`;
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
                    await this.replaceBlockShortCode(shortcode)
                }
                if (shortcode.name == "FORM") {
                    await this.replaceFormShortCode(shortcode)
                }
                if (shortcode.name == "LIST") {
                    await this.replaceListShortCode(shortcode)
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

    replaceBlockShortCode: async function (shortcode) {
        let blockId = shortcode.properties.id;
        let content = await dataService.getContentById(blockId);
        // console.log('replaceShortCode.getContentById', content);
        let newBody = `<span data-id="${blockId}">${content.data.body}</span>`;
        pageContent = pageContent.replace(shortcode.codeText, newBody);
    },


    replaceFormShortCode: async function (shortcode) {
        let blockId = shortcode.properties.id;
        let contentType = shortcode.properties.contentType;

        let form = await formService.getForm(contentType);
        // console.log('replaceFormShortCode.form', form);
        let newBody = form;
        pageContent = pageContent.replace(shortcode.codeText, newBody);
    },

    replaceListShortCode: async function (shortcode) {
        let blockId = shortcode.properties.id;
        let contentType = shortcode.properties.contentType;

        let list = await listService.getList(contentType);
        pageContent = pageContent.replace(shortcode.codeText, list);
    },

    asyncForEach: async function (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

}